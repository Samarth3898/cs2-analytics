import Link from "next/link";
import { ReactNode } from "react";

type CTAButtonProps = {
  href: string;
  children: ReactNode;
};

export default function CTAButton({ href, children }: CTAButtonProps) {
  return (
    <Link
      href={href}
      className="
        inline-block
        px-6
        py-3
        rounded-lg
        bg-orange-500
        text-white
        font-semibold
        hover:bg-orange-600
        transition-colors"
    >
      {children}
    </Link>
  );
}
