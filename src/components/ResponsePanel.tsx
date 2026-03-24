import { memo } from "react";
import { JsonCodeEditor } from "./JsonCodeEditor";
import { Theme, HttpResponsePayload } from "../types";
import { formatBytes, formatDuration, getBodySizeBytes, getDurationTone, getStatusTone } from "../lib/tab-utils";

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
  const bodySize = response ? formatBytes(getBodySizeBytes(response.body)) : "0 B";

  return (
    <section className="panel response-panel">
      <div className="response-top">
        <h2>Response</h2>
        {response ? (
          <div className="response-tools">
            <button className="tiny-button" type="button" onClick={onCopyBody}>
              Copy Body
            </button>
            <button className="tiny-button" type="button" onClick={onCopyHeaders}>
              Copy Headers
            </button>
          </div>
        ) : null}
      </div>

      {response ? (
        <div className="response-meta-row">
          <span className={`badge badge-${getStatusTone(response.status)}`}>Status {response.status}</span>
          <span className={`badge badge-${getDurationTone(response.durationMs)}`}>Time {formatDuration(response.durationMs)}</span>
          <span className="badge">Size {bodySize}</span>
        </div>
      ) : (
        <p className="muted-text">Send a request to see response data.</p>
      )}

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
