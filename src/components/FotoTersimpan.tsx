import { useEffect, useState } from "react";
import { urlFoto } from "@/lib/storage";

export function FotoTersimpan({
  path,
  className,
  alt,
}: {
  path?: string | null;
  className?: string;
  alt: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let aktif = true;
    void urlFoto(path).then((u) => aktif && setSrc(u));
    return () => {
      aktif = false;
    };
  }, [path]);

  if (!path) return <span className="text-xs text-muted-foreground">-</span>;
  if (!src) return <div className={`animate-pulse rounded-md bg-muted ${className ?? "size-12"}`} />;
  return (
    <a href={src} target="_blank" rel="noreferrer">
      <img src={src} alt={alt} className={`rounded-md object-cover ${className ?? "size-12"}`} />
    </a>
  );
}
