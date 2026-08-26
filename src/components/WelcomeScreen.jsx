import { Code2, Lightbulb, PenLine, Sparkles } from "lucide-react";

function WelcomeScreen({ onSuggestionClick }) {
  const suggestions = [
    {
      icon: <Code2 size={20} />,
      title: "Write code",
      prompt: "Explain React hooks with examples",
    },
    {
      icon: <Lightbulb size={20} />,
      title: "Learn something",
      prompt: "Teach me JavaScript closures",
    },
    {
      icon: <PenLine size={20} />,
      title: "Write something",
      prompt: "Write a professional introduction for my portfolio",
    },
  ];

  return (
    <div className="welcome-screen">
      <div className="welcome-icon">
        <Sparkles size={28} />
      </div>

      <h2>
        Welcome to <span>AIVerse</span>
      </h2>

      <p>
        Your AI-powered assistant for learning, coding,
        writing and exploring ideas.
      </p>

      <div className="suggestions">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.title}
            className="suggestion-card"
            onClick={() => onSuggestionClick(suggestion.prompt)}
          >
            <div className="suggestion-icon">
              {suggestion.icon}
            </div>

            <div>
              <strong>{suggestion.title}</strong>
              <span>{suggestion.prompt}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default WelcomeScreen;
