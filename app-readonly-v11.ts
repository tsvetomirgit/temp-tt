import { Component } from '@angular/core';
import * as monaco from 'monaco-editor';

// External Range class, identical to monaco.Range
export class Range {
  constructor(
    public startLineNumber: number,
    public startColumn: number,
    public endLineNumber: number,
    public endColumn: number
  ) {}

  // Create a Monaco range using a static method to avoid direct usage of new monaco.Range()
  static toMonacoRange(rng: Range): monaco.IRange {
    return {
      startLineNumber: rng.startLineNumber,
      startColumn: rng.startColumn,
      endLineNumber: rng.endLineNumber,
      endColumn: rng.endColumn
    };
  }

  // Static utility to create from monaco.Range
  static fromMonacoRange(rng: monaco.IRange): Range {
    return new Range(rng.startLineNumber, rng.startColumn, rng.endLineNumber, rng.endColumn);
  }
}

@Component({
  selector: 'app-json-editor',
  template: `
    <ngx-monaco-editor
      [options]="editorOptions"
      [(ngModel)]="code"
      (onInit)="onEditorInit($event)">
    </ngx-monaco-editor>
    <div *ngIf="readonlyMessage" class="readonly-message">{{ readonlyMessage }}</div>
  `,
  styles: [`
    ::ng-deep .readonly-property {
      background-color: #f5f5f5 !important;
      pointer-events: none;
    }
    .readonly-message {
      color: #b71c1c;
      margin: 10px 0 0 0;
      font-weight: bold;
    }
  `]
})
export class JsonEditorComponent {
  code = `{
  "id": "7e2f1b34-9f3a-4d5c-bf3d-7c8a0b6a3b0d",
  "name": "Example",
  "isRegister": true,
  "readonlyProp": 123,
  "editableProp": "abc"
}`;

  editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    language: 'json',
    theme: 'vs-light',
    automaticLayout: true
  };

  readonlyProperties = ['readonlyProp'];
  private decorations: string[] = [];
  private lastValue: string = this.code;
  private editor!: monaco.editor.IStandaloneCodeEditor;
  readonlyMessage: string = '';

  onEditorInit(editorInstance: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editorInstance;
    const model = this.editor.getModel() as monaco.editor.ITextModel;

    // Set full JSON schema for validation and IntelliSense
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: 'http://yourdomain/schema.json',
          fileMatch: ['*'],
          schema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: "Unique identifier (UUID)",
                pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
                example: "7e2f1b34-9f3a-4d5c-bf3d-7c8a0b6a3b0d",
                readOnly: false
              },
              name: {
                type: 'string',
                description: "Name of the entity",
                minLength: 1,
                maxLength: 100,
                readOnly: false
              },
              isRegister: {
                type: 'boolean',
                description: "Registration status",
                enum: [true, false]
              },
              readonlyProp: {
                type: 'number',
                description: "Read-only property",
                minimum: 1,
                maximum: 10,
                readOnly: true
              },
              editableProp: {
                type: 'string',
                description: "Editable property",
                readOnly: false
              }
            },
            required: ['id', 'name', 'isRegister'],
            additionalProperties: false
          }
        }
      ]
    });

    // Get the ranges for readonly properties (only "readonlyProp" here)
    const ranges = this.getReadonlyPropertyRanges(model.getValue(), this.readonlyProperties);

    // Add decorations using Range.toMonacoRange instead of new monaco.Range()
    this.decorations = this.editor.deltaDecorations([], ranges.map(rng =>
      ({
        range: Range.toMonacoRange(rng),
        options: {
          inlineClassName: 'readonly-property'
        }
      })
    ));

    // Add markers (optional, shows warning)
    monaco.editor.setModelMarkers(model, 'readonly', ranges.map(rng => ({
      startLineNumber: rng.startLineNumber,
      startColumn: rng.startColumn,
      endLineNumber: rng.endLineNumber,
      endColumn: rng.endColumn,
      message: 'This property is read-only',
      severity: monaco.MarkerSeverity.Warning
    })));

    // Intercept content changes to revert edits to readonly properties
    this.editor.onDidChangeModelContent((event: monaco.editor.IModelContentChangedEvent) => {
      const edits = event.changes;
      let revert = false;
      for (const edit of edits) {
        if (this.isInReadonlyRange(Range.fromMonacoRange(edit.range), ranges)) {
          revert = true;
        }
      }
      if (revert) {
        setTimeout(() => {
          model.setValue(this.lastValue);
        }, 1);
      } else {
        this.lastValue = model.getValue();
      }
    });

    // Optionally, prevent typing in the readonly area
    this.editor.onKeyDown((e: monaco.IKeyboardEvent) => {
      const position = this.editor.getPosition();
      if (position && this.isInReadonlyRangePosition(position, ranges)) {
        e.preventDefault();
        this.showReadonlyMessage();
      }
    });
  }

  showReadonlyMessage() {
    this.readonlyMessage = "Property is readonly";
    setTimeout(() => {
      this.readonlyMessage = '';
    }, 1500); // Hide message after 1.5 seconds
  }

  // Helper to determine if a range is inside any readonly property range
  isInReadonlyRange(testRange: Range, readonlyRanges: Range[]): boolean {
    for (const rng of readonlyRanges) {
      if (
        testRange.startLineNumber <= rng.endLineNumber &&
        testRange.endLineNumber >= rng.startLineNumber &&
        testRange.startColumn <= rng.endColumn &&
        testRange.endColumn >= rng.startColumn
      ) {
        return true;
      }
    }
    return false;
  }

  // Helper to determine if a position is inside any readonly property range
  isInReadonlyRangePosition(pos: monaco.IPosition, readonlyRanges: Range[]): boolean {
    for (const rng of readonlyRanges) {
      if (
        pos.lineNumber >= rng.startLineNumber &&
        pos.lineNumber <= rng.endLineNumber &&
        pos.column >= rng.startColumn &&
        pos.column <= rng.endColumn
      ) {
        return true;
      }
    }
    return false;
  }

  // Parse the JSON and compute the start/end lines/columns for the readonly properties
  getReadonlyPropertyRanges(jsonString: string, readonlyProps: string[]): Range[] {
    const ranges: Range[] = [];
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
            ranges.push(new Range(startLine, startColumn, endLine, endColumn));
          }
        });
      });
    } catch (e) {
      // Ignore parse errors, fallback to no readonly ranges
    }
    return ranges;
  }
}
