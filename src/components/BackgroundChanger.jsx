import { glass, glassCard } from "../utils/styles";
import PresetGrid from "./PresetGrid";
import ImageUploader from "./ImageUploader";
import { GalleryEdit, Magicpen } from "iconsax-react";

function BackgroundChanger({
  onClose,
  selected,
  customUrl,
  previewUpload,
  bgPresets,
  handleSelectPreset,
  handleImageUpload,
  handleCustomUrlChange,
  onApply,
}) {

  return (
    
    <div
      style={glassCard}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      <div style={glass} className="w-full max-w-[560px] rounded-[24px] p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-bold text-[1.3rem] m-0 flex items-center gap-2">
            <GalleryEdit size={30} color="white" variant="Outline" style={{ animation: "float 2s ease-in-out infinite"}}/>
            <span>Change Background</span>
          </h2>
          <button
            onClick={onClose}
            className="bg-white/10 border-none text-white w-9 h-9 rounded-full cursor-pointer text-base flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>

        <PresetGrid
          bgPresets={bgPresets}
          selected={selected}
          onSelect={handleSelectPreset}
        />

        <ImageUploader
          previewUpload={previewUpload}
          onUpload={handleImageUpload}
          customUrl={customUrl}
          onCustomUrlChange={handleCustomUrlChange}
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="btn-cancel-glass flex-1 p-3 rounded-[12px] text-white cursor-pointer text-[0.95rem] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            className="btn-shine-blue flex-1 p-3 rounded-[12px] text-[0.95rem] font-semibold flex items-center justify-center gap-2"
          >
            <Magicpen size={20} color="white" variant="Outline"/>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default BackgroundChanger;
