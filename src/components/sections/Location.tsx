"use client";

import { useState } from "react";
import { MapPin, Clock, Phone } from "lucide-react";

type MapType = "naver" | "kakao";

export default function Location() {
  const [activeMap, setActiveMap] = useState<MapType>("naver");

  // 지도 좌표 (옥천군 남곡길 8)
  const lat = 36.3068;
  const lng = 127.5714;

  return (
    <section
      id="location"
      className="snap-section min-h-screen flex items-center bg-[var(--navy-900)] py-16"
    >
      <div className="max-w-4xl mx-auto px-6 w-full">
        {/* 타이틀 */}
        <h2 className="text-[24px] md:text-[32px] font-bold text-white text-center mb-12">
          오시는 길
        </h2>

        {/* 정보 카드들 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* 위치 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-[var(--trust-500)]/20 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-[var(--trust-400)]" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">위치</h3>
              <p className="text-sm text-white/70">
                충청북도 옥천군 옥천읍 남곡길 8
              </p>
            </div>
          </div>

          {/* 영업시간 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-[var(--trust-500)]/20 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[var(--trust-400)]" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">영업시간</h3>
              <p className="text-sm text-white/70">
                월~토 오전 9시 ~ 오후 6시
                <br />
                일요일 휴무
              </p>
            </div>
          </div>

          {/* 문의 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-[var(--trust-500)]/20 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-[var(--trust-400)]" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">문의</h3>
              <a
                href="tel:010-7933-9990"
                className="text-sm text-[var(--trust-400)] hover:underline"
              >
                010-7933-9990
              </a>
            </div>
          </div>
        </div>

        {/* 지도 탭 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveMap("naver")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeMap === "naver"
                ? "bg-[var(--trust-500)] text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            네이버 지도
          </button>
          <button
            onClick={() => setActiveMap("kakao")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeMap === "kakao"
                ? "bg-[var(--trust-500)] text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            카카오 지도
          </button>
        </div>

        {/* 지도 영역 */}
        <div className="w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden bg-[var(--navy-800)]">
          {activeMap === "naver" ? (
            <iframe
              src={`https://map.naver.com/p/embed?c=${lng},${lat},15,0,0,0,dh&marker=type:d,lat:${lat},lng:${lng}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="쏠마린캠핑카 네이버 지도"
            />
          ) : (
            <iframe
              src={`https://map.kakao.com/link/map/쏠마린캠핑카,${lat},${lng}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="쏠마린캠핑카 카카오 지도"
            />
          )}
        </div>
      </div>
    </section>
  );
}
