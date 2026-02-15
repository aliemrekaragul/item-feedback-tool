import { useTheme } from "../context/ThemeContext";
import "./ThemeToggle.css";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      aria-label="Toggle theme"
    >
      <span className="theme-toggle__icon">
        {theme === "light" ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
