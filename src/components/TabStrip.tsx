import { memo } from "react";
import { RequestTab } from "../types";

type TabStripProps = {
  tabs: RequestTab[];
  activeTabId: string;
  onSelect: (tabId: string) => void;
  onClose: (tabId: string) => void;
};

export const TabStrip = memo(function TabStrip({ tabs, activeTabId, onSelect, onClose }: TabStripProps) {
  return (
    <section className="panel tab-strip">
      {tabs.map((tab) => (
        <div className={`tab-item ${tab.id === activeTabId ? "active" : ""}`} key={tab.id}>
          <button className="tab-main" type="button" onClick={() => onSelect(tab.id)}>
            <span className={`method-pill method-${tab.method.toLowerCase()}`}>{tab.method}</span>
            <span className="tab-name">{tab.title}</span>
            {tab.isSending ? <span className="tab-sending">Sending...</span> : null}
          </button>
          <button
            className="tab-close"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClose(tab.id);
            }}
            disabled={tabs.length === 1}
            aria-label={`Close ${tab.title}`}
          >
            ×
          </button>
        </div>
      ))}
    </section>
  );
});
