import type { OptionFeedback } from "../types";
import "./OptionBadge.css";

interface OptionBadgeProps {
  label: string | null;
  option: OptionFeedback;
}

export function OptionBadge({ label, option }: OptionBadgeProps) {
  const displayLabel = label || "";
  return (
    <div
      className={`option-badge ${
        option.is_correct ? "option-badge--correct" : "option-badge--distractor"
      }`}
    >
      <div className="option-badge__header">
        {displayLabel && (
          <span className="option-badge__label">{displayLabel}</span>
        )}
        <span className="option-badge__value">{option.value}</span>
      </div>

      <p className="option-badge__feedback">{option.feedback}</p>

      {option.improvement && (
        <div className="option-badge__improvement">
          <span className="option-badge__improvement-label">💡 Suggested:</span>
          <span className="option-badge__improvement-text">
            {option.improvement}
          </span>
        </div>
      )}
    </div>
  );
}
