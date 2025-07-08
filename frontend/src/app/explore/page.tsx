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
        <div className="flex items-center justify-center h-64">
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
        <div className="flex items-center justify-center h-64">
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">이벤트 탐색</h1>
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
                <div className="flex items-center p-3">
                  {/* 썸네일 영역 */}
                  <div className="w-24 h-16 flex-shrink-0 mr-3">
                    {link.metadataLoading ? (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : link.metadata?.image ? (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={link.metadata.image}
                          alt={link.metadata.title || link.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.parentElement!.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                <i class="fas fa-calendar-alt text-white text-lg"></i>
                              </div>
                            `;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <i className="fas fa-calendar-alt text-white text-lg"></i>
                      </div>
                    )}
                  </div>

                  {/* 제목 영역 */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-base font-semibold text-gray-900 dark:text-white"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {link.metadata?.title || ""}
                    </h3>
                  </div>

                  {/* 화살표 아이콘 */}
                  <div className="ml-3 flex-shrink-0">
                    <i className="fas fa-chevron-right text-gray-400 dark:text-gray-500"></i>
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
