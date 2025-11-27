"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="snap-start bg-[var(--navy-900)] border-t border-white/10 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* 로고 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">쏠마린캠핑카</h2>
        </div>

        {/* SNS 링크 */}
        <div className="flex justify-center gap-6 mb-8">
          <a
            href="https://cafe.naver.com/solmarinecamping"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="네이버 카페"
          >
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/solmarinecamping/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="인스타그램"
          >
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>

        {/* 회사 정보 */}
        <div className="text-center text-sm text-white/50 space-y-1 mb-6">
          <p>상호명: 주식회사 쏠마린캠핑카</p>
          <p>대표: 정은희</p>
          <p>주소: 충청북도 옥천군 옥천읍 남곡길 8</p>
          <p>사업자등록번호: 208-87-02831</p>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-white/30">
          © 2024 쏠마린캠핑카. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
