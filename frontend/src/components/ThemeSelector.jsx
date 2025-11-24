import { useState } from "react";
import { Palette, Check, Sparkles } from "lucide-react";
import { getAllThemes, generateThemeFromPersonality } from "../lib/chatThemes";
import toast from "react-hot-toast";

const ThemeSelector = ({ isOpen, onClose, currentTheme, onSelectTheme, contactName }) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || "default");
  const themes = getAllThemes();

  const handleSelectTheme = (themeId) => {
    setSelectedTheme(themeId);
    const theme = themes.find((t) => t.id === themeId);
    if (onSelectTheme) {
      onSelectTheme(theme);
    }
    toast.success(`Theme "${theme.name}" applied!`);
  };

  const handleAIGenerate = () => {
    // Build keyword tokens from the contact name and simple heuristics
    const keywords = [];
    if (contactName) {
      // split words and emoji-ish characters
      const tokens = contactName
        .toLowerCase()
        .replace(/[^a-z0-9\s\u00C0-\u017F\u2190-\u21FF\u2600-\u26FF]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
      keywords.push(...tokens);

      // quick heuristics
      const lower = contactName.toLowerCase();
      if (lower.includes("love") || lower.includes("heart") || lower.includes("❤️")) keywords.push("romantic");
      if (lower.includes("pro") || lower.includes("work") || lower.includes("office")) keywords.push("professional");
      if (lower.includes("art") || lower.includes("design") || lower.includes("creative")) keywords.push("creative");
      if (lower.includes("green") || lower.includes("forest") || lower.includes("eco")) keywords.push("nature");
      if (lower.includes("dark") || lower.includes("night") || lower.includes("moon")) keywords.push("dark");
      if (lower.includes("warm") || lower.includes("coffee") || lower.includes("cozy")) keywords.push("warm");
      if (lower.includes("happy") || lower.includes("cheer")) keywords.push("happy");
    }

    const aiTheme = generateThemeFromPersonality(keywords);

    // Try to find a preset id that matches the returned preset
    const matched = themes.find((t) => t.name === aiTheme.name || t.primaryColor === aiTheme.primaryColor);
    const themeToApply = matched ? { id: matched.id, ...matched } : { id: aiTheme.name?.toLowerCase() || 'default', ...aiTheme };

    setSelectedTheme(themeToApply.id);
    if (onSelectTheme) onSelectTheme(themeToApply);
    toast.success("AI theme generated! ✨", { icon: "🎨" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Palette className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Choose Chat Theme</h3>
          </div>
          <button
            onClick={handleAIGenerate}
            className="btn btn-sm btn-outline gap-2"
          >
            <Sparkles size={16} />
            AI Generate
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Personalize this chat with a custom theme. Changes apply only to this conversation.
        </p>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleSelectTheme(theme.id)}
              className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                selectedTheme === theme.id
                  ? "border-primary shadow-lg"
                  : "border-base-300 hover:border-primary/50"
              }`}
            >
              {/* Theme Preview */}
              <div
                className="w-full h-24 rounded-md mb-3 overflow-hidden"
                style={{
                  background: theme.backgroundImage || theme.backgroundColor,
                }}
              >
                {/* Sample bubbles */}
                <div className="p-2 space-y-1">
                  <div
                    className="w-16 h-6 rounded-full ml-auto"
                    style={{
                      backgroundColor: theme.primaryColor,
                      opacity: theme.bubbleOpacity,
                    }}
                  />
                  <div
                    className="w-20 h-6 rounded-full"
                    style={{
                      backgroundColor: theme.secondaryColor,
                      opacity: theme.bubbleOpacity,
                    }}
                  />
                </div>
              </div>

              {/* Theme Name */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{theme.name}</span>
                {selectedTheme === theme.id && (
                  <Check size={18} className="text-primary" />
                )}
              </div>

              {/* Color Dots */}
              <div className="flex gap-1 mt-2">
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: theme.secondaryColor }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="btn btn-ghost">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
