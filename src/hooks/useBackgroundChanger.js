import { useEffect, useState } from "react";
import { bgPresets, getCurrentBg } from "../utils/styles";

export function useBackgroundChanger(onApply, onClose) {
  const [selected, setSelected] = useState(getCurrentBg());
  const [customUrl, setCustomUrl] = useState("");
  const [previewUpload, setPreviewUpload] = useState(null);
  const [showBgChanger, setShowBgChanger] = useState(false);
  const [isBgChangerMounted, setIsBgChangerMounted] = useState(false);
  const [isBgChangerVisible, setIsBgChangerVisible] = useState(false);
  const [bgUrl, setBgUrl] = useState(getCurrentBg());
  const [compressing, setCompressing] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    let timeout;
    if (showBgChanger) {
      setIsBgChangerMounted(true);
      requestAnimationFrame(() => setIsBgChangerVisible(true));
    } else {
      setIsBgChangerVisible(false);
      timeout = setTimeout(() => setIsBgChangerMounted(false), 300);
    }
    return () => clearTimeout(timeout);
  }, [showBgChanger]);

  const handleSelectPreset = (url) => {
    setSelected(url);
    setCustomUrl("");
    setPreviewUpload(null);
    setUploadError("");
  };

  // Accepts any upload size/resolution - a phone photo can easily be
  // several MB at 4000px wide - but this is rendered as a full-screen
  // background (never viewed pixel-for-pixel) and stored as a data URL in
  // localStorage, which shares a small few-MB-per-origin quota with
  // everything else the app keeps there. Downscale to a width no screen
  // will exceed and re-encode as JPEG (photographic images compress far
  // better than PNG) before it ever touches localStorage - looks the same
  // on screen, a fraction of the size on disk.
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError("");
    setCompressing(true);
    try {
      const imageCompression = (await import("browser-image-compression")).default;
      const compressed = await imageCompression(file, {
        maxWidthOrHeight: 1920,
        maxSizeMB: 1,
        useWebWorker: true,
        fileType: "image/jpeg",
        initialQuality: 0.82,
      });
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Read failed"));
        reader.readAsDataURL(compressed);
      });
      setPreviewUpload(dataUrl);
      setSelected(dataUrl);
      setCustomUrl("");
    } catch (err) {
      console.error("Background image processing failed", err);
      setUploadError("Couldn't process that image. Try a different file.");
    } finally {
      setCompressing(false);
    }
  };

  const handleCustomUrlChange = (url) => {
    setCustomUrl(url);
    setPreviewUpload(null);
  };

  const applyBg = () => {
    const bg = customUrl.trim() || selected;
    try {
      localStorage.setItem("pos_background", bg);
    } catch (err) {
      console.error("Failed to save background", err);
      setUploadError("This image is too large to save. Try a smaller one.");
      return;
    }
    setBgUrl(bg);
    setShowBgChanger(false);
  };

  return {
    bgStyle: {
      background: `url("${bgUrl}") center/cover no-repeat fixed`,
      backgroundColor: "#2c3e50",
      minHeight: "100vh",
    },
    selected,
    customUrl,
    previewUpload,
    bgPresets,
    showBgChanger,
    isBgChangerMounted,
    isBgChangerVisible,
    compressing,
    uploadError,
    openBgChanger: () => setShowBgChanger(true),
    closeBgChanger: () => setShowBgChanger(false),
    applyBg,
    handleSelectPreset,
    handleImageUpload,
    handleCustomUrlChange,
  };
}
