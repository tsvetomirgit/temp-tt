import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { editor, IPosition, IRange } from 'monaco-editor';

@Component({
  selector: 'app-json-editor',
  standalone: true,
  imports: [EditorComponent, FormsModule],
  template: `
    <ngx-monaco-editor
      #editor
      [options]="editorOptions"
      [(ngModel)]="jsonCode"
      (onInit)="onEditorInit($event)">
    </ngx-monaco-editor>
  `,
  styles: [`
    .read-only {
      background-color: rgba(255, 0, 0, 0.15) !important;
    }
  `]
})
export class JsonEditorComponent {
  @ViewChild('editor', { static: false }) editorComponent!: EditorComponent;

  editorOptions = { theme: 'vs-dark', language: 'json' };

  jsonCode = `{
    "id": 123,
    "name": "John",
    "role": "admin",
    "address": {
      "id": 456,
      "city": "Sofia",
      "role": "secondary"
    },
    "tags": ["angular", "monaco", "editor"],
    "users": [
      { "id": 1, "name": "Alice", "role": "guest" },
      { "id": 2, "name": "Bob", "role": "editor" }
    ]
  }`;

  readOnlyKeys = ['id', 'role', 'tags'];

  private readOnlyDecorations!: editor.IEditorDecorationsCollection;
  private lastLineCount = 0;

  onEditorInit(editor: editor.IStandaloneCodeEditor) {
    const model = editor.getModel();
    if (!model) return;

    // create an empty decorations collection
    this.readOnlyDecorations = editor.createDecorationsCollection();

    // initial scan
    this.applyReadOnlyDecorations(model, this.readOnlyKeys);

    // remember the number of lines
    this.lastLineCount = model.getLineCount();

    // listen for changes
    model.onDidChangeContent((e: editor.IModelContentChangedEvent) => {
      for (const change of e.changes) {
        const start = model.getPositionAt(change.range.startLineNumber);
        const end = model.getPositionAt(change.range.endLineNumber);

        if (this.isInReadOnlyRange(start, end)) {
          setTimeout(() => {
            editor.trigger('readonly-protection', 'undo', null);
          });
        }
      }

      // check only if the number of lines has changed
      const currentLineCount = model.getLineCount();
      if (currentLineCount !== this.lastLineCount) {
        this.applyReadOnlyDecorations(model, this.readOnlyKeys);
        this.lastLineCount = currentLineCount;
      }
    });
  }

  private applyReadOnlyDecorations(model: editor.ITextModel, keys: string[]) {
    let decorations: editor.IModelDeltaDecoration[] = [];

    // regex for all keys at once
    const pattern = `"(${keys.join('|')})"\\s*:\\s*[^,}\\n]+`;

    const matches = model.findMatches(
      pattern,
      true,   // entire model
      true,   // regex
      false,  // caseSensitive
      null,   // searchScope
      true    // captureMatches
    );

    matches.forEach(match => {
      decorations.push({
        range: match.range,
        options: { inlineClassName: 'read-only' }
      });
    });

    this.readOnlyDecorations.set(decorations);
  }

  private isInReadOnlyRange(start: IPosition, end: IPosition): boolean {
    if (!this.readOnlyDecorations) return false;

    for (const d of this.readOnlyDecorations.getRanges()) {
      if (d.containsPosition(start) || d.containsPosition(end)) {
        return true;
      }
    }
    return false;
  }
}
