import React from "react";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
};

export default function RebildLogo({ size = "md", className = "" }: Props) {
  return (
    <span
      className={`font-display font-black tracking-tight leading-none select-none ${sizes[size]} ${className}`}
      data-testid="rebild-logo"
    >
      <span style={{ color: "#F77418" }}>Re</span>
      <span style={{ color: "#FFFFFF" }}>bild</span>
      <span style={{ color: "#F77418" }}>.</span>
    </span>
  );
}

export function RebildMarkOnLight({ size = "md", className = "" }: Props) {
  return (
    <span
      className={`font-display font-black tracking-tight leading-none select-none ${sizes[size]} ${className}`}
    >
      <span style={{ color: "#F77418" }}>Re</span>
      <span style={{ color: "#0A0A0A" }}>bild</span>
      <span style={{ color: "#F77418" }}>.</span>
    </span>
  );
}
