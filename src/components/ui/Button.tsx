import { AnchorHTMLAttributes } from "react";

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "outline" | "solid";
}

export default function Button({
  variant = "outline",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-block px-8 py-3 text-xs font-sans tracking-[0.15em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-amber";

  const variants = {
    outline:
      "border border-brand-amber text-brand-amber hover:bg-brand-amber hover:text-brand-dark",
    solid:
      "bg-brand-amber text-brand-dark hover:bg-brand-cream",
  };

  return (
    <a className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </a>
  );
}
