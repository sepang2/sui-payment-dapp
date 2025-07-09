"use client";

import React, { useState } from "react";
import QRCode from "qrcode";

interface UserRegistrationProps {
  walletAddress: string;
  onRegistrationComplete: () => void;
  onCancel: () => void;
}

const UserRegistration: React.FC<UserRegistrationProps> = ({ walletAddress, onRegistrationComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    lumaUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "사용자명을 입력해주세요.";
    }

    if (formData.lumaUrl && !isValidUrl(formData.lumaUrl)) {
      newErrors.lumaUrl = "올바른 URL 형식으로 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const generateQRCode = async (walletAddress: string, name: string): Promise<string> => {
    try {
      // QR 코드에 포함될 데이터 (JSON 형태)
      const qrData = {
        name: name,
        walletAddress: walletAddress,
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error("QR Code generation failed:", error);
      throw error;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 에러 메시지 제거
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 지갑 주소와 사용자 정보로 QR코드 생성
      const qrCodeDataURL = await generateQRCode(walletAddress, formData.name.trim());

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          walletAddress,
          qrCode: qrCodeDataURL,
        }),
      });

      if (!response.ok) {
        throw new Error("등록에 실패했습니다.");
      }

      onRegistrationComplete();
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ submit: "등록 중 오류가 발생했습니다. 다시 시도해주세요." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">사용자 정보 등록</h2>
          <p className="text-gray-600 dark:text-gray-400">신규 가입자입니다. 사용자 정보를 입력해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 사용자명 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              사용자명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-black focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="사용자명을 입력하세요"
              maxLength={50}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* 설명 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">사용자 설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              placeholder="사용자에 대한 간단한 설명을 입력하세요"
              rows={3}
              maxLength={200}
            />
            <p className="text-gray-500 text-xs mt-1">{formData.description.length}/200</p>
          </div>

          {/* Luma URL 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Luma 이벤트 URL</label>
            <input
              type="url"
              name="lumaUrl"
              value={formData.lumaUrl}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-black focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.lumaUrl ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="https://lu.ma/your-event"
            />
            {errors.lumaUrl && <p className="text-red-500 text-sm mt-1">{errors.lumaUrl}</p>}
          </div>

          {/* 에러 메시지 */}
          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{errors.submit}</div>
          )}

          {/* 버튼들 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? "등록 중..." : "등록하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;
