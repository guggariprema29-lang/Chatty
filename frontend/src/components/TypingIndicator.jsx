// Simple typing indicator component
const TypingIndicator = ({ name }) => {
	if (!name) return null;
	return (
		<div className="px-4 py-2 text-sm text-base-content/70">
			{name} is typing...
		</div>
	);
};

export default TypingIndicator;
