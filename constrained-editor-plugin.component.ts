import { Component, Input, OnDestroy } from '@angular/core';
import { NgxEditorModel } from 'ngx-monaco-editor';
import { constrainedEditor } from 'constrained-editor-plugin';
import { editor } from 'monaco-editor';

@Component({
  selector: 'app-constrained-editor-plugin',
  templateUrl: './constrained-editor-plugin.component.html',
})
export class ConstrainedEditorPluginComponent implements OnDestroy {
  schema: any;

  editor: editor.IStandaloneCodeEditor | null = null;
  options = {
    languages: ['json'],
    theme: 'vs-light',
  };

  modelUri: string = 'file:///schema';

  model: NgxEditorModel = JSON.parse(simpleJson);

  readonlyFields = [
    '_id',
    'isActive',
    'eyeColor',
    'phone',
    'address',
    'about',
    'registered',
    'latitude',
    'longitude',
  ];

  monaco: any;

  // Add this property to your class to keep track of decorations
  decorationsCollection: string[] = null;

  init(event: editor.IStandaloneCodeEditor): void {
    this.editor = event;
    this.monaco = window['monaco'];
    this.setDiagnosticsOptions(this.schema);
    this.constrainedFields();
  }

  constrainedFields() {
    const constrainedInstance = constrainedEditor(this.monaco);
    const model = this.editor.getModel();
    constrainedInstance.initializeIn(this.editor);

    const restrictions = [];
    const decorations = [];

    this.readonlyFields.forEach((field) => {
      const matches = model.findMatches(
        `"${field}"\\s*:`,
        true,
        true,
        false,
        null,
        true
      );
      matches.forEach((match) => {
        const { startLineNumber, endLineNumber } = match.range;
        //range: [startLineNumber, 1, endLineNumber, 1],
        const range = new this.monaco.Range(
          startLineNumber,
          1,
          endLineNumber,
          model.getLineMaxColumn(endLineNumber)
        );
        restrictions.push({
          range: [
            startLineNumber,
            1,
            endLineNumber,
            model.getLineMaxColumn(endLineNumber),
          ],
          allowMultiline: false,
          label: field,
        });
        decorations.push({
          range,
          options: {
            isWholeLine: true,
            className: 'readOnly',
          },
        });
      });
    });

    // Add restrictions to the constrained editor instance
    // This will apply the restrictions to the editor
    // and prevent editing of the specified fields
    constrainedInstance.addRestrictionsTo(model, restrictions);

    // Add new decorations
    this.decorationsCollection = this.editor.deltaDecorations(
      this.decorationsCollection || [],
      decorations
    );
  }

  setDiagnosticsOptions(schema) {
    if (this.editor) {
      this.monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        enableSchemaRequest: true,
        validate: true,
        schemas: [
          // @ts-ignore
          {
            fileMatch: [this.modelUri],
            schema: schema,
          },
        ],
      });
    }
  }

  ngOnDestroy() {
    if (this.decorationsCollection) {
      // this.decorationsCollection.clear();
      this.decorationsCollection = null;
    }
    if (this.editor) {
      this.editor.dispose();
    }
    // Optionally reset Monaco JSON diagnostics if you want to remove your schema:
    this.monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [] // Remove all schemas or restore previous state if you saved it
    });
  }
}

const simpleJson = `{
    "_id": "688c5217d396f6378b02f729",
    "index": 0,
    "guid": "2cb1c1aa-a055-4e80-92d3-8e5c87ad5e0d",
    "isActive": true,
    "balance": "$1,048.83",
    "picture": "http://placehold.it/32x32",
    "age": 37,
    "eyeColor": "green",
    "name": "Shelby Boyer",
    "gender": "female",
    "company": "IRACK",
    "email": "shelbyboyer@irack.com",
    "phone": "+1 (930) 469-3272",
    "address": "229 Locust Avenue, Kerby, Vermont, 2320",
    "about": "Excepteur proident ",
    "registered": "2023-02-09T06:28:26 -02:00",
    "latitude": -26.02455,
    "longitude": 93.399381,
    "tags": [
      "qui",
      "aute",
      "excepteur",
      "excepteur",
      "ad",
      "nisi",
      "non"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Sparks Gaines"
      },
      {
        "id": 1,
        "name": "Kline England"
      },
      {
        "id": 2,
        "name": "Francine Holden"
      }
    ],
    "children": [
          {
          "_id": "688c5217d396f6378b02f729",
          "index": 0,
          "guid": "2cb1c1aa-a055-4e80-92d3-8e5c87ad5e0d",
          "isActive": true,
          "balance": "$1,048.83",
          "picture": "http://placehold.it/32x32",
          "age": 37,
          "eyeColor": "green",
          "name": "Shelby Boyer",
          "gender": "female",
          "company": "IRACK",
          "email": "shelbyboyer@irack.com",
          "phone": "+1 (930) 469-3272",
          "address": "229 Locust Avenue, Kerby, Vermont, 2320",
          "about": "Excepteur proident ",
          "registered": "2023-02-09T06:28:26 -02:00",
          "latitude": -26.02455,
          "longitude": 93.399381
        }
    ]
    "greeting": "Hello, Shelby Boyer! You have 1 unread messages.",
    "favoriteFruit": "strawberry"
  }`;
