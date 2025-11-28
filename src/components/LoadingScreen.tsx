"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export default function LoadingScreen({
  onLoadingComplete,
}: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1200);

    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onLoadingComplete();
    }, 1600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          쏠마린캠핑카
        </h1>
      </div>

      {/* Loading indicator */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-[var(--accent-500)] rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 200}ms`,
              animationDuration: "1s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
