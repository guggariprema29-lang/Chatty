import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

const TypingSpeed = ({ game, onMove, currentUser, onClose }) => {
  const prompt = game?.gameState?.prompt || "The quick brown fox jumps over the lazy dog.";
  const playerName = currentUser?.fullName || currentUser?.username || "You";
  const [text, setText] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wpm, setWpm] = useState(null);
  const startRef = useRef(null);

  useEffect(() => {
    return () => {
      // cleanup
    };
  }, []);

  const handleChange = (val) => {
    if (!started) {
      setStarted(true);
      startRef.current = Date.now();
    }
    // enforce max length equal to prompt length
    const capped = val.slice(0, prompt.length);
    setText(capped);
  };

  const handleFinish = async () => {
    if (!started) return;
    const durationMs = Date.now() - startRef.current;
    const words = text.trim().split(/\s+/).filter(Boolean).length || 0;
    const minutes = Math.max(durationMs / 60000, 1/60); // avoid divide by zero
    const computed = Math.round((words / minutes) * 10) / 10;
    setWpm(computed);
    setFinished(true);

    try {
      await onMove?.({
        type: "typing_result",
        wpm: computed,
        durationMs,
        typedText: text,
      });
      toast.success(`Recorded ${computed} WPM`);
    } catch (err) {
      console.error("Failed to send typing result", err);
      toast.error("Failed to record result");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold">Typing Speed</h3>
        <button className="btn btn-ghost btn-xs" onClick={() => onClose?.()}>Close</button>
      </div>

  <p className="mb-3 text-sm">Type the text below as quickly and accurately as you can. Press Finish when done.</p>
  {currentUser && <div className="text-xs text-neutral mb-2">Player: {playerName}</div>}

      <div className="p-3 border rounded mb-3 bg-base-200 font-mono">
        {/* Render prompt with per-character coloring based on typed input */}
        <p className="break-words leading-relaxed">
          {Array.from(prompt).map((ch, idx) => {
            const typedChar = text[idx];
            let cls = "opacity-60";
            if (typedChar !== undefined) {
              if (typedChar === ch) cls = "text-success";
              else cls = "text-error";
            }

            // visually show spaces and control characters clearly
            const display = ch === " " ? "\u00A0" : ch;

            return (
              <span key={idx} className={`inline-block ${cls}`}>
                {display}
              </span>
            );
          })}
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Start typing here..."
        className="textarea w-full h-28"
        aria-label="Type the prompt text"
      />

      {/* show mistakes count */}
      <div className="text-sm mt-2">
        {text.length > 0 && (
          <span>
            Mistakes: <strong className="text-error">{Array.from(text).reduce((acc, c, i) => acc + (c === prompt[i] ? 0 : 1), 0)}</strong>
          </span>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button className="btn btn-primary btn-sm" onClick={handleFinish} disabled={finished}>Finish</button>
        <button className="btn btn-ghost btn-sm" onClick={() => onClose?.()}>Close</button>
        {finished && <div className="ml-auto">WPM: <strong>{wpm}</strong></div>}
      </div>
    </div>
  );
};

export default TypingSpeed;
