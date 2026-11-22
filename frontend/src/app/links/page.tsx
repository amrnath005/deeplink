"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Link2, PlusCircle, Search, RefreshCw, Copy, Check, ExternalLink, Download, AlertCircle } from "lucide-react";
import { QRCodeModal } from "@/components/modals/QRCodeModal";

export default function LinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedQr, setSelectedQr] = useState<{ shortUrl: string; qrCodeUrl: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      if (data.success) {
        setLinks(data.links || []);
      } else {
        setError(data.error || "Failed to load links");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching links");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const filteredLinks = useMemo(() => {
    return links.filter(
      (l) =>
        l.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.originalUrl.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [links, searchQuery]);

  const totalPages = Math.ceil(filteredLinks.length / pageSize) || 1;
  const paginatedLinks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLinks.slice(start, start + pageSize);
  }, [filteredLinks, currentPage]);

  const handleCopy = (shortUrl: string, id: string) => {
    const fullUrl = window.location.origin + shortUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#08090a] text-white font-sans">
      <DashboardNav />

      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/[0.08]">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Smart Links Directory</h1>
            <p className="text-xs text-slate-400 mt-1">Manage mobile campaign shortlinks, target schemes, vector QR codes, and fallback URLs.</p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <button onClick={fetchLinks} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono transition-colors">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} /> Refresh
            </button>
            <a href="/links/new" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors shadow">
              <PlusCircle className="h-4 w-4" /> Create Smart Link
            </a>
          </div>
        </header>

        {/* Search & Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by alias or destination URL..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-white/10 bg-[#0c0d12] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <span className="text-slate-400 text-xs">
            Showing {paginatedLinks.length} of {filteredLinks.length} Smart Links
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Table */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-6">
          {loading ? (
            <div className="py-16 text-center text-xs font-mono text-slate-400 space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-400 mx-auto" />
              <p>Fetching smart links from database...</p>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="py-16 text-center text-xs font-mono text-slate-400 space-y-4">
              <Link2 className="h-8 w-8 text-slate-500 mx-auto" />
              <p>No smart links found matching your search query.</p>
              <a href="/links/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors">
                <PlusCircle className="h-4 w-4" /> Create New Smart Link
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-white/[0.08] text-[11px] uppercase">
                    <th className="pb-3 font-semibold">Short Link</th>
                    <th className="pb-3 font-semibold">Destination Target</th>
                    <th className="pb-3 font-semibold">Clicks</th>
                    <th className="pb-3 font-semibold">Conversions</th>
                    <th className="pb-3 font-semibold">Revenue</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {paginatedLinks.map((link) => (
                    <tr key={link.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <a href={link.shortUrl || `/${link.alias}`} target="_blank" rel="noreferrer" className="font-bold text-emerald-400 hover:underline flex items-center gap-1">
                            {link.shortUrl || `/${link.alias}`}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </td>
                      <td className="py-4 max-w-xs truncate text-slate-300">
                        {link.originalUrl}
                      </td>
                      <td className="py-4 font-bold text-white">
                        {(link.clicks || link.clicksCount || 0).toLocaleString()}
                      </td>
                      <td className="py-4 text-slate-300 font-bold">
                        {link.conversions || 0}
                      </td>
                      <td className="py-4 text-emerald-400 font-bold">
                        ${link.revenue || 0}
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          Active
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <button onClick={() => handleCopy(link.shortUrl || `/${link.alias}`, link.id)}
                          className="px-2.5 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                          {copiedId === link.id ? <Check className="h-3.5 w-3.5 text-emerald-400 inline" /> : <Copy className="h-3.5 w-3.5 inline" />}
                        </button>
                        <button onClick={() => setSelectedQr({ shortUrl: link.shortUrl || `/${link.alias}`, qrCodeUrl: link.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent("http://localhost:3000" + (link.shortUrl || `/${link.alias}`))}` })}
                          className="px-2.5 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                          QR Code
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 disabled:opacity-40 text-xs font-bold"
                  >
                    Previous
                  </button>
                  <span className="text-slate-400 text-xs">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 disabled:opacity-40 text-xs font-bold"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* QR Code Modal */}
      {selectedQr && (
        <QRCodeModal
          isOpen={true}
          onClose={() => setSelectedQr(null)}
          shortUrl={selectedQr.shortUrl}
          qrCodeUrl={selectedQr.qrCodeUrl}
        />
      )}
    </div>
  );
}
