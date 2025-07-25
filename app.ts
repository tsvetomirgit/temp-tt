import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import * as monaco from 'monaco-editor';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule, MonacoEditorModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'monaco-editor';
  editorOptions = { language: 'json' };
  code: string = json;

  onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    const model = editor.getModel();
    const originalValue = model.getValue();
    const readonlyProps = new Set(["name", "id", "status"]);
    const readonlyRanges: monaco.Range[] = [];
    const propNameRanges: monaco.Range[] = [];

    // Find all property names and readonly property values
    const regex = /"(\w+)"\s*:\s*("[^"]*"|\d+|true|false|null)/g;
    let match;
    while ((match = regex.exec(originalValue)) !== null) {
      const prop = match[1];
      // Property name range (just the name, not quotes)
      const nameStartIndex = match.index + 1;
      const nameEndIndex = nameStartIndex + prop.length;
      const nameStartPos = model.getPositionAt(nameStartIndex);
      const nameEndPos = model.getPositionAt(nameEndIndex);
      propNameRanges.push(new monaco.Range(nameStartPos.lineNumber, nameStartPos.column, nameEndPos.lineNumber, nameEndPos.column));
      // If this property is readonly, also track its value range
      if (readonlyProps.has(prop)) {
        const valueStartIndex = match.index;
        const valueEndIndex = valueStartIndex + match[0].length;
        const valueStartPos = model.getPositionAt(valueStartIndex);
        const valueEndPos = model.getPositionAt(valueEndIndex);
        readonlyRanges.push(new monaco.Range(valueStartPos.lineNumber, valueStartPos.column, valueEndPos.lineNumber, valueEndPos.column));
      }
    }

    // Add a readonly range for the first N lines (all columns)
    const READONLY_LINE_COUNT = 24;
    const readonlyLineCount = Math.min(READONLY_LINE_COUNT, model.getLineCount());
    const firstNLinesRange = new monaco.Range(
      1, 1,
      readonlyLineCount, model.getLineMaxColumn(readonlyLineCount)
    );
    readonlyRanges.push(firstNLinesRange);

    // Add decorations for all property names and readonly property values
    const decorations = [
      ...propNameRanges.map(range => ({
        range,
        options: { inlineClassName: 'readonly-property' }
      })),
      ...readonlyRanges.map(range => ({
        range,
        options: { inlineClassName: 'readonly-property' }
      }))
    ];
    let decorationIds = editor.deltaDecorations([], decorations);

    // Intercept edits and revert only forbidden changes
    editor.onDidChangeModelContent((e) => {
      const forbiddenEdits: monaco.editor.IIdentifiedSingleEditOperation[] = [];
      for (const change of e.changes) {
        const changeRange = new monaco.Range(
          change.range.startLineNumber,
          change.range.startColumn,
          change.range.endLineNumber,
          change.range.endColumn
        );
        // Check overlap with any readonly property name or value
        const overlapsReadonly = [...propNameRanges, ...readonlyRanges].some(readonlyRange =>
          readonlyRange.intersectRanges(changeRange) !== null
        );
        if (overlapsReadonly) {
          // Revert this change by replacing it with the original text
          const originalText = model.getValueInRange(changeRange);
          forbiddenEdits.push({
            range: changeRange,
            text: originalText,
            forceMoveMarkers: true
          });
        }
      }
      if (forbiddenEdits.length > 0) {
        // Undo only the forbidden edits
        editor.executeEdits("readonly-revert", forbiddenEdits);
      }
    });
  }
}

const json = `{
    "_id": "688112ea0154fb187c6afdf9",
    "index": 0,
    "guid": "b4f289bd-ce1f-4f12-931c-41835fb5f4c4",
    "isActive": true,
    "balance": "$1,313.88",
    "picture": "http://placehold.it/32x32",
    "age": 37,
    "eyeColor": "blue",
    "name": "Campos Ashley",
    "gender": "male",
    "company": "ORBIXTAR",
    "email": "camposashley@orbixtar.com",
    "phone": "+1 (819) 567-2803",
    "address": "736 Charles Place, Rosine, South Dakota, 3729",
    "about": "Irure nostrud cillum exercitation sunt eiusmod anim adipisicing officia sunt qui. Voluptate occaecat adipisicing dolor labore nisi ad esse veniam laborum incididunt velit consectetur laborum excepteur. Elit eu sint minim nisi. Id adipisicing aliquip magna adipisicing eu duis occaecat deserunt pariatur fugiat consequat. Veniam ut ut sit enim dolor eu mollit ullamco anim aute Lorem minim officia.\r\n",
    "registered": "2015-02-20T06:53:16 -02:00",
    "latitude": 60.237931,
    "longitude": -167.492678,
    "tags": [
      "nostrud",
      "reprehenderit",
      "ad",
      "labore",
      "ut",
      "commodo",
      "sit"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Ingrid Giles"
      },
      {
        "id": 1,
        "name": "Castillo Sawyer"
      },
      {
        "id": 2,
        "name": "Cervantes Wiggins"
      }
    ],
    "greeting": "Hello, Campos Ashley! You have 6 unread messages.",
    "favoriteFruit": "banana"
  }`;