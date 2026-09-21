import { useEffect, useRef } from "react";

// Ambient/decorative background video - autoplays muted+looped, but:
// - pauses while the tab is hidden (same pattern as the dashboard's polling
//   pause) since a background nobody can see has no reason to keep decoding
//   frames and draining battery/CPU
// - never autoplays at all if the OS/browser has "prefers-reduced-motion"
//   set, showing just the poster frame instead - respects that
//   accessibility preference and doubles as a battery-saving opt-out for
//   anyone who's turned it on
export default function BackgroundVideo({ src, poster, className, style }) {
  const videoRef = useRef(null);
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduceMotion) return;
    const video = videoRef.current;
    if (!video) return;

    const handleVisibility = () => {
      if (document.hidden) video.pause();
      else video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [reduceMotion]);

  return (
    <video
      // Remounts (and restarts playback cleanly) whenever the source changes
      // - e.g. the user picks a different video preset - instead of needing
      // a manual .load() call.
      key={src}
      ref={videoRef}
      className={className}
      style={style}
      autoPlay={!reduceMotion}
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
