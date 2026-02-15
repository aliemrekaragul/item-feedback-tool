import { useState, useCallback } from "react";
import { GeminiModel } from "./types";
import type { UploadedFile } from "./types";
import { useItemFeedback } from "./hooks/useItemFeedback";
import { ConfigPanel } from "./components/ConfigPanel";
import { InputPanel } from "./components/InputPanel";
import { RunButton } from "./components/RunButton";
import { ResultsPanel } from "./components/ResultsPanel";
import "./ItemFeedbackPage.css";

export function ItemFeedbackPage() {
  // Config state
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState<GeminiModel>(GeminiModel.GEMINI_2_5_FLASH);

  // Input state
  const [rawText, setRawText] = useState("");
  const [txtFiles, setTxtFiles] = useState<UploadedFile[]>([]);
  const [imageFiles, setImageFiles] = useState<UploadedFile[]>([]);

  // Feedback hook
  const { results, status, progress, error, run, cancel, reset } =
    useItemFeedback();

  const isRunning = status === "running";
  const hasInput =
    rawText.trim().length > 0 || txtFiles.length > 0 || imageFiles.length > 0;
  const canRun = apiKey.trim().length > 0 && hasInput && !isRunning;

  const handleRun = useCallback(() => {
    run(rawText, txtFiles, imageFiles, apiKey, model);
  }, [rawText, txtFiles, imageFiles, apiKey, model, run]);

  const handleReset = useCallback(() => {
    reset();
    setRawText("");
    setTxtFiles([]);
    setImageFiles([]);
  }, [reset]);

  return (
    <div className="feedback-page">
      {/* Left panel — Configuration & Input */}
      <aside className="feedback-page__sidebar">
        <ConfigPanel
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          model={model}
          onModelChange={setModel}
          disabled={isRunning}
        />

        <InputPanel
          rawText={rawText}
          onRawTextChange={setRawText}
          txtFiles={txtFiles}
          onTxtFilesChange={setTxtFiles}
          imageFiles={imageFiles}
          onImageFilesChange={setImageFiles}
          disabled={isRunning}
        />

        <RunButton
          status={status}
          progress={progress}
          canRun={canRun}
          onRun={handleRun}
          onCancel={cancel}
        />

        {(status === "done" || status === "error") && (
          <button className="feedback-page__reset-btn" onClick={handleReset}>
            🔄 Reset All
          </button>
        )}
      </aside>

      {/* Right panel — Results */}
      <main className="feedback-page__main">
        <ResultsPanel results={results} status={status} error={error} />
      </main>
    </div>
  );
}
