export function Tooltip({ label, children }) {
  return (
    <div className="relative group inline-block">
      {children}
      <div
        className="theme-dark-surface pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md px-2.5 py-1 text-xs text-white opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
        style={{ background: "rgba(20,28,35,0.95)" }}
      >
        {label}
      </div>
    </div>
  );
}
