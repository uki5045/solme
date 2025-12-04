"use client";

import { useEffect } from "react";

export default function CallPage() {
  useEffect(() => {
    window.location.href = "tel:01079339990";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black-900">
      <p className="text-text-primary">전화 연결 중...</p>
    </div>
  );
}
