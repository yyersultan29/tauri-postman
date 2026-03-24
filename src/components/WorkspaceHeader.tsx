import { memo } from "react";
import { APP_NAME } from "../constants";
import { Theme } from "../types";

type WorkspaceHeaderProps = {
  theme: Theme;
  hasActiveTab: boolean;
  onAddTab: () => void;
  onDuplicateTab: () => void;
  onToggleTheme: () => void;
};

export const WorkspaceHeader = memo(function WorkspaceHeader({
  theme,
  hasActiveTab,
  onAddTab,
  onDuplicateTab,
  onToggleTheme,
}: WorkspaceHeaderProps) {
  return (
    <header className="panel workspace-header">
      <div className="workspace-title">
        <h1>{APP_NAME}</h1>
        <p>Tabs + parallel requests. Send one request and keep testing in other tabs.</p>
      </div>

      <div className="workspace-actions">
        <button className="secondary-button" type="button" onClick={onAddTab}>
          + New Tab
        </button>
        <button className="secondary-button" type="button" onClick={onDuplicateTab} disabled={!hasActiveTab}>
          Duplicate
        </button>
        <button className="theme-button" type="button" onClick={onToggleTheme}>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </header>
  );
});
