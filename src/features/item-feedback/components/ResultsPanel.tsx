import type { InstructionGroup, RunStatus } from "../types";
import { ItemCard } from "./ItemCard";
import "./ResultsPanel.css";

interface ResultsPanelProps {
  results: InstructionGroup[];
  status: RunStatus;
  error: string | null;
}

export function ResultsPanel({ results, status, error }: ResultsPanelProps) {
  // Empty state (only if no results AND no error AND not running)
  if (!error && results.length === 0 && status !== "running") {
    return (
      <div className="results-panel results-panel--empty">
        <div className="results-panel__empty-state">
          <span className="results-panel__empty-icon">📋</span>
          <h3>No Results Yet</h3>
          <p>
            Configure your API key, upload test items, and click{" "}
            <strong>Analyze Items</strong> to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-panel">
      <div className="results-panel__header">
        <h2 className="results-panel__title">
          <span>📊</span> Analysis Results
        </h2>
        {status === "running" && (
          <div className="results-panel__spinner">
            <div className="results-panel__spinner-dot" />
            <span>Analyzing...</span>
          </div>
        )}
        {status === "done" && (
          <span className="results-panel__done-badge">✅ Complete</span>
        )}
      </div>

      {error && (
        <div className="results-panel__error">
          <span>❌</span>
          <p>{error}</p>
        </div>
      )}

      <div className="results-panel__list">
        {results.map((group, i) => (
          <ItemCard key={i} group={group} index={i} />
        ))}
      </div>

      {status === "running" && (
        <div className="results-panel__loading-card">
          <div className="results-panel__pulse" />
          <span>Waiting for the feedback...</span>
        </div>
      )}
    </div>
  );
}
