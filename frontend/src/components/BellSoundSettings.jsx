import { useState, useEffect } from "react";
import { Volume2, Music, X } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import {
  playClassicBell,
  playChime,
  playDigitalBeep,
  playGentleTone,
  playAlarmSound,
} from "../lib/buzzer";

const BellSoundSettings = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState({
    bellSoundPreference: "classic",
    bellSoundVolume: 0.5,
    bellSoundEnabled: true,
  });
  const [availableSounds, setAvailableSounds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const bellSoundFunctions = {
    classic: playClassicBell,
    chime: playChime,
    digital: playDigitalBeep,
    gentle: playGentleTone,
    alarm: playAlarmSound,
  };

  useEffect(() => {
    if (isOpen) {
      loadPreferences();
      loadAvailableSounds();
    }
  }, [isOpen]);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/auth/bell-sounds/preferences");
      setPreferences(res.data);
    } catch (error) {
      console.error("Failed to load preferences:", error);
      toast.error("Failed to load bell sound preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableSounds = async () => {
    try {
      const res = await axiosInstance.get("/auth/bell-sounds/available");
      setAvailableSounds(res.data);
    } catch (error) {
      console.error("Failed to load available sounds:", error);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePlaySound = (soundType) => {
    const playFunction = bellSoundFunctions[soundType];
    if (playFunction) {
      playFunction(preferences.bellSoundVolume);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axiosInstance.put("/auth/bell-sounds/preferences", preferences);
      toast.success("Bell sound preferences saved!");
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast.error("Failed to save bell sound preferences");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Music className="text-primary" size={24} />
            <h3 className="text-xl font-semibold">Bell Sound Settings</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text font-semibold">Enable Bell Sounds</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={preferences.bellSoundEnabled}
                  onChange={(e) =>
                    handlePreferenceChange("bellSoundEnabled", e.target.checked)
                  }
                />
              </label>
            </div>

            {/* Sound Selection */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Select Bell Sound</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableSounds.map((sound) => (
                  <div
                    key={sound.type}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      preferences.bellSoundPreference === sound.type
                        ? "border-primary bg-primary/10"
                        : "border-base-300 hover:border-primary/50"
                    }`}
                    onClick={() =>
                      handlePreferenceChange("bellSoundPreference", sound.type)
                    }
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{sound.name}</h4>
                        <p className="text-xs opacity-70">{sound.description}</p>
                      </div>
                      <button
                        className="btn btn-xs btn-ghost gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaySound(sound.type);
                        }}
                      >
                        <Music size={14} />
                        Play
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Volume Control */}
            <div>
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <Volume2 size={16} />
                  Volume
                </span>
                <span className="label-text-alt font-mono">
                  {Math.round(preferences.bellSoundVolume * 100)}%
                </span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={preferences.bellSoundVolume}
                  onChange={(e) =>
                    handlePreferenceChange("bellSoundVolume", parseFloat(e.target.value))
                  }
                  className="range range-primary flex-1"
                />
                <button
                  className="btn btn-sm btn-ghost gap-1"
                  onClick={() => handlePlaySound(preferences.bellSoundPreference)}
                >
                  <Music size={16} />
                  Preview
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn btn-primary flex-1"
              >
                {isSaving ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  "Save Preferences"
                )}
              </button>
              <button onClick={onClose} className="btn btn-ghost flex-1">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BellSoundSettings;
