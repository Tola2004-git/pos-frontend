export function Skeleton({
  width = "100%",
  height = 14,
  borderRadius = 6,
  style = {},
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: "rgba(255,255,255,0.08)",
        backgroundImage:
          "linear-gradient(90deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.0) 100%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.6s infinite",
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

export function SkeletonCell({ children, width }) {
  return (
    <td style={{ padding: "14px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", width }}>
        {children}
      </div>
    </td>
  );
}

function injectSkeletonStyle() {
  if (typeof document === "undefined") return;
  if (document.getElementById("skeleton-keyframe")) return;
  const style = document.createElement("style");
  style.id = "skeleton-keyframe";
  style.textContent = `
    @keyframes skeleton-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
}
injectSkeletonStyle();
