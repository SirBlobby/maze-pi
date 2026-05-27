import { EditorView, basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap } from '@codemirror/view';

function createEditor(parent, initialCode, onRun) {
    const extensions = [
        basicSetup,
        python(),
        oneDark,
        EditorView.theme({
            '&':             { height: '100%' },
            '.cm-scroller':  { overflow: 'auto' },
        }),
    ];

    if (typeof onRun === 'function') {
        extensions.push(
            keymap.of([{ key: 'Ctrl-Enter', run: () => { onRun(); return true; } }])
        );
    }

    return new EditorView({ doc: initialCode, extensions, parent });
}

function getCode(view) {
    return view.state.doc.toString();
}

export { createEditor, getCode };
