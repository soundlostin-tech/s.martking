"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, User, FileText, Play, Loader2 } from "lucide-react";
import Link from "next/link";
import type { SearchResult } from "@/app/api/search/route";

interface GlobalSearchProps {
  placeholder?: string;
  autoFocus?: boolean;
  onClose?: () => void;
}

export function GlobalSearch({ 
  placeholder = "Search players, posts, videos...",
  autoFocus = false,
  onClose
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(autoFocus);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const performSearch = useCallback(async (searchQuery: string, type?: string | null) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("q", searchQuery);
      params.set("limit", "15");
      if (type) params.set("type", type);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      performSearch(query, activeFilter);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, activeFilter, performSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "profile":
        return <User size={14} />;
      case "video":
        return <Play size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  const getResultUrl = (result: SearchResult) => {
    switch (result.type) {
      case "profile":
        return `/u/${result.username || result.id}`;
      case "video":
        return `/v/${result.slug}`;
      case "post":
        return `/p/${result.slug}`;
      default:
        return "#";
    }
  };

  const filters = [
    { key: null, label: "All" },
    { key: "profile", label: "Players" },
    { key: "post", label: "Posts" },
    { key: "video", label: "Videos" },
  ];

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          size={16}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-white border border-[#E5E7EB] rounded-xl py-2.5 pl-9 pr-9 text-xs font-medium shadow-sm placeholder:text-[#9CA3AF] focus:border-[#1A1A1A] focus:outline-none transition-all"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1A1A1A]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-[#E5E7EB] p-2 flex gap-1.5 overflow-x-auto no-scrollbar">
              {filters.map((filter) => (
                <button
                  key={filter.key || "all"}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wide whitespace-nowrap transition-colors ${
                    activeFilter === filter.key
                      ? "bg-[#1A1A1A] text-white"
                      : "bg-[#F3F4F6] text-[#6B7280]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#9CA3AF]" />
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-[#E5E7EB]">
                  {results.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      href={getResultUrl(result)}
                      onClick={() => {
                        setIsOpen(false);
                        onClose?.();
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-[#F9FAFB] transition-colors"
                    >
                    <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center overflow-hidden flex-shrink-0 border border-[#E5E7EB]">
                      {result.type === "profile" && result.avatar_url ? (
                        <img src={result.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : result.thumbnail_url ? (
                        <img src={result.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#9CA3AF]">{getResultIcon(result.type)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-[#1A1A1A] truncate">
                        {result.type === "profile"
                          ? result.full_name || result.username
                          : result.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[8px] font-black text-[#9CA3AF] uppercase tracking-wide">
                          {result.type}
                        </span>
                        {result.game && (
                          <>
                            <span className="text-[8px] text-[#D1D5DB]">•</span>
                            <span className="text-[8px] font-bold text-[#6B7280]">{result.game}</span>
                          </>
                        )}
                        {result.view_count !== undefined && (
                          <>
                            <span className="text-[8px] text-[#D1D5DB]">•</span>
                            <span className="text-[8px] font-bold text-[#6B7280]">
                              {result.view_count.toLocaleString()} views
                            </span>
                          </>
                        )}
                        {result.followers_count !== undefined && (
                          <>
                            <span className="text-[8px] text-[#D1D5DB]">•</span>
                            <span className="text-[8px] font-bold text-[#6B7280]">
                              {result.followers_count.toLocaleString()} followers
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-xs text-[#6B7280] font-bold">No results found</p>
                <p className="text-[10px] text-[#9CA3AF] mt-1">Try a different search term</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
