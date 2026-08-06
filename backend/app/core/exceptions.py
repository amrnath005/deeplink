"""DeepLink platform custom exceptions and exception handlers."""

from fastapi import HTTPException, status


class DeepLinkException(Exception):
    """Base exception for all DeepLink platform errors."""
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class LinkNotFoundException(DeepLinkException):
    def __init__(self, identifier: str):
        super().__init__(
            message=f"Smart link '{identifier}' was not found or is inactive.",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class LinkExpiredException(DeepLinkException):
    def __init__(self, identifier: str):
        super().__init__(
            message=f"Smart link '{identifier}' has expired or reached its maximum click limit.",
            status_code=status.HTTP_410_GONE,
        )


class LinkPasswordProtectedException(DeepLinkException):
    def __init__(self):
        super().__init__(
            message="This smart link is password protected.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class AliasTakenException(DeepLinkException):
    def __init__(self, alias: str):
        super().__init__(
            message=f"Custom alias '{alias}' is already in use.",
            status_code=status.HTTP_409_CONFLICT,
        )


class InvalidURLError(DeepLinkException):
    def __init__(self, url: str):
        super().__init__(
            message=f"Provided URL '{url}' is invalid. Must start with http:// or https://",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )


def handle_deeplink_exception(exc: DeepLinkException) -> HTTPException:
    """Convert DeepLinkException to FastAPI HTTPException."""
    return HTTPException(status_code=exc.status_code, detail=exc.message)
