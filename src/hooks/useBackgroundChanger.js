import { useState } from "react";
import { bgPresets, getCurrentBg } from "../utils/styles";

export function useBackgroundChanger(onApply, onClose) {
  const [selected, setSelected] = useState(getCurrentBg());
  const [customUrl, setCustomUrl] = useState("");
  const [previewUpload, setPreviewUpload] = useState(null);
  const [showBgChanger, setShowBgChanger] = useState(false);
  const [bgUrl, setBgUrl] = useState(getCurrentBg());

  const handleSelectPreset = (url) => {
    setSelected(url);
    setCustomUrl("");
    setPreviewUpload(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUpload(reader.result);
      setSelected(reader.result);
      setCustomUrl("");
    };
    reader.readAsDataURL(file);
  };

  const handleCustomUrlChange = (url) => {
    setCustomUrl(url);
    setPreviewUpload(null);
  };

  const applyBg = () => {
    const bg = customUrl.trim() || selected;
    localStorage.setItem("pos_background", bg);
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
    openBgChanger: () => setShowBgChanger(true),
    closeBgChanger: () => setShowBgChanger(false),
    applyBg,
    handleSelectPreset,
    handleImageUpload,
    handleCustomUrlChange,
  };
}
