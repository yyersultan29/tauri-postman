import { RequestPanel } from "./components/RequestPanel";
import { ResponsePanel } from "./components/ResponsePanel";
import { TabStrip } from "./components/TabStrip";
import { WorkspaceHeader } from "./components/WorkspaceHeader";
import { usePostmanLite } from "./hooks/usePostmanLite";
import "./App.css";

function App() {
  const vm = usePostmanLite();

  return (
    <main className="app-shell">
      <WorkspaceHeader
        theme={vm.theme}
        hasActiveTab={Boolean(vm.activeTab)}
        onAddTab={vm.onAddTab}
        onDuplicateTab={vm.duplicateActiveTab}
        onToggleTheme={vm.onToggleTheme}
      />

      <TabStrip tabs={vm.tabs} activeTabId={vm.activeTabId} onSelect={vm.setActiveTabId} onClose={vm.closeTab} />

      <div className="workspace-grid">
        <RequestPanel
          activeTab={vm.activeTab}
          bodyJsonMode={vm.bodyJsonMode}
          notice={vm.notice}
          theme={vm.theme}
          onSubmit={vm.onSubmit}
          onTitleChange={vm.onTitleChange}
          onMethodChange={vm.onMethodChange}
          onUrlChange={vm.onUrlChange}
          onCopyCurl={vm.onCopyCurl}
          onFormatBody={vm.onFormatBody}
          onClearBody={vm.onClearBody}
          onAddHeader={vm.onAddHeader}
          onHeaderChange={vm.onHeaderChange}
          onRemoveHeader={vm.onRemoveHeader}
          onBodyChange={vm.onBodyChange}
        />

        <ResponsePanel
          response={vm.activeResponse}
          responseHeaders={vm.responseHeaders}
          responseJsonMode={vm.responseJsonMode}
          theme={vm.theme}
          onCopyBody={vm.onCopyResponseBody}
          onCopyHeaders={vm.onCopyResponseHeaders}
        />
      </div>
    </main>
  );
}

export default App;
