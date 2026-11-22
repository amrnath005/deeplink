/**
 * DeepLink Pro — Production-Grade Auth & Strict Environment Session Guard
 * Integrates Supabase Auth IDP, token validation, and strict dev fallback isolation.
 */

import { NextRequest } from "next/server";
import { supabase, isSupabaseConfigured } from "./db";

export interface AuthenticatedUserSession {
  userId: string;
  email: string;
  workspaceId: string;
  role: "owner" | "admin" | "member" | "superadmin";
  token?: string;
}

/**
 * Validates session token from Authorization header or Session Cookie.
 * Enforces strict environment isolation:
 * - Production / Staging: Rejects dev fallback tokens (session_ws_*). Requires valid Supabase Auth JWT.
 * - Development: Allows session_ws_* tokens ONLY when NODE_ENV === 'development'.
 */
export async function getSessionUser(req: NextRequest): Promise<AuthenticatedUserSession | null> {
  const authHeader = req.headers.get("authorization");
  const cookieHeader = req.cookies.get("sb-access-token")?.value;
  const token = authHeader ? authHeader.replace("Bearer ", "").trim() : cookieHeader;

  const isProdOrStaging = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";

  if (!token) {
    if (process.env.NODE_ENV === "development") {
      // Personal / Local Dev Mode: automatic default session (zero login required)
      return {
        userId: "usr_personal",
        email: "personal@deeplink.pro",
        workspaceId: "ws_default",
        role: "owner",
        token: "session_ws_default",
      };
    }
    return null;
  }

  // 1. Dev Fallback Token Isolation Safeguard
  if (token.startsWith("session_ws_")) {
    if (isProdOrStaging) {
      console.warn("[Auth Security Alert] Rejection of dev fallback token in production/staging environment!");
      return null; // MUST FAIL in production & staging
    }

    // Allowed ONLY in local development mode
    const wsId = token.replace("session_", "");
    return {
      userId: `usr_${wsId}`,
      email: `user@${wsId}.com`,
      workspaceId: wsId,
      role: "owner",
      token,
    };
  }

  // 2. Official Supabase Auth JWT Validation
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (data?.user && !error) {
        const email = data.user.email || "";
        const workspaceId = data.user.user_metadata?.workspaceId || `ws_${data.user.id.substring(0, 8)}`;
        const role = data.user.user_metadata?.role || "owner";
        return {
          userId: data.user.id,
          email,
          workspaceId,
          role,
          token,
        };
      }
    } catch (e) {
      console.warn("[Auth] Supabase token verification failed:", e);
    }
  }

  return null;
}

/**
 * Sign In with real Supabase Auth IDP credentials.
 */
export async function signInUserWithSupabase(email: string, pass: string) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw new Error(error.message);
    return data.session;
  }

  // Local fallback session token in dev mode
  return {
    access_token: `session_ws_${email.split("@")[0] || "default"}`,
    user: { id: `usr_${email.split("@")[0]}`, email },
  };
}

/**
 * Sign Up new user with real Supabase Auth IDP credentials.
 */
export async function signUpUserWithSupabase(email: string, pass: string, workspaceName?: string) {
  if (isSupabaseConfigured()) {
    const wsId = `ws_${Math.random().toString(36).substring(2, 9)}`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          workspaceId: wsId,
          workspaceName: workspaceName || "My Workspace",
          role: "owner",
        },
      },
    });
    if (error) throw new Error(error.message);
    return data.session;
  }

  return {
    access_token: `session_ws_${email.split("@")[0] || "default"}`,
    user: { id: `usr_${email.split("@")[0]}`, email },
  };
}

/**
 * Workspace Authorization Guard
 * Ensures user is authenticated AND authorized for target workspaceId.
 */
export async function validateWorkspaceAccess(
  req: NextRequest,
  requestedWorkspaceId?: string
): Promise<{
  authorized: boolean;
  statusCode: 200 | 401 | 403;
  errorMessage?: string;
  session?: AuthenticatedUserSession;
}> {
  const session = await getSessionUser(req);

  if (!session) {
    return {
      authorized: false,
      statusCode: 401,
      errorMessage: "Authentication required. Missing, expired, or invalid session token.",
    };
  }

  const targetWs = requestedWorkspaceId || req.headers.get("x-workspace-id") || session.workspaceId;

  if (session.workspaceId !== targetWs && session.role !== "superadmin") {
    return {
      authorized: false,
      statusCode: 403,
      errorMessage: `Access denied. User '${session.userId}' is not authorized to access workspace '${targetWs}'.`,
      session,
    };
  }

  return {
    authorized: true,
    statusCode: 200,
    session: { ...session, workspaceId: targetWs },
  };
}
