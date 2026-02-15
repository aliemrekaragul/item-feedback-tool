import { useState } from "react";
import "./FieldSelector.css";

const AVAILABLE_FIELDS = [
  { key: "stimulus_feedback", label: "Stimulus Feedback" },
  { key: "item_feedback", label: "Item Feedback" },
  { key: "construct_validity", label: "Construct Validity" },
  { key: "options_improvement", label: "Option Improvements" },
  { key: "discrimination", label: "Discrimination Analysis" },
  { key: "cefr_level", label: "CEFR Level" },
  { key: "cognitive_level", label: "Cognitive Level" },
  { key: "difficulty", label: "Difficulty" },
  { key: "objective", label: "Learning Objective" },
] as const;

interface FieldSelectorProps {
  selectedFields: string[];
  onFieldsChange: (fields: string[]) => void;
  disabled?: boolean;
}

export function FieldSelector({
  selectedFields,
  onFieldsChange,
  disabled,
}: FieldSelectorProps) {
  const [expanded, setExpanded] = useState(false);

  const toggle = (key: string) => {
    if (selectedFields.includes(key)) {
      onFieldsChange(selectedFields.filter((f) => f !== key));
    } else {
      onFieldsChange([...selectedFields, key]);
    }
  };

  return (
    <div className="field-selector">
      <button
        className="field-selector__toggle"
        onClick={() => setExpanded(!expanded)}
        disabled={disabled}
      >
        <span className="field-selector__toggle-icon">
          {expanded ? "▾" : "▸"}
        </span>
        <span>
          🎯 Focus Fields{" "}
          <span className="field-selector__count">
            {selectedFields.length > 0
              ? `(${selectedFields.length} selected)`
              : "(all included)"}
          </span>
        </span>
      </button>

      {expanded && (
        <div className="field-selector__grid">
          {AVAILABLE_FIELDS.map(({ key, label }) => (
            <label
              key={key}
              className={`field-selector__chip ${
                selectedFields.includes(key) ? "field-selector__chip--active" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={selectedFields.includes(key)}
                onChange={() => toggle(key)}
                disabled={disabled}
                hidden
              />
              <span className="field-selector__chip-dot" />
              {label}
            </label>
          ))}
          <p className="field-selector__hint">
            Select fields to emphasize in the analysis. Leave empty for comprehensive feedback on all aspects.
          </p>
        </div>
      )}
    </div>
  );
}
