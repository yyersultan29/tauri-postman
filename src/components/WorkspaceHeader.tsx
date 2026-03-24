import { memo } from "react";
import { APP_NAME } from "../constants";
import { Theme } from "../types";

type WorkspaceHeaderProps = {
  theme: Theme;
  onAddTab: () => void;
  onToggleTheme: () => void;
};

export const WorkspaceHeader = memo(function WorkspaceHeader({ theme, onAddTab, onToggleTheme }: WorkspaceHeaderProps) {
  return (
    <header className="panel workspace-header">
      <div className="workspace-title">
        <h1>{APP_NAME}</h1>
        <p>Simple API testing workspace</p>
      </div>

      <div className="workspace-actions">
        <button className="secondary-button" type="button" onClick={onAddTab}>
          + New Tab
        </button>
        <button className="theme-button" type="button" onClick={onToggleTheme}>
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>
    </header>
  );
});
