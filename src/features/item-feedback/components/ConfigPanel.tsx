import { GeminiModel, MODEL_DISPLAY_NAMES } from "../types";
import "./ConfigPanel.css";

interface ConfigPanelProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  model: GeminiModel;
  onModelChange: (model: GeminiModel) => void;
  disabled?: boolean;
}

export function ConfigPanel({
  apiKey,
  onApiKeyChange,
  model,
  onModelChange,
  disabled,
}: ConfigPanelProps) {
  return (
    <div className="config-panel">
      <h3 className="config-panel__title">
        <span className="config-panel__icon">🔑</span>
        Configuration
      </h3>

      <div className="config-panel__field">
        <input
          id="api-key"
          type="password"
          className="config-panel__input"
          placeholder="Enter your Gemini API key..."
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          disabled={disabled}
          autoComplete="off"
        />
      </div>

      <div className="config-panel__field">
        <select
          id="model-select"
          className="config-panel__select"
          value={model}
          onChange={(e) => onModelChange(e.target.value as GeminiModel)}
          disabled={disabled}
        >
          {Object.values(GeminiModel).map((m) => (
            <option key={m} value={m}>
              {MODEL_DISPLAY_NAMES[m]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
