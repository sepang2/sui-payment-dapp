"use client";

import React, { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Header from "../../components/Header";
import BottomNavigation from "../../components/BottomNavigation";

interface User {
  id: string;
  name: string;
  description: string | null;
  walletAddress: string;
  lumaUrl: string | null;
  qrCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const account = useCurrentAccount();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // 편집 상태 관리
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    lumaUrl: "",
  });

  const walletConnected = !!account;

  useEffect(() => {
    if (account?.address) {
      fetchUserInfo();
    }
  }, [account?.address]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`/api/users?walletAddress=${account?.address}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }
      const data = await response.json();

      if (data.user) {
        setUser(data.user);
        setEditForm({
          name: data.user.name || "",
          description: data.user.description || "",
          lumaUrl: data.user.lumaUrl || "",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        name: user.name || "",
        description: user.description || "",
        lumaUrl: user.lumaUrl || "",
      });
    }
    setEditing(false);
  };

  const handleSave = async () => {
    if (!account?.address) return;

    setSaving(true);
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: account.address,
          name: editForm.name,
          description: editForm.description,
          lumaUrl: editForm.lumaUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user info");
      }

      const data = await response.json();
      setUser(data.user);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCopyAddress = async () => {
    if (!user?.walletAddress) return;

    try {
      await navigator.clipboard.writeText(user.walletAddress);
      setCopySuccess(true);

      // 2초 후 복사 성공 상태 초기화
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (error) {
      console.error("주소 복사 실패:", error);
      // fallback: 텍스트 선택 방식
      const textArea = document.createElement("textarea");
      textArea.value = user.walletAddress;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    }
  };

  if (loading || !walletConnected) {
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

  if (error && !user) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <Header walletConnected={walletConnected} walletAddress={account?.address} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <p className="text-red-500 dark:text-red-400">사용자 정보를 불러오는데 실패했습니다.</p>
          </div>
        </div>
        <BottomNavigation visible={true} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <Header walletConnected={walletConnected} walletAddress={account?.address} />
      <div className="px-4 py-6 pb-24 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">사용자 정보</h1>
          {!editing && user && (
            <button
              onClick={handleEdit}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              정보 수정
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {user && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wide">
                  이름
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 text-black dark:text-white"
                    placeholder="이름을 입력하세요"
                  />
                ) : (
                  <div className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-gray-900 dark:text-white font-medium">{user.name}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wide">
                  설명
                </label>
                {editing ? (
                  <textarea
                    value={editForm.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 text-black dark:text-white"
                    placeholder="자기소개를 입력하세요"
                    rows={3}
                  />
                ) : (
                  <div className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-gray-900 dark:text-white">
                      {user.description || (
                        <span className="text-gray-500 dark:text-gray-400 italic">설명이 없습니다.</span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wide">
                  Luma URL
                </label>
                {editing ? (
                  <input
                    type="url"
                    value={editForm.lumaUrl}
                    onChange={(e) => handleInputChange("lumaUrl", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 text-black dark:text-white"
                    placeholder="https://lu.ma/..."
                  />
                ) : (
                  <div className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                    {user.lumaUrl ? (
                      <a
                        href={user.lumaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                      >
                        {user.lumaUrl}
                      </a>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">Luma URL이 없습니다.</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wide">
                  지갑 주소
                </label>
                <div className="flex items-center px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-gray-900 dark:text-white text-sm font-mono break-all flex-1 mr-2">
                    {user.walletAddress}
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                      copySuccess
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                    title={copySuccess ? "복사됨!" : "주소 복사"}
                  >
                    <i className={`fas ${copySuccess ? "fa-check" : "fa-copy"} text-sm`}></i>
                  </button>
                </div>
              </div>
            </div>

            {editing && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  취소
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNavigation visible={true} />
    </div>
  );
}
