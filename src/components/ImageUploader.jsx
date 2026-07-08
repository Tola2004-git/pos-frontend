import { Folder, TickCircle } from "iconsax-react";

function ImageUploader({
  previewUpload,
  onUpload,
  customUrl,
  onCustomUrlChange,
}) {
  return (
    <div>
      <p className="text-[rgba(255,255,255,0.6)] text-[0.85rem] mb-2">
        Upload your own image
      </p>
      <label
        className={`flex items-center justify-center gap-[10px] p-3 rounded-xl cursor-pointer mb-3 border-2 border-dashed transition-all duration-200 
      ${
        previewUpload
          ? "bg-white/20 border-white text-white"
          : "bg-white/5 border-white/30 text-white/60"
      }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={onUpload}
          style={{ display: "none" }}
        />
        {previewUpload ? (
          <>
            <img
              src={previewUpload}
              alt="preview"
              className="w-10 h-10 rounded-lg object-cover"
            />
            <span className="text-[0.85rem] flex items-center gap-1">
              <TickCircle size={18} color="white" variant="Outline" />
              Image selected!
            </span>
          </>
        ) : (
          <>
            <span className="text-2xl">
              <Folder size={30} color="white" variant="Outline" />
            </span>
            <span className="text-[0.85rem]">Click to upload image</span>
          </>
        )}
      </label>

      <p className="text-white/60 text-[0.85rem] mb-2">Or paste image URL</p>
      <input
        type="text"
        placeholder="https://example.com/image.jpg"
        value={customUrl}
        onChange={(e) => onCustomUrlChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white text-[0.9rem] outline-none mb-6 box-border focus:border-white/40 transition-colors"
      />
    </div>
  );
}

export default ImageUploader;
