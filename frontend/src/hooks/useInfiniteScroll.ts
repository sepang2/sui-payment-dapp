"use client";

import { useEffect, useCallback, useRef } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number; // 하단에서 몇 픽셀 남았을 때 로드할지
  loadDelay?: number; // 로딩 간 딜레이 시간 (밀리초, 기본값: 1000ms)
  onLoadMore: () => void;
}

export function useInfiniteScroll({ hasMore, isLoading, threshold = 200, loadDelay = 1000, onLoadMore }: UseInfiniteScrollOptions) {
  const isLoadingRef = useRef(isLoading);
  const hasMoreRef = useRef(hasMore);
  const lastLoadTimeRef = useRef<number>(0);

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
        const currentTime = Date.now();
        const timeSinceLastLoad = currentTime - lastLoadTimeRef.current;
        
        // 딜레이 시간이 지났을 때만 로딩
        if (timeSinceLastLoad >= loadDelay) {
          lastLoadTimeRef.current = currentTime;
          onLoadMore();
        }
      }
    }
  }, [threshold, loadDelay, onLoadMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
}
