import { ChangeEvent, Suspense, lazy, memo } from "react";
import { Theme } from "../types";

type LazyJsonCodeEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  theme: Theme;
  height: string;
  jsonMode: boolean;
  readOnly?: boolean;
};

const JsonCodeEditor = lazy(async () => {
  const module = await import("./JsonCodeEditor");
  return { default: module.JsonCodeEditor };
});

function EditorFallback({ value, onChange, height, readOnly = false }: LazyJsonCodeEditorProps) {
  const onFallbackChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    if (!onChange || readOnly) {
      return;
    }
    onChange(event.currentTarget.value);
  };

  return (
    <div className="code-editor">
      <textarea
        value={value}
        rows={6}
        readOnly={readOnly}
        spellCheck={false}
        onChange={onFallbackChange}
        style={{ height, resize: "vertical" }}
      />
    </div>
  );
}

export const LazyJsonCodeEditor = memo(function LazyJsonCodeEditor(props: LazyJsonCodeEditorProps) {
  return (
    <Suspense fallback={<EditorFallback {...props} />}>
      <JsonCodeEditor {...props} />
    </Suspense>
  );
});
