import type { RunStatus, RunProgress } from "../types";
import "./RunButton.css";

interface RunButtonProps {
  status: RunStatus;
  progress: RunProgress;
  canRun: boolean;
  onRun: () => void;
  onCancel: () => void;
}

export function RunButton({
  status,
  progress,
  canRun,
  onRun,
  onCancel,
}: RunButtonProps) {
  const isRunning = status === "running";
  const pct =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div className="run-button-wrapper">
      {isRunning ? (
        <button className="run-button run-button--cancel" onClick={onCancel}>
          <span className="run-button__icon">⏹</span>
          Cancel
        </button>
      ) : (
        <button
          className="run-button run-button--run"
          onClick={onRun}
          disabled={!canRun}
        >
          <span className="run-button__icon">▶</span>
          Analyze Items
        </button>
      )}

      {isRunning && progress.total > 0 && (
        <div className="run-button__progress">
          <div className="run-button__progress-bar">
            <div
              className="run-button__progress-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="run-button__progress-text">
            {progress.current} / {progress.total} processed
          </span>
        </div>
      )}
    </div>
  );
}
