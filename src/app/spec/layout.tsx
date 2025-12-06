import type { Metadata } from "next";
import "./spec.css";

export const metadata: Metadata = {
  title: "옵션표 생성기 | 쏠마린캠핑카",
  description: "캠핑카/카라반 옵션표 생성 도구",
};

export default function SpecLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
