/**
 * 어메이징사업부 로고 마크.
 * variant="mark" → 육각형 심볼만 (헤더 등 콤팩트 위치)
 * variant="full" → 심볼 + AMAZING 워드마크 (푸터 등)
 * 원본 asset: /public/icons/amazing-mark.png · /public/icons/amazinglogo-trim.png
 */
export function BrandMark({
  variant = "mark",
  height = 28,
  className = "",
}: {
  variant?: "mark" | "full";
  height?: number;
  className?: string;
}) {
  const src =
    variant === "full"
      ? "/icons/amazinglogo-trim.png"
      : "/icons/amazing-mark.png";
  return (
    <img
      src={src}
      alt="어메이징사업부 로고"
      style={{ height }}
      className={`w-auto select-none ${className}`}
      draggable={false}
    />
  );
}
