import Image from "next/image";

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: 32,
  md: 42,
  lg: 52,
};

export default function RebildLogo({ size = "md", className = "" }: Props) {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      data-testid="rebild-logo"
    >
      <div className="relative h-14 w-14 shrink-0">
        <Image
          src="/brandlogo.png"
          alt="Rebild brand mark"
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="relative h-10 w-24 shrink-0">
        <Image
          src="/rebildlogo.png"
          alt="Rebild wordmark"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}

export function RebildMarkOnLight({ size = "md", className = "" }: Props) {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      data-testid="rebild-logo"
    >
      <div className="relative h-10 w-10 shrink-0">
        <Image
          src="/brandlogo.png"
          alt="Rebild brand mark"
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="relative h-10 w-24 shrink-0">
        <Image
          src="/rebildbglogo.png"
          alt="Rebild wordmark"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}

export function Rebildinvoice({ size = "lg", className = "" }: Props) {
  return (
    <span
      className={`font-display font-black tracking-tight leading-none select-none ${className}`}
    >
      <span style={{ color: "#F77418" }}>Re</span>
      <span className="text-white">bild</span>
      <span style={{ color: "#F77418" }}>.</span>
    </span>
  );
}