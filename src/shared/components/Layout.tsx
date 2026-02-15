import type { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";
import "./Layout.css";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__header-inner">
          <div className="layout__brand">
            <span className="layout__logo">🎓</span>
            <div>
              <h1 className="layout__title">ESL Item Feedback Tool</h1>
              <p className="layout__subtitle">
                AI-Powered Assessment Item Analysis
              </p>
            </div>
          </div>
          <nav className="layout__nav">
            <span className="layout__nav-item layout__nav-item--active">
              Item Feedback
            </span>
            <span className="layout__nav-item layout__nav-item--soon">
              Item Generation
              <span className="layout__soon-badge">Soon</span>
            </span>
            <span className="layout__nav-item layout__nav-item--soon">
              Auto Scoring
              <span className="layout__soon-badge">Soon</span>
            </span>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <div className="layout__content">{children}</div>
    </div>
  );
}
