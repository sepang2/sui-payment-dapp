"use client";

import React, { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Header from "../../components/Header";
import BottomNavigation from "../../components/BottomNavigation";

interface LumaLink {
  id: string;
  name: string;
  description: string | null;
  lumaUrl: string;
}

interface LumaMetadata {
  title: string;
  image: string | null;
  description: string | null;
  url: string;
}

interface EnhancedLumaLink extends LumaLink {
  metadata?: LumaMetadata;
  metadataLoading?: boolean;
}

export default function ExplorePage() {
  const account = useCurrentAccount();
  const [lumaLinks, setLumaLinks] = useState<EnhancedLumaLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const walletConnected = !!account;

  useEffect(() => {
    fetchLumaLinks();
  }, []);

  const fetchLumaLinks = async () => {
    try {
      const response = await fetch("/api/luma-links");
      if (!response.ok) {
        throw new Error("Failed to fetch luma links");
      }
      const data = await response.json();
      setLumaLinks(data);

      // 각 루마 링크에 대해 메타데이터 가져오기
      data.forEach((link: LumaLink) => {
        fetchMetadata(link.id, link.lumaUrl);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async (linkId: string, url: string) => {
    try {
      // 메타데이터 로딩 상태 표시
      setLumaLinks((prev) => prev.map((link) => (link.id === linkId ? { ...link, metadataLoading: true } : link)));

      const response = await fetch(`/api/luma-metadata?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch metadata");
      }

      const metadata = await response.json();

      // 메타데이터 업데이트
      setLumaLinks((prev) =>
        prev.map((link) => (link.id === linkId ? { ...link, metadata, metadataLoading: false } : link))
      );
    } catch (err) {
      console.error("Error fetching metadata for", url, err);
      // 메타데이터 가져오기 실패 시 로딩 상태만 해제
      setLumaLinks((prev) => prev.map((link) => (link.id === linkId ? { ...link, metadataLoading: false } : link)));
    }
  };

  const handleLinkClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <Header walletConnected={walletConnected} walletAddress={account?.address} />
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <BottomNavigation visible={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <Header walletConnected={walletConnected} walletAddress={account?.address} />
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500 dark:text-red-400">Error: {error}</div>
        </div>
        <BottomNavigation visible={true} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <Header walletConnected={walletConnected} walletAddress={account?.address} />
      <div className="px-4 py-6 pb-24 max-w-md mx-auto">
        {lumaLinks.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-search text-4xl text-gray-400 dark:text-gray-500 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">등록된 이벤트가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lumaLinks.map((link) => (
              <div
                key={link.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleLinkClick(link.lumaUrl)}
              >
                {/* 썸네일 영역 */}
                {link.metadataLoading ? (
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : link.metadata?.image ? (
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img
                      src={link.metadata.image}
                      alt={link.metadata.title || link.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.parentElement!.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                            <i class="fas fa-calendar-alt text-white text-4xl"></i>
                          </div>
                        `;
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <i className="fas fa-calendar-alt text-white text-4xl"></i>
                  </div>
                )}

                {/* 콘텐츠 영역 */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3
                        className="text-lg font-semibold text-gray-900 dark:text-white mb-1"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {link.metadata?.title || ""}
                      </h3>
                      {(link.metadata?.description || "") && (
                        <p
                          className="text-gray-600 dark:text-gray-300 text-sm mb-2"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {link.metadata?.description || ""}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <i className="fas fa-chevron-right text-gray-400 dark:text-gray-500"></i>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNavigation visible={true} />
    </div>
  );
}
