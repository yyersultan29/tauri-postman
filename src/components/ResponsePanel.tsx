import { memo } from "react";
import { JsonCodeEditor } from "./JsonCodeEditor";
import { Theme, HttpResponsePayload } from "../types";
import { getDurationTone, getStatusTone } from "../lib/tab-utils";

type ResponsePanelProps = {
  response: HttpResponsePayload | null;
  responseHeaders: string;
  responseJsonMode: boolean;
  theme: Theme;
  onCopyBody: () => void;
  onCopyHeaders: () => void;
};

export const ResponsePanel = memo(function ResponsePanel({
  response,
  responseHeaders,
  responseJsonMode,
  theme,
  onCopyBody,
  onCopyHeaders,
}: ResponsePanelProps) {
  return (
    <section className="panel response-panel">
      <div className="response-top">
        <h2>Response</h2>
        {response ? (
          <div className="response-meta-tools">
            <div className="meta-row">
              <span className={`badge badge-${getStatusTone(response.status)}`}>Status: {response.status}</span>
              <span className={`badge badge-${getDurationTone(response.durationMs)}`}>Time: {response.durationMs} ms</span>
            </div>
            <div className="response-tools">
              <button className="tiny-button" type="button" onClick={onCopyBody}>
                Copy Body
              </button>
              <button className="tiny-button" type="button" onClick={onCopyHeaders}>
                Copy Headers
              </button>
            </div>
          </div>
        ) : (
          <p className="muted-text">No response yet</p>
        )}
      </div>

      <label className="field">
        <span>Headers</span>
        <textarea value={responseHeaders} readOnly rows={8} placeholder="Response headers will appear here" />
      </label>

      <label className="field">
        <span>Body</span>
        <JsonCodeEditor value={response?.body ?? ""} theme={theme} height="360px" jsonMode={responseJsonMode} readOnly />
      </label>
    </section>
  );
});
