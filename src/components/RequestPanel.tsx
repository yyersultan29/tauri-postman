import { FormEvent, memo } from "react";
import { JsonCodeEditor } from "./JsonCodeEditor";
import { HttpMethod, NoticeState, RequestTab, Theme, methods } from "../types";

type RequestPanelProps = {
  activeTab: RequestTab | null;
  bodyJsonMode: boolean;
  notice: NoticeState | null;
  theme: Theme;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTitleChange: (value: string) => void;
  onMethodChange: (method: HttpMethod) => void;
  onUrlChange: (value: string) => void;
  onCopyCurl: () => void;
  onFormatBody: () => void;
  onClearBody: () => void;
  onAddHeader: () => void;
  onHeaderChange: (headerId: string, field: "key" | "value", value: string) => void;
  onRemoveHeader: (headerId: string) => void;
  onBodyChange: (value: string) => void;
};

export const RequestPanel = memo(function RequestPanel({
  activeTab,
  bodyJsonMode,
  notice,
  theme,
  onSubmit,
  onTitleChange,
  onMethodChange,
  onUrlChange,
  onCopyCurl,
  onFormatBody,
  onClearBody,
  onAddHeader,
  onHeaderChange,
  onRemoveHeader,
  onBodyChange,
}: RequestPanelProps) {
  return (
    <section className="panel request-panel">
      {activeTab ? (
        <form className="request-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Tab Title</span>
            <input
              value={activeTab.title}
              onChange={(event) => onTitleChange(event.currentTarget.value)}
              placeholder="User API"
              spellCheck={false}
            />
          </label>

          <div className="method-url-row">
            <label className="field method-field">
              <span>Method</span>
              <select value={activeTab.method} onChange={(event) => onMethodChange(event.currentTarget.value as HttpMethod)}>
                {methods.map((currentMethod) => (
                  <option key={currentMethod} value={currentMethod}>
                    {currentMethod}
                  </option>
                ))}
              </select>
            </label>

            <label className="field url-field">
              <span>URL</span>
              <input
                value={activeTab.url}
                onChange={(event) => onUrlChange(event.currentTarget.value)}
                placeholder="https://api.example.com/users"
                spellCheck={false}
              />
            </label>

            <button className="send-button" type="submit" disabled={activeTab.isSending}>
              {activeTab.isSending ? "Sending..." : "Send"}
            </button>
          </div>

          <div className="request-actions-row">
            <button className="tiny-button" type="button" onClick={onCopyCurl}>
              Copy cURL
            </button>
            <button className="tiny-button" type="button" onClick={onFormatBody}>
              Format JSON Body
            </button>
            <button className="tiny-button" type="button" onClick={onClearBody}>
              Clear Body
            </button>
            <span className="shortcut-label">Shortcut: Ctrl/Cmd + Enter</span>
          </div>

          {notice ? <p className={`notice notice-${notice.tone}`}>{notice.text}</p> : null}

          <div className="headers-panel">
            <div className="headers-toolbar">
              <span>Headers</span>
              <button className="tiny-button" type="button" onClick={onAddHeader}>
                + Add Header
              </button>
            </div>

            <div className="headers-rows">
              {activeTab.headers.map((header) => (
                <div className="header-row" key={header.id}>
                  <input
                    value={header.key}
                    onChange={(event) => onHeaderChange(header.id, "key", event.currentTarget.value)}
                    placeholder="Header key (e.g. Cookie)"
                    spellCheck={false}
                  />
                  <input
                    value={header.value}
                    onChange={(event) => onHeaderChange(header.id, "value", event.currentTarget.value)}
                    placeholder="Header value"
                    spellCheck={false}
                  />
                  <button className="header-remove" type="button" onClick={() => onRemoveHeader(header.id)}>
                    ×
                  </button>
                </div>
              ))}
            </div>

            <p className="hint headers-hint">
              Tip: for token in cookies, set key <code>Cookie</code> and value like <code>session=abc123</code>.
            </p>
          </div>

          <label className="field">
            <span>Body (optional)</span>
            <JsonCodeEditor
              value={activeTab.body}
              onChange={onBodyChange}
              theme={theme}
              height="220px"
              jsonMode={bodyJsonMode}
            />
          </label>

          {activeTab.error ? <p className="hint error-text">{activeTab.error}</p> : null}
        </form>
      ) : null}
    </section>
  );
});
