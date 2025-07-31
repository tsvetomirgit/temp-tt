import { Component } from '@angular/core';
import { NgxMonacoEditorConfig } from 'ngx-monaco-editor';

// Declare monaco only if types are not already available
declare const monaco: any;

@Component({
  selector: 'app-json-editor',
  template: `
    <ngx-monaco-editor
      [options]="editorOptions"
      [(ngModel)]="code"
      (onInit)="onEditorInit($event)">
    </ngx-monaco-editor>
  `,
  styles: [`
    ::ng-deep .readonly-property {
      background-color: #f5f5f5 !important;
      pointer-events: none;
    }
  `]
})
export class JsonEditorComponent {
  code = `{
  "readonlyProp": 123,
  "editableProp": "abc"
}`;

  editorOptions = {
    language: 'json',
    theme: 'vs-light',
    automaticLayout: true
  };

  readonlyProperties = ['readonlyProp'];
  private decorations: string[] = [];
  private lastValue: string = this.code;

  // This is the Monaco editor instance
  private editor: any;

  onEditorInit(editorInstance: any) {
    this.editor = editorInstance;
    const model = this.editor.getModel();

    // Get the ranges for readonly properties
    const ranges = this.getReadonlyPropertyRanges(model.getValue(), this.readonlyProperties);

    // Add decorations
    this.decorations = this.editor.deltaDecorations([], ranges.map(rng => ({
      range: new monaco.Range(rng.startLine, rng.startColumn, rng.endLine, rng.endColumn),
      options: {
        inlineClassName: 'readonly-property'
      }
    })));

    // Add markers (optional, shows warning)
    monaco.editor.setModelMarkers(model, 'readonly', ranges.map(rng => ({
      startLineNumber: rng.startLine,
      startColumn: rng.startColumn,
      endLineNumber: rng.endLine,
      endColumn: rng.endColumn,
      message: 'This property is read-only',
      severity: monaco.MarkerSeverity.Warning
    })));

    // Intercept content changes to revert edits to readonly properties
    this.editor.onDidChangeModelContent((event: any) => {
      const edits = event.changes;
      let revert = false;
      for (const edit of edits) {
        if (this.isInReadonlyRange(edit.range, ranges)) {
          revert = true;
        }
      }
      if (revert) {
        // Revert the model to previous value
        setTimeout(() => {
          model.setValue(this.lastValue);
        }, 1);
      } else {
        // Update lastValue for normal edits
        this.lastValue = model.getValue();
      }
    });

    // Optionally, prevent typing in the readonly area
    this.editor.onKeyDown((e: any) => {
      const position = this.editor.getPosition();
      if (this.isInReadonlyRange(position, ranges)) {
        e.preventDefault();
        // Optionally, show a message to user
      }
    });
  }

  // Helper to determine if a position or range is inside any readonly property range
  isInReadonlyRange(posOrRange: any, readonlyRanges: any[]): boolean {
    if (posOrRange.startLineNumber !== undefined) {
      // It's a range object from Monaco
      for (const rng of readonlyRanges) {
        if (
          posOrRange.startLineNumber <= rng.endLine &&
          posOrRange.endLineNumber >= rng.startLine &&
          posOrRange.startColumn <= rng.endColumn &&
          posOrRange.endColumn >= rng.startColumn
        ) {
          return true;
        }
      }
    } else if (posOrRange.lineNumber !== undefined) {
      // It's a position object from Monaco
      for (const rng of readonlyRanges) {
        if (
          posOrRange.lineNumber >= rng.startLine &&
          posOrRange.lineNumber <= rng.endLine &&
          posOrRange.column >= rng.startColumn &&
          posOrRange.column <= rng.endColumn
        ) {
          return true;
        }
      }
    }
    return false;
  }

  // Parse the JSON and compute the start/end lines/columns for the readonly properties
  getReadonlyPropertyRanges(jsonString: string, readonlyProps: string[]) {
    const ranges: any[] = [];
    try {
      const lines = jsonString.split('\n');
      readonlyProps.forEach(prop => {
        const regex = new RegExp(`"${prop}"\\s*:\\s*[^,\\}]*`, 'g');
        lines.forEach((line, idx) => {
          let match;
          while ((match = regex.exec(line)) !== null) {
            const startLine = idx + 1;
            const startColumn = match.index + 1;
            const endLine = startLine;
            const endColumn = match.index + match[0].length + 1;
            ranges.push({ startLine, startColumn, endLine, endColumn });
          }
        });
      });
    } catch (e) {
      // Ignore parse errors, fallback to no readonly ranges
    }
    return ranges;
  }
}
