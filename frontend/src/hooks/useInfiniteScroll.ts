"use client";

import { useEffect, useCallback, useRef } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number; // 하단에서 몇 픽셀 남았을 때 로드할지
  onLoadMore: () => void;
}

export function useInfiniteScroll({ hasMore, isLoading, threshold = 200, onLoadMore }: UseInfiniteScrollOptions) {
  const isLoadingRef = useRef(isLoading);
  const hasMoreRef = useRef(hasMore);

  // ref를 사용하여 최신 값 추적
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 하단에 도달했는지 확인
    if (scrollTop + windowHeight >= documentHeight - threshold) {
      // 로딩 중이 아니고 더 불러올 데이터가 있는 경우에만 로드
      if (!isLoadingRef.current && hasMoreRef.current) {
        onLoadMore();
      }
    }
  }, [threshold, onLoadMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
}
