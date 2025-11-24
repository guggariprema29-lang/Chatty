// Chat Theme Presets and AI-Generated Themes

export const themePresets = {
  default: {
    name: "Default",
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    backgroundColor: "#ffffff",
    backgroundImage: null,
    messageColor: "#1f2937",
    bubbleOpacity: 1,
  },
  ocean: {
    name: "Ocean Blue",
    primaryColor: "#0ea5e9",
    secondaryColor: "#06b6d4",
    backgroundColor: "#f0f9ff",
    backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    messageColor: "#0c4a6e",
    bubbleOpacity: 0.95,
  },
  sunset: {
    name: "Sunset",
    primaryColor: "#f97316",
    secondaryColor: "#ec4899",
    backgroundColor: "#fff7ed",
    backgroundImage: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    messageColor: "#7c2d12",
    bubbleOpacity: 0.95,
  },
  forest: {
    name: "Forest Green",
    primaryColor: "#22c55e",
    secondaryColor: "#10b981",
    backgroundColor: "#f0fdf4",
    backgroundImage: "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)",
    messageColor: "#14532d",
    bubbleOpacity: 0.95,
  },
  night: {
    name: "Dark Night",
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    backgroundColor: "#0f172a",
    backgroundImage: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
    messageColor: "#e2e8f0",
    bubbleOpacity: 0.9,
  },
  rose: {
    name: "Rose Garden",
    primaryColor: "#ec4899",
    secondaryColor: "#f43f5e",
    backgroundColor: "#fdf2f8",
    backgroundImage: "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
    messageColor: "#831843",
    bubbleOpacity: 0.95,
  },
  lavender: {
    name: "Lavender Dreams",
    primaryColor: "#a78bfa",
    secondaryColor: "#c084fc",
    backgroundColor: "#faf5ff",
    backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    messageColor: "#581c87",
    bubbleOpacity: 0.95,
  },
  minimal: {
    name: "Minimal White",
    primaryColor: "#64748b",
    secondaryColor: "#94a3b8",
    backgroundColor: "#f8fafc",
    backgroundImage: null,
    messageColor: "#1e293b",
    bubbleOpacity: 1,
  },
  dark: {
    name: "Dark Mode",
    primaryColor: "#3b82f6",
    secondaryColor: "#60a5fa",
    backgroundColor: "#1e293b",
    backgroundImage: null,
    messageColor: "#f1f5f9",
    bubbleOpacity: 0.9,
  },
  warm: {
    name: "Warm Coffee",
    primaryColor: "#d97706",
    secondaryColor: "#ea580c",
    backgroundColor: "#fffbeb",
    backgroundImage: "linear-gradient(135deg, #ff9a56 0%, #fecfef 100%)",
    messageColor: "#78350f",
    bubbleOpacity: 0.95,
  },
};

/**
 * Get theme by name
 */
export const getTheme = (themeName) => {
  return themePresets[themeName] || themePresets.default;
};

/**
 * Get all available themes
 */
export const getAllThemes = () => {
  return Object.entries(themePresets).map(([key, theme]) => ({
    id: key,
    ...theme,
  }));
};

/**
 * Generate AI-like theme based on personality keywords
 */
export const generateThemeFromPersonality = (keywords = []) => {
  const lowerKeywords = keywords.map((k) => k.toLowerCase());

  // Happy, cheerful, positive
  if (
    lowerKeywords.some((k) =>
      ["happy", "cheerful", "positive", "bright", "sunny"].includes(k)
    )
  ) {
    return getTheme("sunset");
  }

  // Calm, peaceful, serene
  if (
    lowerKeywords.some((k) =>
      ["calm", "peaceful", "serene", "quiet", "zen"].includes(k)
    )
  ) {
    return getTheme("ocean");
  }

  // Professional, serious, business
  if (
    lowerKeywords.some((k) =>
      ["professional", "business", "serious", "formal"].includes(k)
    )
  ) {
    return getTheme("minimal");
  }

  // Creative, artistic, colorful
  if (
    lowerKeywords.some((k) =>
      ["creative", "artistic", "colorful", "vibrant"].includes(k)
    )
  ) {
    return getTheme("lavender");
  }

  // Nature, outdoor, green
  if (
    lowerKeywords.some((k) =>
      ["nature", "outdoor", "green", "eco", "earth"].includes(k)
    )
  ) {
    return getTheme("forest");
  }

  // Romantic, love, sweet
  if (
    lowerKeywords.some((k) =>
      ["romantic", "love", "sweet", "gentle", "soft"].includes(k)
    )
  ) {
    return getTheme("rose");
  }

  // Dark, mysterious, night
  if (
    lowerKeywords.some((k) =>
      ["dark", "mysterious", "night", "moon", "shadow"].includes(k)
    )
  ) {
    return getTheme("night");
  }

  // Warm, cozy, comfort
  if (
    lowerKeywords.some((k) =>
      ["warm", "cozy", "comfort", "coffee", "autumn"].includes(k)
    )
  ) {
    return getTheme("warm");
  }

  return getTheme("default");
};

/**
 * Apply theme to CSS variables
 */
export const applyTheme = (theme) => {
  const root = document.documentElement;

  if (theme.primaryColor) root.style.setProperty("--chat-primary", theme.primaryColor);
  if (theme.secondaryColor) root.style.setProperty("--chat-secondary", theme.secondaryColor);
  if (theme.backgroundColor) root.style.setProperty("--chat-bg", theme.backgroundColor);
  if (theme.messageColor) root.style.setProperty("--chat-text", theme.messageColor);
  if (typeof theme.bubbleOpacity !== 'undefined') root.style.setProperty("--chat-bubble-opacity", String(theme.bubbleOpacity));
  // background image (optional)
  if (theme.backgroundImage) root.style.setProperty("--chat-bg-image", theme.backgroundImage);
  else root.style.removeProperty("--chat-bg-image");

  // Also set body background for immediate visual change
  try {
    if (theme.backgroundImage) document.body.style.background = theme.backgroundImage;
    else if (theme.backgroundColor) document.body.style.background = theme.backgroundColor;
  } catch (err) {
    // ignore in non-browser environments
  }
};

/**
 * Reset theme to default
 */
export const resetTheme = () => {
  applyTheme(themePresets.default);
};
