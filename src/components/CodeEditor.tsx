import React, { useEffect, useRef } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { vim } from '@replit/codemirror-vim';

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  isDarkMode: boolean;
  editorMode: 'normal' | 'vim';
}

const lightTheme = EditorView.theme(
  {
    '&': {
      color: '#000',
      backgroundColor: '#fff',
    },
    '.cm-content': {
      caretColor: '#000',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#000',
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: '#d0d0d0',
    },
  },
  { dark: false }
);

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  isDarkMode,
  editorMode,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Compartments to dynamically reconfigure theme and keymaps
  const themeCompartment = useRef(new Compartment());
  const keymapCompartment = useRef(new Compartment());

  // Initial EditorView setup
  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      parent: editorRef.current,
      state: EditorState.create({
        doc: code,
        extensions: [
          basicSetup,
          sql(),
          themeCompartment.current.of(isDarkMode ? oneDark : lightTheme),
          keymapCompartment.current.of(
            editorMode === 'vim' ? vim({ status: true }) : []
          ),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChange(update.state.doc.toString());
            }
          }),
          EditorView.theme({
            '&': { height: '100%', width: '100%' },
            '.cm-scroller': {
              overflow: 'auto',
              maxHeight: '100%',
            },
          }),
        ],
      }),
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  // Reconfigure theme on dark mode change
  useEffect(() => {
    const view = viewRef.current;
    if (view) {
      view.dispatch({
        effects: themeCompartment.current.reconfigure(
          isDarkMode ? oneDark : lightTheme
        ),
      });
    }
  }, [isDarkMode]);

  // Reconfigure Vim mode
  useEffect(() => {
    const view = viewRef.current;
    if (view) {
      view.dispatch({
        effects: keymapCompartment.current.reconfigure(
          editorMode === 'vim' ? vim({ status: true }) : []
        ),
      });
    }
  }, [editorMode]);

  // Sync external code updates
  useEffect(() => {
    const view = viewRef.current;
    if (view && code !== view.state.doc.toString()) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: code,
        },
      });
    }
  }, [code]);

  return (
    <div
      ref={editorRef}
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
      }}
    />
  );
};

export default CodeEditor;
