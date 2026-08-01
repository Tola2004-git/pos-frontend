import { useEffect } from "react";
import { glass, glassCard } from "../utils/styles";
import PresetGrid from "./PresetGrid";
import ImageUploader from "./ImageUploader";
import { GalleryEdit, Magicpen } from "iconsax-react";

function BackgroundChanger({
  onClose,
  visible = true,
  selected,
  customUrl,
  previewUpload,
  bgPresets,
  handleSelectPreset,
  handleImageUpload,
  handleCustomUrlChange,
  onApply,
  compressing = false,
  uploadError = "",
  overlayOpacity,
  onOverlayOpacityChange,
  t,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !compressing) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, compressing]);

  return (
    <div
      style={{
        ...glassCard,
        opacity: visible ? 1 : 0,
        animation: visible ? "confirm-fade-in 0.2s ease forwards" : "none",
        transition: "opacity 220ms ease",
        pointerEvents: visible ? "auto" : "none",
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !compressing) onClose();
      }}
    >
      <style>{`
        @keyframes confirm-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes confirm-pop {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      <div
        style={{
          ...glass,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          opacity: visible ? 1 : 0,
          animation: visible
            ? "confirm-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
            : "none",
          transition: "transform 220ms ease, opacity 220ms ease",
        }}
        className="w-full max-w-[560px] rounded-[24px] p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-bold text-[1.3rem] m-0 flex items-center gap-2">
            <GalleryEdit
              size={30}
              color="currentColor"
              variant="Outline"
              style={{ animation: "float 2s ease-in-out infinite" }}
            />
            <span>{t.bgChangerTitle}</span>
          </h2>
          <button
            onClick={onClose}
            aria-label={t.cancel}
            className="bg-white/10 border-none text-white w-9 h-9 rounded-full cursor-pointer text-base flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>

        <PresetGrid
          bgPresets={bgPresets}
          selected={selected}
          onSelect={handleSelectPreset}
          t={t}
        />

        <ImageUploader
          previewUpload={previewUpload}
          onUpload={handleImageUpload}
          customUrl={customUrl}
          onCustomUrlChange={handleCustomUrlChange}
          compressing={compressing}
          uploadError={uploadError}
          t={t}
        />

        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-white/70 text-sm font-medium">
              {t.bgOverlayDarknessLabel}
            </label>
            <span className="text-white/50 text-xs">
              {Math.round(overlayOpacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0.2}
            max={0.8}
            step={0.05}
            value={overlayOpacity}
            onChange={(e) => onOverlayOpacityChange(parseFloat(e.target.value))}
            className="w-full accent-white cursor-pointer"
          />
          <p className="text-white/40 text-[0.72rem] mt-1 mb-0">
            {t.bgOverlayDarknessDesc}
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="btn-cancel-glass flex-1 p-3 rounded-[12px] text-white cursor-pointer text-[0.95rem] font-medium"
          >
            {t.cancel}
          </button>
          <button
            onClick={onApply}
            disabled={compressing}
            className="btn-shine-blue flex-1 p-3 rounded-[12px] text-[0.95rem] font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Magicpen size={20} color="white" variant="Outline" />
            {compressing ? t.bgChangerOptimizing : t.bgChangerApply}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BackgroundChanger;
