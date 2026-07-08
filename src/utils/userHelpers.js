export const checkPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: "Very Weak", color: "#e74c3c" };
  if (score === 2) return { score, label: "Weak", color: "#e67e22" };
  if (score === 3) return { score, label: "Fair", color: "#f1c40f" };
  if (score === 4) return { score, label: "Strong", color: "#2ecc71" };
  return { score, label: "Very Strong", color: "#27ae60" };
};

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const compressImage = async (file) => {
  const imageCompression = (await import("browser-image-compression")).default;
  const options = {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 400,
    useWebWorker: true,
  };
  const compressed = await imageCompression(file, options);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Read failed"));
    reader.readAsDataURL(compressed);
  });
};
