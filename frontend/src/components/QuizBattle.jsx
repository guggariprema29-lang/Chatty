import { useState } from "react";
import toast from "react-hot-toast";

const QuizBattle = ({ game, onMove, currentUser, onClose }) => {
  const playerName = currentUser?.fullName || currentUser?.username || "You";
  const questions = (game?.gameState?.questions && game.gameState.questions.length > 0)
    ? game.gameState.questions
    : [
    {
      id: 0,
      text: "What is the capital of France?",
      options: ["Paris", "London", "Rome", "Berlin"],
      correctOption: 0,
    },
  ];

  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const question = questions[qIndex];

  if (!question) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold">Quiz Battle</h3>
          <button className="btn btn-ghost btn-xs" onClick={() => onClose?.()}>Close</button>
        </div>
        <div className="text-center text-sm text-base-content/60">No questions available for this quiz.</div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (selected === null) {
      toast.error("Select an option");
      return;
    }
    const correct = question.correctOption === selected;
    setSubmitted(true);

    try {
      await onMove?.({
        type: "quiz_answer",
        questionIndex: qIndex,
        selectedOption: selected,
        correct,
      });
      toast.success(correct ? "Correct!" : "Answer submitted");
    } catch (err) {
      console.error("Failed to submit quiz answer", err);
      toast.error("Failed to send answer");
    }
  };

  const handleNext = () => {
    setSelected(null);
    setSubmitted(false);
    if (qIndex < questions.length - 1) setQIndex((i) => i + 1);
    else onClose?.();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold">Quiz Battle</h3>
        <button className="btn btn-ghost btn-xs" onClick={() => onClose?.()}>Close</button>
      </div>

      <div>
        {currentUser && <div className="text-xs text-neutral mb-2">Player: {playerName}</div>}
        <p className="mb-2 font-medium">Q{qIndex + 1}. {question.text}</p>
        <div className="grid gap-2">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              className={`btn btn-block text-left ${selected === idx ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => !submitted && setSelected(idx)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {!submitted ? (
          <button className="btn btn-sm btn-primary" onClick={handleSubmit}>Submit</button>
        ) : (
          <button className="btn btn-sm" onClick={handleNext}>{qIndex < questions.length - 1 ? 'Next' : 'Finish'}</button>
        )}
        <button className="btn btn-sm btn-ghost" onClick={() => onClose?.()}>Close</button>
      </div>
    </div>
  );
};

export default QuizBattle;
