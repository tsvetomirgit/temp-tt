import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { editor, IRange, Range } from 'monaco-editor';
import { EditorComponent } from 'ngx-monaco-editor-v2';

@Component({
  selector: 'app-readonly-editor',
  imports: [EditorComponent, FormsModule], // This component is standalone
  template: `
    <ngx-monaco-editor
      [options]="editorOptions"
      [ngModel]="jsonCode"
      (onInit)="onEditorInit($event)">
    </ngx-monaco-editor>
  `,
  standalone: true // Mark component as standalone
})
export class ReadonlyEditorComponent {
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
  private readonlyRanges: Range[] = [];

  onEditorInit(editor: editor.IStandaloneCodeEditor) {
    const model = editor.getModel();
    if (!model) return;

    this.applyReadOnlyDecorations(model, this.readOnlyKeys);

    model.onDidChangeContent((e) => {
      for (const change of e.changes) {
        if (this.isChangeInReadOnlyRange(change.range)) {
          // Revert the change if it's in a read-only area
          setTimeout(() => {
            editor.trigger('readonly-protection', 'undo', null);
          });
        }
      }
    });
  }

  private applyReadOnlyDecorations(model: editor.ITextModel, keys: string[]) {
    const code = model.getValue();
    let decorations: editor.IModelDeltaDecoration[] = [];
    this.readonlyRanges = [];

    keys.forEach(key => {
      const regex = new RegExp(`"${key}"\\s*:`, 'g');
      let match;
      while ((match = regex.exec(code)) !== null) {
        const start = model.getPositionAt(match.index);
        const end = model.getPositionAt(match.index + match[0].length);

        const range = new Range(start.lineNumber, start.column, end.lineNumber, end.column);

        decorations.push({
          range,
          options: {
            // Using a custom class for styling read-only parts
            inlineClassName: 'readonly-property',
            // Tooltip to inform user
            hoverMessage: { value: 'This property is read-only' }
          }
        });
        this.readonlyRanges.push(range);
      }
    });

    model.deltaDecorations([], decorations);
  }

  private isChangeInReadOnlyRange(changeRange: IRange): boolean {
    return this.readonlyRanges.some(readOnlyRange => Range.areIntersectingOrTouching(readOnlyRange, changeRange));
  }
}
