import { FormEvent, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import "./App.css";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

type HttpRequestPayload = {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: string;
};

type HttpResponsePayload = {
  status: number;
  durationMs: number;
  headers: Record<string, string>;
  body: string;
};

type Theme = "light" | "dark";

type RequestTab = {
  id: string;
  title: string;
  method: HttpMethod;
  url: string;
  headersText: string;
  body: string;
  response: HttpResponsePayload | null;
  error: string;
  isSending: boolean;
};

type PersistedTab = Pick<RequestTab, "id" | "title" | "method" | "url" | "headersText" | "body">;

const methods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const THEME_STORAGE_KEY = "postman-lite-theme";
const TABS_STORAGE_KEY = "postman-lite-tabs";
const ACTIVE_TAB_STORAGE_KEY = "postman-lite-active-tab";
const DEFAULT_HEADERS_TEXT = '{\n  "Accept": "application/json"\n}';

const jsonHighlightLight = HighlightStyle.define([
  { tag: tags.propertyName, color: "#1c6ca8" },
  { tag: tags.string, color: "#0d7b4d" },
  { tag: tags.number, color: "#9d4f00" },
  { tag: [tags.bool, tags.null], color: "#a33775", fontWeight: "600" },
  { tag: [tags.squareBracket, tags.brace], color: "#28465f" },
  { tag: tags.punctuation, color: "#5c7388" },
]);

const jsonHighlightDark = HighlightStyle.define([
  { tag: tags.propertyName, color: "#7ac7ff" },
  { tag: tags.string, color: "#87e9b3" },
  { tag: tags.number, color: "#ffc47a" },
  { tag: [tags.bool, tags.null], color: "#ff9cc8", fontWeight: "600" },
  { tag: [tags.squareBracket, tags.brace], color: "#b0cae2" },
  { tag: tags.punctuation, color: "#8ea8c0" },
]);

function generateTabId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isHttpMethod(value: unknown): value is HttpMethod {
  return typeof value === "string" && methods.includes(value as HttpMethod);
}

function getInitialTheme(): Theme {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

function parseHeaders(headersText: string): Record<string, string> | null {
  if (!headersText.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(headersText);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      return null;
    }

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).map(([key, value]) => [key, String(value)])
    );
  } catch {
    return null;
  }
}

function formatBody(body: string): string {
  if (!body.trim()) {
    return "";
  }

  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

function canUseJsonMode(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) {
    return false;
  }

  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
}

type JsonCodeEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  theme: Theme;
  height: string;
  jsonMode: boolean;
  readOnly?: boolean;
};

function JsonCodeEditor({ value, onChange, theme, height, jsonMode, readOnly = false }: JsonCodeEditorProps) {
  const extensions = useMemo(() => {
    if (!jsonMode) {
      return [];
    }

    const highlightTheme = theme === "dark" ? jsonHighlightDark : jsonHighlightLight;
    return [json(), syntaxHighlighting(highlightTheme)];
  }, [jsonMode, theme]);

  return (
    <div className="code-editor">
      <CodeMirror
        value={value}
        height={height}
        theme={theme === "dark" ? oneDark : "light"}
        extensions={extensions}
        editable={!readOnly}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: !readOnly,
          highlightActiveLineGutter: !readOnly,
        }}
      />
    </div>
  );
}

function createTab(index: number, seed?: Partial<Pick<RequestTab, "title" | "method" | "url" | "headersText" | "body">>): RequestTab {
  return {
    id: generateTabId(),
    title: seed?.title?.trim() || `Request ${index}`,
    method: seed?.method ?? "GET",
    url: seed?.url ?? "https://httpbin.org/get",
    headersText: seed?.headersText ?? DEFAULT_HEADERS_TEXT,
    body: seed?.body ?? "",
    response: null,
    error: "",
    isSending: false,
  };
}

function loadInitialTabs(): RequestTab[] {
  const fallback = [createTab(1)];
  const raw = localStorage.getItem(TABS_STORAGE_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return fallback;
    }

    const sanitizedTabs = parsed
      .map((item, index) => {
        const source = item as Partial<PersistedTab>;
        return {
          id: typeof source.id === "string" && source.id ? source.id : generateTabId(),
          title: typeof source.title === "string" && source.title.trim() ? source.title.trim() : `Request ${index + 1}`,
          method: isHttpMethod(source.method) ? source.method : "GET",
          url: typeof source.url === "string" ? source.url : "",
          headersText: typeof source.headersText === "string" ? source.headersText : DEFAULT_HEADERS_TEXT,
          body: typeof source.body === "string" ? source.body : "",
          response: null,
          error: "",
          isSending: false,
        } satisfies RequestTab;
      })
      .filter((tab) => tab.id.trim().length > 0);

    return sanitizedTabs.length > 0 ? sanitizedTabs : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const initialTabs = useMemo(loadInitialTabs, []);
  const [tabs, setTabs] = useState<RequestTab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const storedActiveTab = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    if (storedActiveTab && initialTabs.some((tab) => tab.id === storedActiveTab)) {
      return storedActiveTab;
    }
    return initialTabs[0].id;
  });

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  const parsedHeaders = useMemo(() => {
    if (!activeTab) {
      return {};
    }
    return parseHeaders(activeTab.headersText);
  }, [activeTab]);

  const headersError =
    activeTab && activeTab.headersText.trim().length > 0 && parsedHeaders === null
      ? "Headers must be valid JSON object."
      : "";

  const responseHeaders = useMemo(() => {
    if (!activeTab?.response) {
      return "";
    }
    return Object.entries(activeTab.response.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  }, [activeTab]);

  const bodyJsonMode = useMemo(() => {
    return canUseJsonMode(activeTab?.body ?? "");
  }, [activeTab?.body]);

  const responseJsonMode = useMemo(() => {
    return canUseJsonMode(activeTab?.response?.body ?? "");
  }, [activeTab?.response?.body]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const serializableTabs: PersistedTab[] = tabs.map(({ id, title, method, url, headersText, body }) => ({
      id,
      title,
      method,
      url,
      headersText,
      body,
    }));
    localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(serializableTabs));
  }, [tabs]);

  useEffect(() => {
    if (tabs.some((tab) => tab.id === activeTabId)) {
      localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTabId);
      return;
    }

    if (tabs.length > 0) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  function updateTab(tabId: string, updater: (tab: RequestTab) => RequestTab): void {
    setTabs((currentTabs) => currentTabs.map((tab) => (tab.id === tabId ? updater(tab) : tab)));
  }

  function updateActiveTab(
    patch: Partial<Pick<RequestTab, "title" | "method" | "url" | "headersText" | "body">>
  ): void {
    if (!activeTab) {
      return;
    }

    updateTab(activeTab.id, (tab) => ({
      ...tab,
      ...patch,
      error: "",
    }));
  }

  function addTab(seed?: Partial<Pick<RequestTab, "title" | "method" | "url" | "headersText" | "body">>): void {
    const nextTab = createTab(tabs.length + 1, seed);
    setTabs((currentTabs) => [...currentTabs, nextTab]);
    setActiveTabId(nextTab.id);
  }

  function duplicateActiveTab(): void {
    if (!activeTab) {
      return;
    }

    addTab({
      title: `${activeTab.title} Copy`,
      method: activeTab.method,
      url: activeTab.url,
      headersText: activeTab.headersText,
      body: activeTab.body,
    });
  }

  function closeTab(tabId: string): void {
    setTabs((currentTabs) => {
      if (currentTabs.length <= 1) {
        return currentTabs;
      }
      return currentTabs.filter((tab) => tab.id !== tabId);
    });
  }

  async function sendRequest(tabId: string): Promise<void> {
    const tab = tabs.find((item) => item.id === tabId);
    if (!tab) {
      return;
    }

    if (!tab.url.trim()) {
      updateTab(tabId, (currentTab) => ({
        ...currentTab,
        error: "URL is required.",
      }));
      return;
    }

    const parsed = parseHeaders(tab.headersText);
    if (parsed === null) {
      updateTab(tabId, (currentTab) => ({
        ...currentTab,
        error: "Fix headers JSON and try again.",
      }));
      return;
    }

    const payload: HttpRequestPayload = {
      method: tab.method,
      url: tab.url.trim(),
    };

    if (Object.keys(parsed).length > 0) {
      payload.headers = parsed;
    }

    if (tab.body.trim().length > 0) {
      payload.body = tab.body;
    }

    updateTab(tabId, (currentTab) => ({
      ...currentTab,
      error: "",
      isSending: true,
    }));

    try {
      const result = await invoke<HttpResponsePayload>("send_http", { req: payload });
      updateTab(tabId, (currentTab) => ({
        ...currentTab,
        response: { ...result, body: formatBody(result.body) },
        error: "",
        isSending: false,
      }));
    } catch (invokeError) {
      const message = invokeError instanceof Error ? invokeError.message : String(invokeError);
      updateTab(tabId, (currentTab) => ({
        ...currentTab,
        error: message,
        isSending: false,
      }));
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!activeTab) {
      return;
    }
    void sendRequest(activeTab.id);
  }

  return (
    <main className="app-shell">
      <header className="panel workspace-header">
        <div className="workspace-title">
          <h1>Postman Lite</h1>
          <p>Tabs + parallel requests. Send one request and keep testing in other tabs.</p>
        </div>

        <div className="workspace-actions">
          <button className="secondary-button" type="button" onClick={() => addTab()}>
            + New Tab
          </button>
          <button className="secondary-button" type="button" onClick={duplicateActiveTab} disabled={!activeTab}>
            Duplicate
          </button>
          <button
            className="theme-button"
            type="button"
            onClick={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </header>

      <section className="panel tab-strip">
        {tabs.map((tab) => (
          <div className={`tab-item ${tab.id === activeTab?.id ? "active" : ""}`} key={tab.id}>
            <button className="tab-main" type="button" onClick={() => setActiveTabId(tab.id)}>
              <span className={`method-pill method-${tab.method.toLowerCase()}`}>{tab.method}</span>
              <span className="tab-name">{tab.title}</span>
              {tab.isSending ? <span className="tab-sending">Sending...</span> : null}
            </button>
            <button
              className="tab-close"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                closeTab(tab.id);
              }}
              disabled={tabs.length === 1}
              aria-label={`Close ${tab.title}`}
            >
              ×
            </button>
          </div>
        ))}
      </section>

      <div className="workspace-grid">
        <section className="panel request-panel">
          {activeTab ? (
            <form className="request-form" onSubmit={onSubmit}>
              <label className="field">
                <span>Tab Title</span>
                <input
                  value={activeTab.title}
                  onChange={(event) => updateActiveTab({ title: event.currentTarget.value })}
                  placeholder="User API"
                  spellCheck={false}
                />
              </label>

              <div className="method-url-row">
                <label className="field method-field">
                  <span>Method</span>
                  <select
                    value={activeTab.method}
                    onChange={(event) => updateActiveTab({ method: event.currentTarget.value as HttpMethod })}
                  >
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
                    onChange={(event) => updateActiveTab({ url: event.currentTarget.value })}
                    placeholder="https://api.example.com/users"
                    spellCheck={false}
                  />
                </label>

                <button className="send-button" type="submit" disabled={activeTab.isSending}>
                  {activeTab.isSending ? "Sending..." : "Send"}
                </button>
              </div>

              <label className="field">
                <span>Headers (JSON)</span>
                <JsonCodeEditor
                  value={activeTab.headersText}
                  onChange={(value) => updateActiveTab({ headersText: value })}
                  theme={theme}
                  height="220px"
                  jsonMode={true}
                />
              </label>
              {headersError ? <p className="hint error-text">{headersError}</p> : null}

              <label className="field">
                <span>Body (optional)</span>
                <JsonCodeEditor
                  value={activeTab.body}
                  onChange={(value) => updateActiveTab({ body: value })}
                  theme={theme}
                  height="220px"
                  jsonMode={bodyJsonMode}
                />
              </label>

              {activeTab.error ? <p className="hint error-text">{activeTab.error}</p> : null}
            </form>
          ) : null}
        </section>

        <section className="panel response-panel">
          <div className="response-top">
            <h2>Response</h2>
            {activeTab?.response ? (
              <div className="meta-row">
                <span className="badge">Status: {activeTab.response.status}</span>
                <span className="badge">Time: {activeTab.response.durationMs} ms</span>
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
            <JsonCodeEditor
              value={activeTab?.response?.body ?? ""}
              theme={theme}
              height="360px"
              jsonMode={responseJsonMode}
              readOnly
            />
          </label>
        </section>
      </div>
    </main>
  );
}

export default App;
