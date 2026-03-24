import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ACTIVE_TAB_STORAGE_KEY, THEME_STORAGE_KEY, TABS_STORAGE_KEY } from "../constants";
import {
  buildCurlCommand,
  canUseJsonMode,
  createHeaderEntry,
  createTab,
  formatBody,
  getInitialActiveTabId,
  loadInitialTabs,
  serializeTabs,
} from "../lib/tab-utils";
import { HttpMethod, HttpRequestPayload, HttpResponsePayload, NoticeState, NoticeTone, RequestTab, TabSeed, Theme } from "../types";

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

export function usePostmanLite() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [notice, setNotice] = useState<NoticeState | null>(null);

  const initialTabs = useMemo(loadInitialTabs, []);
  const [tabs, setTabs] = useState<RequestTab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>(() => getInitialActiveTabId(initialTabs));

  const tabsRef = useRef(tabs);
  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  const activeTab = useMemo(() => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0] ?? null, [tabs, activeTabId]);
  const activeResponse = activeTab?.response ?? null;

  const bodyJsonMode = useMemo(() => canUseJsonMode(activeTab?.body ?? ""), [activeTab?.body]);
  const responseJsonMode = useMemo(() => canUseJsonMode(activeResponse?.body ?? ""), [activeResponse?.body]);

  const responseHeaders = useMemo(() => {
    if (!activeResponse) {
      return "";
    }

    return Object.entries(activeResponse.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  }, [activeResponse]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setNotice(null);
    }, 2400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notice]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      localStorage.setItem(TABS_STORAGE_KEY, serializeTabs(tabs));
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
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

  const updateTab = useCallback((tabId: string, updater: (tab: RequestTab) => RequestTab): void => {
    setTabs((currentTabs) => currentTabs.map((tab) => (tab.id === tabId ? updater(tab) : tab)));
  }, []);

  const showNotice = useCallback((tone: NoticeTone, text: string): void => {
    setNotice({ tone, text });
  }, []);

  const updateActiveTab = useCallback(
    (patch: Partial<Pick<RequestTab, "title" | "method" | "url" | "headers" | "body">>): void => {
      if (!activeTabId) {
        return;
      }

      updateTab(activeTabId, (tab) => ({
        ...tab,
        ...patch,
        error: "",
      }));
    },
    [activeTabId, updateTab]
  );

  const addTab = useCallback((seed?: TabSeed): void => {
    const nextTab = createTab(tabsRef.current.length + 1, seed);
    setTabs((currentTabs) => [...currentTabs, nextTab]);
    setActiveTabId(nextTab.id);
  }, []);

  const duplicateActiveTab = useCallback((): void => {
    if (!activeTab) {
      return;
    }

    addTab({
      title: `${activeTab.title} Copy`,
      method: activeTab.method,
      url: activeTab.url,
      headers: activeTab.headers,
      body: activeTab.body,
    });
  }, [activeTab, addTab]);

  const closeTab = useCallback((tabId: string): void => {
    setTabs((currentTabs) => {
      if (currentTabs.length <= 1) {
        return currentTabs;
      }
      return currentTabs.filter((tab) => tab.id !== tabId);
    });
  }, []);

  const addHeaderRow = useCallback((): void => {
    if (!activeTabId) {
      return;
    }

    updateTab(activeTabId, (tab) => ({
      ...tab,
      headers: [...tab.headers, createHeaderEntry()],
      error: "",
    }));
  }, [activeTabId, updateTab]);

  const updateHeaderRow = useCallback(
    (headerId: string, field: "key" | "value", value: string): void => {
      if (!activeTabId) {
        return;
      }

      updateTab(activeTabId, (tab) => ({
        ...tab,
        headers: tab.headers.map((header) => (header.id === headerId ? { ...header, [field]: value } : header)),
        error: "",
      }));
    },
    [activeTabId, updateTab]
  );

  const removeHeaderRow = useCallback(
    (headerId: string): void => {
      if (!activeTabId) {
        return;
      }

      updateTab(activeTabId, (tab) => {
        if (tab.headers.length <= 1) {
          return {
            ...tab,
            headers: [createHeaderEntry()],
            error: "",
          };
        }

        return {
          ...tab,
          headers: tab.headers.filter((header) => header.id !== headerId),
          error: "",
        };
      });
    },
    [activeTabId, updateTab]
  );

  const sendRequest = useCallback(
    async (tabId: string): Promise<void> => {
      const tab = tabsRef.current.find((item) => item.id === tabId);
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

      const headers = tab.headers.reduce<Record<string, string>>((accumulator, header) => {
        const key = header.key.trim();
        if (!key) {
          return accumulator;
        }

        accumulator[key] = header.value;
        return accumulator;
      }, {});

      const payload: HttpRequestPayload = {
        method: tab.method,
        url: tab.url.trim(),
      };

      if (Object.keys(headers).length > 0) {
        payload.headers = headers;
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
    },
    [updateTab]
  );

  const copyToClipboard = useCallback(
    async (label: string, value: string): Promise<void> => {
      if (!value.trim()) {
        showNotice("info", `${label} is empty.`);
        return;
      }

      try {
        await navigator.clipboard.writeText(value);
        showNotice("success", `${label} copied.`);
      } catch {
        showNotice("error", `Cannot copy ${label.toLowerCase()}.`);
      }
    },
    [showNotice]
  );

  const formatActiveBody = useCallback((): void => {
    const tab = tabsRef.current.find((item) => item.id === activeTabId);
    if (!tab) {
      return;
    }

    if (!tab.body.trim()) {
      showNotice("info", "Body is empty.");
      return;
    }

    try {
      const formatted = JSON.stringify(JSON.parse(tab.body), null, 2);
      updateTab(tab.id, (currentTab) => ({
        ...currentTab,
        body: formatted,
        error: "",
      }));
      showNotice("success", "Body formatted.");
    } catch {
      showNotice("error", "Body is not valid JSON.");
    }
  }, [activeTabId, showNotice, updateTab]);

  const clearActiveBody = useCallback((): void => {
    if (!activeTabId) {
      return;
    }

    updateActiveTab({ body: "" });
    showNotice("info", "Body cleared.");
  }, [activeTabId, showNotice, updateActiveTab]);

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      if (!activeTabId) {
        return;
      }
      void sendRequest(activeTabId);
    },
    [activeTabId, sendRequest]
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (!(event.ctrlKey || event.metaKey) || event.key !== "Enter") {
        return;
      }

      if (!activeTabId) {
        return;
      }

      event.preventDefault();
      void sendRequest(activeTabId);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeTabId, sendRequest]);

  const onToggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }, []);

  const onCopyCurl = useCallback(() => {
    if (!activeTab) {
      return;
    }
    void copyToClipboard("cURL", buildCurlCommand(activeTab));
  }, [activeTab, copyToClipboard]);

  const onCopyResponseBody = useCallback(() => {
    void copyToClipboard("Response body", activeResponse?.body ?? "");
  }, [copyToClipboard, activeResponse?.body]);

  const onCopyResponseHeaders = useCallback(() => {
    void copyToClipboard("Headers", responseHeaders);
  }, [copyToClipboard, responseHeaders]);

  const onMethodChange = useCallback(
    (method: HttpMethod) => {
      updateActiveTab({ method });
    },
    [updateActiveTab]
  );

  const onAddTab = useCallback(() => {
    addTab();
  }, [addTab]);

  const onTitleChange = useCallback(
    (value: string) => {
      updateActiveTab({ title: value });
    },
    [updateActiveTab]
  );

  const onUrlChange = useCallback(
    (value: string) => {
      updateActiveTab({ url: value });
    },
    [updateActiveTab]
  );

  const onBodyChange = useCallback(
    (value: string) => {
      updateActiveTab({ body: value });
    },
    [updateActiveTab]
  );

  return {
    activeResponse,
    activeTab,
    activeTabId,
    bodyJsonMode,
    closeTab,
    duplicateActiveTab,
    notice,
    onAddHeader: addHeaderRow,
    onAddTab,
    onBodyChange,
    onClearBody: clearActiveBody,
    onCopyCurl,
    onCopyResponseBody,
    onCopyResponseHeaders,
    onFormatBody: formatActiveBody,
    onHeaderChange: updateHeaderRow,
    onMethodChange,
    onRemoveHeader: removeHeaderRow,
    onSubmit,
    onTitleChange,
    onToggleTheme,
    onUrlChange,
    responseHeaders,
    responseJsonMode,
    setActiveTabId,
    tabs,
    theme,
  };
}
