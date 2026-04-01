"use client";

import { useState, useEffect } from "react";
import { Loader2, Database, Trash2, FileText, Globe, PlusCircle } from "lucide-react";

interface KnowledgeSource {
  id: string;
  title: string;
  source_type: string;
  chunk_count: number;
  created_at: string;
}

export default function BrainPage() {
  const [activeTab, setActiveTab] = useState<"text" | "url">("text");

  // Text Form
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");

  // URL Form
  const [urlTitle, setUrlTitle] = useState("");
  const [urlInput, setUrlInput] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(true);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    setIsLoadingSources(true);
    try {
      const res = await fetch("/api/knowledge/sources");
      const data = await res.json();
      if (res.ok) {
        setSources(data.sources);
      } else {
        console.error("Failed to load sources:", data.error);
      }
    } catch (_err: unknown) {
      console.error("Error fetching sources:", _err);
    } finally {
      setIsLoadingSources(false);
    }
  };

  const handleUploadText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textTitle.trim() || !textContent.trim()) {
      setError("Title and content are required.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/knowledge/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: textTitle,
          content: textContent,
          source_type: "text"
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`Successfully embedded ${data.chunks_embedded} chunks.`);
        setTextTitle("");
        setTextContent("");
        fetchSources();
      } else {
        setError(data.error || "Failed to upload to brain.");
      }
    } catch (_err: unknown) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setError("URL is required.");
      return;
    }

    setIsFetchingUrl(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Fetch content from URL
      const fetchRes = await fetch("/api/knowledge/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      const fetchData = await fetchRes.json();
      if (!fetchRes.ok) {
        throw new Error(fetchData.error || "Failed to fetch URL content.");
      }

      const finalTitle = urlTitle.trim() || fetchData.title || urlInput;

      setIsFetchingUrl(false);
      setIsLoading(true);

      // 2. Embed the content
      const embedRes = await fetch("/api/knowledge/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: finalTitle,
          content: fetchData.content,
          source_type: "url",
          file_url: urlInput
        }),
      });

      const embedData = await embedRes.json();
      if (embedRes.ok) {
        setSuccess(`Successfully fetched and embedded ${embedData.chunks_embedded} chunks.`);
        setUrlTitle("");
        setUrlInput("");
        fetchSources();
      } else {
        setError(embedData.error || "Failed to embed URL content.");
      }
    } catch (_err: unknown) {
      setError(_err instanceof Error ? _err.message : "An unexpected error occurred.");
      setIsFetchingUrl(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this knowledge source?")) return;

    try {
      const res = await fetch("/api/knowledge/sources", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setSources(sources.filter(s => s.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete source.");
      }
    } catch (_err: unknown) {
      alert("An error occurred while deleting.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0A0A0A] text-[#d0c5af] p-8 lg:p-12 relative">
      <div className="absolute inset-0 bg-[url('/bg-pattern.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-10 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between">
          <div>
            <h1 className="font-[Orbitron] text-4xl lg:text-5xl font-bold text-[#D4AF37] tracking-widest uppercase drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center gap-4">
              <Database className="w-10 h-10" /> KHEMET BRAIN
            </h1>
            <p className="font-[Rajdhani] text-xl text-white/60 mt-2 uppercase tracking-widest">
              YOUR KNOWLEDGE VAULT
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-500/50 rounded-lg text-red-200 font-[Rajdhani]">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-950/50 border border-green-500/50 rounded-lg text-green-200 font-[Rajdhani]">
            {success}
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-[#131313] border border-[rgba(212,175,55,0.08)] rounded-none p-6 shadow-xl mb-12">

          <div className="flex border-b border-white/10 mb-6">
            <button
              className={`flex-1 py-4 font-[Orbitron] uppercase text-sm tracking-widest transition-colors flex justify-center items-center gap-2 ${
                activeTab === "text"
                  ? "text-[#D4AF37] border-b-2 border-[#D4AF37] bg-white/5"
                  : "text-white/40 hover:text-white/70"
              }`}
              onClick={() => setActiveTab("text")}
            >
              <FileText className="w-4 h-4" /> Paste Text
            </button>
            <button
              className={`flex-1 py-4 font-[Orbitron] uppercase text-sm tracking-widest transition-colors flex justify-center items-center gap-2 ${
                activeTab === "url"
                  ? "text-[#D4AF37] border-b-2 border-[#D4AF37] bg-white/5"
                  : "text-white/40 hover:text-white/70"
              }`}
              onClick={() => setActiveTab("url")}
            >
              <Globe className="w-4 h-4" /> Enter URL
            </button>
          </div>

          {activeTab === "text" && (
            <form onSubmit={handleUploadText} className="space-y-4">
              <div>
                <label className="block font-[Orbitron] text-xs text-[#D4AF37] mb-2 uppercase tracking-widest">
                  Document Title
                </label>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="e.g., Project Specifications"
                  className="w-full bg-black/50 border border-[rgba(212,175,55,0.2)] p-3 text-lg focus:outline-none focus:border-[#D4AF37] transition-colors placeholder:text-gray-700"
                  required
                />
              </div>
              <div>
                <label className="block font-[Orbitron] text-xs text-[#D4AF37] mb-2 uppercase tracking-widest">
                  Content to Embed
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste your text here..."
                  className="w-full bg-black/50 border border-[rgba(212,175,55,0.2)] p-3 h-48 text-lg focus:outline-none focus:border-[#D4AF37] transition-colors placeholder:text-gray-700 resize-y"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-[#f2ca50] to-[#D4AF37] text-black font-[Orbitron] text-sm font-bold tracking-widest uppercase py-4 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                {isLoading ? "EMBEDDING..." : "UPLOAD TO BRAIN"}
              </button>
            </form>
          )}

          {activeTab === "url" && (
            <form onSubmit={handleUploadUrl} className="space-y-4">
              <div>
                <label className="block font-[Orbitron] text-xs text-[#D4AF37] mb-2 uppercase tracking-widest">
                  Document Title (Optional)
                </label>
                <input
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="Auto-detected if left blank"
                  className="w-full bg-black/50 border border-[rgba(212,175,55,0.2)] p-3 text-lg focus:outline-none focus:border-[#D4AF37] transition-colors placeholder:text-gray-700"
                />
              </div>
              <div>
                <label className="block font-[Orbitron] text-xs text-[#D4AF37] mb-2 uppercase tracking-widest">
                  Target URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full bg-black/50 border border-[rgba(212,175,55,0.2)] p-3 text-lg focus:outline-none focus:border-[#D4AF37] transition-colors placeholder:text-gray-700"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || isFetchingUrl}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-[#f2ca50] to-[#D4AF37] text-black font-[Orbitron] text-sm font-bold tracking-widest uppercase py-4 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || isFetchingUrl ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
                {isFetchingUrl ? "FETCHING CONTENT..." : isLoading ? "EMBEDDING..." : "FETCH & UPLOAD"}
              </button>
            </form>
          )}

        </div>

        {/* Sources List */}
        <div>
          <h2 className="font-[Orbitron] text-2xl font-bold text-[#D4AF37] tracking-widest uppercase mb-6 flex items-center gap-3">
             UPLOADED SOURCES
          </h2>

          {isLoadingSources ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
          ) : sources.length === 0 ? (
            <div className="bg-[#131313] border border-[rgba(212,175,55,0.08)] p-12 text-center rounded-none shadow-md">
              <Database className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <h3 className="font-[Orbitron] text-xl text-white/60 tracking-widest uppercase mb-2">NO KNOWLEDGE UPLOADED YET</h3>
              <p className="font-[Rajdhani] text-white/40">Upload text or URLs above to start building your personal knowledge vault.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sources.map(source => (
                <div key={source.id} className="bg-[#131313] border border-[rgba(212,175,55,0.08)] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-[rgba(212,175,55,0.3)]">
                  <div className="flex items-center gap-4">
                    <div className="bg-black/50 p-3 rounded-full border border-white/5">
                      {source.source_type === 'url' ? <Globe className="w-6 h-6 text-[#D4AF37]" /> : <FileText className="w-6 h-6 text-[#D4AF37]" />}
                    </div>
                    <div>
                      <h4 className="font-[Orbitron] text-lg font-semibold text-white tracking-wider">{source.title}</h4>
                      <div className="flex items-center gap-3 mt-1 font-[Rajdhani] text-sm text-white/50">
                        <span className="uppercase text-xs tracking-widest bg-white/5 px-2 py-0.5 rounded text-[#D4AF37]">
                          {source.source_type}
                        </span>
                        <span>{source.chunk_count} chunks</span>
                        <span>•</span>
                        <span>{new Date(source.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSource(source.id)}
                    className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-colors border border-transparent rounded"
                    title="Delete Source"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}