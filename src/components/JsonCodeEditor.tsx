import { memo, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { Theme } from "../types";

type JsonCodeEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  theme: Theme;
  height: string;
  jsonMode: boolean;
  readOnly?: boolean;
};

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

export const JsonCodeEditor = memo(function JsonCodeEditor({
  value,
  onChange,
  theme,
  height,
  jsonMode,
  readOnly = false,
}: JsonCodeEditorProps) {
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
});
