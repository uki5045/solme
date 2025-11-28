"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Navigation, Phone } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function MapSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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

  return (
    <section
      ref={sectionRef}
      className="snap-section flex items-center justify-center bg-black py-16"
    >
      <div ref={contentRef} className="max-w-5xl mx-auto px-6 w-full gpu-accelerated">
        {/* Map */}
        <div className="w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden glass-card">
          <iframe
            src="https://map.naver.com/p/entry/place/1000695224?c=15.00,0,0,0,dh"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="쏠마린캠핑카 네이버 지도"
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <a
            href="https://map.naver.com/p/directions/-/14216622.2289245,4337908.8498498,쏠마린캠핑카,1000695224/-/transit?c=15.00,0,0,0,dh"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm"
          >
            <Navigation className="w-4 h-4" />
            길찾기
          </a>
          <a
            href="tel:010-7933-9990"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm"
          >
            <Phone className="w-4 h-4" />
            전화 문의
          </a>
        </div>
      </div>
    </section>
  );
}
