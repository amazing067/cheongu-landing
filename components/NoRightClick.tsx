"use client";

export function NoRightClick({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div onContextMenu={(e) => e.preventDefault()}>
      {children}
    </div>
  );
}
