import { useState, useEffect } from "react";
import { getRemainingTime, formatRemainingTime, getExpirationEmoji, getExpirationColor } from "../lib/messageExpiration";

/**
 * ExpiringMessage - Shows countdown timer for auto-deleting messages
 */
const ExpiringMessage = ({ expiresAt, onExpire }) => {
  const [remaining, setRemaining] = useState(getRemainingTime(expiresAt));

  useEffect(() => {
    if (!expiresAt) return;

    // Update every second
    const interval = setInterval(() => {
      const newRemaining = getRemainingTime(expiresAt);
      setRemaining(newRemaining);

      if (newRemaining === 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (!expiresAt || remaining === null || remaining === 0) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1 text-xs mt-1">
      <span className={getExpirationColor(remaining)}>
        {getExpirationEmoji(remaining)}
      </span>
      <span className={`${getExpirationColor(remaining)} font-mono`}>
        {formatRemainingTime(remaining)}
      </span>
    </div>
  );
};

export default ExpiringMessage;
