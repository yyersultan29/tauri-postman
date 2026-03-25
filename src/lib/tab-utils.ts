import { ACTIVE_TAB_STORAGE_KEY, TABS_STORAGE_KEY } from "../constants";
import {
  BadgeTone,
  HeaderEntry,
  HttpMethod,
  PersistedTab,
  RequestTab,
  TabSeed,
  methods,
} from "../types";

const AUTO_FORMAT_RESPONSE_LIMIT_BYTES = 256 * 1024;

export function shellQuote(value: string): string {
  const escaped = value.replace(/'/g, `'"'"'`);
  return `'${escaped}'`;
}

export function buildCurlCommand(tab: Pick<RequestTab, "method" | "url" | "headers" | "body">): string {
  const parts: string[] = [`curl -X ${tab.method}`, shellQuote(tab.url.trim())];

  tab.headers.forEach((header) => {
    const key = header.key.trim();
    if (!key) {
      return;
    }
    parts.push(`-H ${shellQuote(`${key}: ${header.value}`)}`);
  });

  if (tab.body.trim()) {
    parts.push(`--data-raw ${shellQuote(tab.body)}`);
  }

  return parts.join(" ");
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createHeaderEntry(key = "", value = ""): HeaderEntry {
  return {
    id: generateId(),
    key,
    value,
  };
}

export function normalizeHeaders(headers?: HeaderEntry[]): HeaderEntry[] {
  if (!headers || headers.length === 0) {
    return [createHeaderEntry("Accept", "application/json")];
  }

  return headers.map((header) => createHeaderEntry(header.key, header.value));
}

export function isHttpMethod(value: unknown): value is HttpMethod {
  return typeof value === "string" && methods.includes(value as HttpMethod);
}

export function parseLegacyHeaders(headersText: string): HeaderEntry[] {
  if (!headersText.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(headersText);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      return [];
    }

    return Object.entries(parsed as Record<string, unknown>).map(([key, value]) =>
      createHeaderEntry(String(key), String(value))
    );
  } catch {
    return [];
  }
}

export function formatBody(body: string): string {
  if (!body.trim()) {
    return "";
  }

  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

export function canUseJsonMode(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  // Keep JSON syntax mode active while user is still typing incomplete JSON.
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

export function getStatusTone(status: number): BadgeTone {
  if (status >= 200 && status < 300) {
    return "success";
  }
  if (status >= 400) {
    return "danger";
  }
  return "warning";
}

export function getStatusLabel(status: number): string {
  if (status >= 200 && status < 300) {
    return "Success";
  }

  if (status >= 300 && status < 400) {
    return "Redirect";
  }

  if (status >= 400 && status < 500) {
    return "Client error";
  }

  if (status >= 500) {
    return "Server error";
  }

  return "Informational";
}

export function formatDuration(durationMs: number): string {
  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  if (durationMs < 10_000) {
    return `${(durationMs / 1000).toFixed(2)} s`;
  }

  return `${(durationMs / 1000).toFixed(1)} s`;
}

export function getBodySizeBytes(body: string): number {
  return new TextEncoder().encode(body).length;
}

export function shouldAutoFormatResponseBody(body: string, headers: Record<string, string>): boolean {
  if (!body.trim()) {
    return false;
  }

  if (getBodySizeBytes(body) > AUTO_FORMAT_RESPONSE_LIMIT_BYTES) {
    return false;
  }

  const contentType = Object.entries(headers).find(([key]) => key.toLowerCase() === "content-type")?.[1] ?? "";
  const normalizedContentType = contentType.toLowerCase();
  return normalizedContentType.includes("application/json") || normalizedContentType.includes("+json");
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1_048_576) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1_048_576).toFixed(2)} MB`;
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function extractUrlHost(value: string): string {
  try {
    return new URL(value).host;
  } catch {
    return "";
  }
}

export function getDurationTone(durationMs: number): BadgeTone {
  if (durationMs < 500) {
    return "success";
  }
  if (durationMs >= 60_000) {
    return "danger";
  }
  return "warning";
}

export function createTab(index: number, seed?: TabSeed): RequestTab {
  return {
    id: generateId(),
    title: seed?.title?.trim() || `Request ${index}`,
    method: seed?.method ?? "GET",
    url: seed?.url ?? "https://httpbin.org/get",
    headers: normalizeHeaders(seed?.headers),
    body: seed?.body ?? "",
    response: null,
    error: "",
    isSending: false,
  };
}

export function loadInitialTabs(): RequestTab[] {
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
        const source = item as PersistedTab;
        let headers: HeaderEntry[] = [];

        if (Array.isArray(source.headers)) {
          headers = source.headers.map((header) => ({
            id: typeof header.id === "string" && header.id ? header.id : generateId(),
            key: typeof header.key === "string" ? header.key : "",
            value: typeof header.value === "string" ? header.value : "",
          }));
        }

        if (headers.length === 0 && typeof source.headersText === "string") {
          headers = parseLegacyHeaders(source.headersText);
        }

        return {
          id: typeof source.id === "string" && source.id ? source.id : generateId(),
          title: typeof source.title === "string" && source.title.trim() ? source.title.trim() : `Request ${index + 1}`,
          method: isHttpMethod(source.method) ? source.method : "GET",
          url: typeof source.url === "string" ? source.url : "",
          headers: normalizeHeaders(headers),
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

export function getInitialActiveTabId(tabs: RequestTab[]): string {
  const storedActiveTab = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
  if (storedActiveTab && tabs.some((tab) => tab.id === storedActiveTab)) {
    return storedActiveTab;
  }
  return tabs[0].id;
}

export function serializeTabs(tabs: RequestTab[]): string {
  const serializableTabs = tabs.map(({ id, title, method, url, headers, body }) => ({
    id,
    title,
    method,
    url,
    headers,
    body,
  }));

  return JSON.stringify(serializableTabs);
}
