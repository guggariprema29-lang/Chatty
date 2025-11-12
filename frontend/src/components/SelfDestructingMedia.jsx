import { useState, useEffect } from "react";
import { Eye, EyeOff, Clock, Flame } from "lucide-react";

const SelfDestructingMedia = ({ mediaUrl, caption, destructTime = 10, onDestruct }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isDestroyed, setIsDestroyed] = useState(false);

  useEffect(() => {
    if (isRevealed && !isDestroyed) {
      setTimeLeft(destructTime);

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleDestruct();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRevealed, isDestroyed]);

  const handleDestruct = () => {
    setIsDestroyed(true);
    if (onDestruct) onDestruct();
  };

  if (isDestroyed) {
    return (
      <div className="bg-base-200 rounded-lg p-8 text-center">
        <Flame className="mx-auto mb-2 text-error" size={32} />
        <p className="text-sm opacity-70">This media has self-destructed</p>
      </div>
    );
  }

  if (!isRevealed) {
    return (
      <div className="bg-base-200 rounded-lg p-6 text-center">
        <div className="mb-4">
          <EyeOff className="mx-auto text-primary" size={48} />
        </div>
        {caption && (
          <p className="text-sm mb-4 italic">"{caption}"</p>
        )}
        <button
          onClick={() => setIsRevealed(true)}
          className="btn btn-primary btn-sm gap-2"
        >
          <Eye size={16} />
          Tap to View (Self-Destructs in {destructTime}s)
        </button>
        <p className="text-xs opacity-50 mt-2">
          ⚠️ This media will disappear after viewing
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Countdown Timer */}
      <div className="absolute top-2 right-2 bg-error text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 animate-pulse z-10">
        {timeLeft <= 3 ? <Flame size={14} /> : <Clock size={14} />}
        {timeLeft}s
      </div>

      {/* Media */}
      <img
        src={mediaUrl}
        alt="Self-destructing media"
        className="rounded-lg max-w-full"
        style={{
          animation: timeLeft <= 3 ? "shake 0.5s infinite" : "none",
        }}
      />

      {caption && (
        <p className="text-sm mt-2 text-center italic opacity-70">{caption}</p>
      )}
    </div>
  );
};

export default SelfDestructingMedia;
