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

export default function RebildLogo({
  size = "md",
  className = "",
}: Props) {
  return (
    <div
  className={`relative h-16 w-28 ${className}`}
  data-testid="rebild-logo"
>
      <Image
        src="/rebildlogo.png"
        alt="Rebild4"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}

export function RebildMarkOnLight({ size = "md", className = "" }: Props) {
  return (
    <div
  className={`relative h-16 w-28 ${className}`}
  data-testid="rebild-logo"
>
      <Image
        src="/rebildbglogo.png"
        alt="Rebild4"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}

export function Rebildinvoice({ size = "lg", className = "" }: Props) {
  return (
    <span
      className={`font-display font-black tracking-tight leading-none select-none ${sizes[size]} ${className}`}
    >
      <span style={{ color: "#F77418" }}>Re</span>
      <span className="text-white">bild</span>
      <span style={{ color: "#F77418" }}>.</span>
    </span>
  );
}
