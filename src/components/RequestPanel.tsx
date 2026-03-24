import { FormEvent, memo } from "react";
import { JsonCodeEditor } from "./JsonCodeEditor";
import { HttpMethod, NoticeState, RequestTab, Theme, methods } from "../types";

type RequestPanelProps = {
  activeTab: RequestTab | null;
  activeAuthToken: string;
  bodyJsonMode: boolean;
  notice: NoticeState | null;
  theme: Theme;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onAuthTokenChange: (value: string) => void;
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
  activeAuthToken,
  bodyJsonMode,
  notice,
  theme,
  onSubmit,
  onAuthTokenChange,
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
              <span>Request URL</span>
              <input
                value={activeTab.url}
                onChange={(event) => onUrlChange(event.currentTarget.value)}
                placeholder="https://api.example.com/v1/users"
                spellCheck={false}
              />
            </label>

            <button className="send-button" type="submit" disabled={activeTab.isSending}>
              {activeTab.isSending ? "Sending..." : "Send"}
            </button>
          </div>

          <label className="field">
            <span>Request Name (optional)</span>
            <input
              value={activeTab.title}
              onChange={(event) => onTitleChange(event.currentTarget.value)}
              placeholder="Checkout API"
              spellCheck={false}
            />
          </label>

          <div className="request-actions-row">
            <button className="tiny-button" type="button" onClick={onCopyCurl}>
              Copy cURL
            </button>
            <button className="tiny-button" type="button" onClick={onFormatBody}>
              Format JSON
            </button>
            <button className="tiny-button" type="button" onClick={onClearBody}>
              Clear Body
            </button>
            <span className="shortcut-label">Ctrl/Cmd + Enter</span>
          </div>

          {notice ? <p className={`notice notice-${notice.tone}`}>{notice.text}</p> : null}

          <details className="section-card" open>
            <summary>Body</summary>
            <label className="field">
              <span>JSON or text body</span>
              <JsonCodeEditor
                value={activeTab.body}
                onChange={onBodyChange}
                theme={theme}
                height="220px"
                jsonMode={bodyJsonMode}
              />
            </label>
          </details>

          <details className="section-card">
            <summary>Auth</summary>
            <label className="field">
              <span>Bearer Token</span>
              <input
                value={activeAuthToken}
                onChange={(event) => onAuthTokenChange(event.currentTarget.value)}
                placeholder="Paste token without 'Bearer'"
                spellCheck={false}
              />
            </label>
          </details>

          <details className="section-card">
            <summary>Headers</summary>
            <div className="headers-toolbar">
              <span>Request headers</span>
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
                    placeholder="Header key"
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
          </details>

          {activeTab.error ? <p className="hint error-text">{activeTab.error}</p> : null}
        </form>
      ) : null}
    </section>
  );
});
