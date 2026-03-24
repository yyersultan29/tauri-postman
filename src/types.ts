export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
export type Theme = "light" | "dark";
export type BadgeTone = "success" | "warning" | "danger";
export type NoticeTone = "success" | "error" | "info";

export type HttpRequestPayload = {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: string;
};

export type HttpResponsePayload = {
  status: number;
  durationMs: number;
  headers: Record<string, string>;
  body: string;
};

export type HeaderEntry = {
  id: string;
  key: string;
  value: string;
};

export type RequestTab = {
  id: string;
  title: string;
  method: HttpMethod;
  url: string;
  headers: HeaderEntry[];
  body: string;
  response: HttpResponsePayload | null;
  error: string;
  isSending: boolean;
};

export type PersistedHeaderEntry = {
  id?: unknown;
  key?: unknown;
  value?: unknown;
};

export type PersistedTab = {
  id?: unknown;
  title?: unknown;
  method?: unknown;
  url?: unknown;
  headers?: PersistedHeaderEntry[];
  headersText?: unknown;
  body?: unknown;
};

export type TabSeed = Partial<Pick<RequestTab, "title" | "method" | "url" | "headers" | "body">>;

export type NoticeState = {
  tone: NoticeTone;
  text: string;
};

export const methods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
