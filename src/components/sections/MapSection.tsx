"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Navigation, Phone } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    naver: any;
  }
}

export default function MapSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const checkReducedMotion = () => {
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    };
    checkReducedMotion();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            scroller: mainElement,
            start: "top 85%",
            end: "top 55%",
            scrub: 1,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // 네이버 지도 초기화
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.naver) return;

    const map = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(36.301824, 127.598027),
      zoom: 17,
      minZoom: 8,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
    });

    new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(36.301824, 127.598027),
      map: map,
    });
  }, [mapLoaded]);

  return (
    <section
      ref={sectionRef}
      className="snap-section flex items-center justify-center relative overflow-hidden bg-black py-16"
    >
      <Script
        src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=nfjs63g5g7"
        strategy="lazyOnload"
        onLoad={() => setMapLoaded(true)}
      />

      {/* Gradient Background */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0, 113, 227, 0.2) 0%, transparent 70%)",
        }}
      />

      {/* Decorative Blur Elements */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-[var(--accent-500)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

      <div ref={contentRef} className="relative z-10 max-w-5xl mx-auto px-6 w-full gpu-accelerated">
        {/* Map Container with Glass Effect */}
        <div className="relative p-1 rounded-3xl bg-gradient-to-b from-white/20 to-white/5">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/10 to-transparent opacity-50" />
          <div className="relative w-full h-[300px] md:h-[400px] rounded-[20px] overflow-hidden">
            {/* Map */}
            <div
              ref={mapRef}
              className="w-full h-full"
            />
            {/* Glass Highlight Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, transparent 80%, rgba(255,255,255,0.05) 100%)',
              }}
            />
            {/* Top shine */}
            <div
              className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 100%)',
              }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="https://map.naver.com/p/directions/-/14216622.2289245,4337908.8498498,쏠마린캠핑카,1000695224/-/transit?c=15.00,0,0,0,dh"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all text-sm"
          >
            <Navigation className="w-4 h-4" />
            길찾기
          </a>
          <a
            href="tel:010-7933-9990"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all text-sm"
          >
            <Phone className="w-4 h-4" />
            전화 문의
          </a>
        </div>
      </div>
    </section>
  );
}
