import { useState } from "react";
import type { InstructionGroup, ItemResult, IssueLevel } from "../types";
import { OptionBadge } from "./OptionBadge";
import "./ItemCard.css";

interface ItemCardProps {
  group: InstructionGroup;
  index: number;
}

const ISSUE_CONFIG: Record<IssueLevel, { label: string; className: string }> = {
  none: { label: "✅ Ready", className: "issue--none" },
  minor: { label: "📝 Minor", className: "issue--minor" },
  moderate: { label: "⚠️ Moderate", className: "issue--moderate" },
  major: { label: "🚫 Major", className: "issue--major" },
};

const CEFR_COLORS: Record<string, string> = {
  A1: "#22c55e",
  A2: "#16a34a",
  B1: "#3b82f6",
  B2: "#2563eb",
  C1: "#a855f7",
  C2: "#7c3aed",
};

export function ItemCard({ group, index }: ItemCardProps) {
  return (
    <div className="item-card" style={{ animationDelay: `${index * 0.08}s` }}>
      {/* Instruction header */}
      <div className="item-card__header">
        <span className="item-card__number">#{index + 1}</span>
        <h3 className="item-card__instruction">{group.instruction || "Instruction Group"}</h3>
      </div>

      {/* Stimulus */}
      {group.stimulus && (
        <div className="item-card__stimulus">
          <p className="item-card__stimulus-text">{group.stimulus}</p>
        </div>
      )}

      {/* Stimulus feedback */}
      {group.stimulus_feedback && (
        <div className="item-card__feedback-block">
          <p>{group.stimulus_feedback}</p>
        </div>
      )}

      {/* Items */}
      <div className="item-card__header">
        <span className="item-card__instruction">Items</span>        
      </div>
      <div className="item-card__items">
        {group.items.map((item) => (
          <SingleItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function SingleItem({ item }: { item: ItemResult }) {
  const [expanded, setExpanded] = useState(false);
  const issue = ISSUE_CONFIG[item.issue_level];

  return (
    <div className="single-item">
      <button
        className="single-item__header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="single-item__header-left">
          <span className={`single-item__issue-tag ${issue.className}`}>
            {issue.label}
          </span>
          <span className="single-item__stem">{item.id}. {item.stem}</span>
        </div>
        <div className="single-item__badges">
          <span
            className="single-item__badge single-item__badge--cefr"
            style={{ background: CEFR_COLORS[item.cefr_level] || "#6b7280" }}
          >
            {item.cefr_level}
          </span>
          <span className="single-item__badge single-item__badge--cognitive">
            {item.cognitive_level}
          </span>
          <span className="single-item__badge single-item__badge--difficulty">
            {item.difficulty}
          </span>
          <span className="single-item__badge single-item__badge--disc">
            {item.discrimination}
          </span>
        </div>
        <span className="single-item__chevron">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="single-item__body">
          {/* Options */}
          <div className="single-item__options">
            <div className="single-item__options-grid">
              {item.options.map((option, idx) => (
                <OptionBadge
                  key={idx}
                  label={option.label}
                  option={option}
                />
              ))}
            </div>
          </div>
                    {/* Meta info */}
          <div className="single-item__meta-grid">
            <div className="single-item__meta-item">
              <span className="single-item__meta-label">🎯 Objective</span>
              <span className="single-item__meta-value">{item.objective}</span>
            </div>
            <div className="single-item__meta-item">
              <span className="single-item__meta-label">🔍 Construct Validity</span>
              <span className="single-item__meta-value">{item.construct_validity}</span>
            </div>
          </div>

          {/* Item feedback */}
          {item.item_feedback && (
            <div className="single-item__feedback">
              <span className="single-item__feedback-label">💬 Item Feedback</span>
              <p>{item.item_feedback}</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
