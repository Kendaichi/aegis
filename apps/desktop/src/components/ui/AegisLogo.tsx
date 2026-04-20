import logoUrl from "../../assets/images/aegis_logo_transparent.png";

interface Props {
  className?: string;
  alt?: string;
}

/** Transparent PNG mark — works on dark surfaces; pass Tailwind `className` for size (e.g. `h-9 w-9 object-contain`). */
export default function AegisLogo({
  className = "h-10 w-10 object-contain",
  alt = "AEGIS",
}: Props) {
  return <img src={logoUrl} alt={alt} className={className} draggable={false} />;
}
