"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin, Clock, Phone } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function ContactInfo() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
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
        titleRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            scroller: mainElement,
            start: "top 80%",
            end: "top 50%",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        cardsRef.current?.children || [],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            scroller: mainElement,
            start: "top 80%",
            end: "top 50%",
            scrub: 1,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const infoCards = [
    {
      icon: MapPin,
      title: "위치",
      content: "충청북도 옥천군 옥천읍 남곡길 8",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: Clock,
      title: "영업시간",
      content: "오전 9시 ~ 오후 6시 · 일요일 휴무",
      gradient: "from-emerald-500/20 to-green-500/20",
    },
    {
      icon: Phone,
      title: "문의",
      content: "010-7933-9990",
      isLink: true,
      gradient: "from-violet-500/20 to-purple-500/20",
    },
  ];

  return (
    <section
      id="contact-info"
      ref={sectionRef}
      className="snap-section flex items-center justify-center bg-black py-16"
    >
      <div className="max-w-5xl mx-auto px-6 w-full">
        <div ref={titleRef} className="text-center mb-12 gpu-accelerated">
          <span className="text-[var(--accent-400)] text-sm font-medium tracking-wider uppercase mb-4 block">
            Location
          </span>
          <h2 className="text-[clamp(28px,5vw,40px)] font-bold text-white">
            오시는 길
          </h2>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-3 gap-4">
          {infoCards.map((item) => (
            <div
              key={item.title}
              className={`glass-card glass-card-hover p-6 bg-gradient-to-br ${item.gradient}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-[var(--accent-400)]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  {item.isLink ? (
                    <a
                      href={`tel:${item.content}`}
                      className="text-[var(--accent-400)] hover:text-[var(--accent-300)] transition-colors text-lg font-medium"
                    >
                      {item.content}
                    </a>
                  ) : (
                    <div>
                      <p className="text-sm text-white/60 leading-relaxed">
                        {item.content}
                      </p>

                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
