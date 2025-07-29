import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import * as monaco from 'monaco-editor';
import { Range } from './range';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule, MonacoEditorModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'monaco-editor';
  editorOptions = { 
    language: 'json',
    schema: {
      uri: 'http://myschema/1',
      fileMatch: ['*'],
      schema: this.getJsonSchema()
    }
  };
  code: string = json;

  /**
   * Initializes the Monaco editor with JSON schema validation, readonly properties, and edit interception.
   * This is the main entry point for setting up all editor functionality.
   * @param editor - The Monaco editor instance to configure
   */
  onEditorInit(editor: monaco.editor.IStandaloneCodeEditor): void {
    this.setupJsonSchema(editor);
    this.setupReadonlyProperties(editor);
    this.setupEditInterception(editor);
  }

  /**
   * Sets up JSON schema validation and autocomplete using Monaco's built-in JSON language service.
   * This provides better validation, error highlighting, and intelligent autocomplete.
   * @param editor - The Monaco editor instance
   */
  private setupJsonSchema(editor: monaco.editor.IStandaloneCodeEditor): void {
    // Register the JSON schema with Monaco's JSON language service
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [{
        uri: 'http://myschema/1',
        fileMatch: ['*'],
        schema: this.getJsonSchema()
      }],
      allowComments: false,
      trailingCommas: 'error'
    });
  }

  /**
   * Returns a comprehensive JSON schema that defines the structure, types, and validation rules
   * for the user data object. This schema provides better autocomplete, validation, and documentation.
   * You can also load the schema from an external file for better maintainability.
   * @returns JSON schema object defining the data structure
   */
  private getJsonSchema(): any {
    // For better maintainability, you can load the schema from the external file:
    // return require('./user-profile.schema.json');
    
    // For now, returning the inline schema:
    return {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "User Profile Schema",
      description: "Schema for user profile data with validation rules",
      type: "object",
      required: ["_id", "index", "guid", "isActive", "balance", "picture", "age", "eyeColor", "name", "gender", "company", "email", "phone", "address", "about", "registered", "latitude", "longitude", "tags", "friends", "greeting", "favoriteFruit"],
      properties: {
        "_id": {
          type: "string",
          description: "Unique MongoDB ObjectId identifier for the user",
          pattern: "^[a-f0-9]{24}$",
          examples: ["688112ea0154fb187c6afdf9"]
        },
        "index": {
          type: "integer",
          description: "Sequential index number for ordering users",
          minimum: 0,
          maximum: 999999,
          examples: [0, 1, 2]
        },
        "guid": {
          type: "string",
          description: "Global unique identifier (UUID v4) for the user",
          pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$",
          examples: ["b4f289bd-ce1f-4f12-931c-41835fb5f4c4"]
        },
        "isActive": {
          type: "boolean",
          description: "Whether the user account is currently active",
          examples: [true, false]
        },
        "balance": {
          type: "string",
          description: "Account balance in USD currency format with commas and cents",
          pattern: "^\\$[0-9,]+\\.[0-9]{2}$",
          examples: ["$1,313.88", "$2,500.00"]
        },
        "picture": {
          type: "string",
          description: "URL to the user's profile picture or avatar",
          format: "uri",
          examples: ["http://placehold.it/32x32", "https://example.com/avatar.jpg"]
        },
        "age": {
          type: "integer",
          description: "User's age in years",
          minimum: 0,
          maximum: 150,
          examples: [25, 37, 42]
        },
        "eyeColor": {
          type: "string",
          description: "User's eye color from predefined options",
          enum: ["blue", "brown", "green", "gray", "hazel"],
          examples: ["blue", "brown", "green"]
        },
        "name": {
          type: "string",
          description: "User's full name (first and last name)",
          minLength: 1,
          maxLength: 100,
          pattern: "^[a-zA-Z\\s]+$",
          examples: ["Campos Ashley", "John Doe"]
        },
        "gender": {
          type: "string",
          description: "User's gender identity",
          enum: ["male", "female", "other"],
          examples: ["male", "female", "other"]
        },
        "company": {
          type: "string",
          description: "Company name where the user is employed",
          minLength: 1,
          maxLength: 100,
          examples: ["ORBIXTAR", "Tech Corp"]
        },
        "email": {
          type: "string",
          description: "User's email address for communication",
          format: "email",
          examples: ["camposashley@orbixtar.com", "user@example.com"]
        },
        "phone": {
          type: "string",
          description: "User's phone number in US format",
          pattern: "^\\+1 \\([0-9]{3}\\) [0-9]{3}-[0-9]{4}$",
          examples: ["+1 (819) 567-2803", "+1 (555) 123-4567"]
        },
        "address": {
          type: "string",
          description: "User's complete mailing address",
          minLength: 10,
          maxLength: 200,
          examples: ["736 Charles Place, Rosine, South Dakota, 3729"]
        },
        "about": {
          type: "string",
          description: "User's bio or about section with personal description",
          minLength: 10,
          maxLength: 1000,
          examples: ["Irure nostrud cillum exercitation sunt eiusmod..."]
        },
        "registered": {
          type: "string",
          description: "Registration date and time in ISO 8601 format",
          format: "date-time",
          examples: ["2015-02-20T06:53:16 -02:00", "2023-01-15T10:30:00Z"]
        },
        "latitude": {
          type: "number",
          description: "Geographic latitude coordinate in decimal degrees",
          minimum: -90,
          maximum: 90,
          examples: [60.237931, 40.7128]
        },
        "longitude": {
          type: "number",
          description: "Geographic longitude coordinate in decimal degrees",
          minimum: -180,
          maximum: 180,
          examples: [-167.492678, -74.0060]
        },
        "tags": {
          type: "array",
          description: "Array of tags or keywords associated with the user",
          items: {
            type: "string",
            minLength: 1,
            maxLength: 50,
            pattern: "^[a-zA-Z0-9\\s]+$"
          },
          minItems: 1,
          maxItems: 20,
          uniqueItems: true,
          examples: [["nostrud", "reprehenderit", "ad", "labore"]]
        },
        "friends": {
          type: "array",
          description: "Array of friend objects with their basic information",
          items: {
            type: "object",
            required: ["id", "name"],
            properties: {
              "id": {
                type: "integer",
                description: "Friend's unique identifier",
                minimum: 0,
                examples: [0, 1, 2]
              },
              "name": {
                type: "string",
                description: "Friend's full name",
                minLength: 1,
                maxLength: 100,
                pattern: "^[a-zA-Z\\s]+$",
                examples: ["Ingrid Giles", "John Smith"]
              }
            },
            additionalProperties: false
          },
          minItems: 0,
          maxItems: 100,
          examples: [[
            { "id": 0, "name": "Ingrid Giles" },
            { "id": 1, "name": "Castillo Sawyer" }
          ]]
        },
        "greeting": {
          type: "string",
          description: "Personalized greeting message for the user",
          minLength: 1,
          maxLength: 200,
          examples: ["Hello, Campos Ashley! You have 6 unread messages."]
        },
        "favoriteFruit": {
          type: "string",
          description: "User's favorite fruit from predefined options",
          enum: ["banana", "apple", "orange", "strawberry", "grape"],
          examples: ["banana", "apple", "orange"]
        }
      },
      additionalProperties: false
    };
  }

  /**
   * Sets up readonly properties by finding property ranges, adding readonly line ranges,
   * and applying visual decorations to indicate readonly areas.
   * @param editor - The Monaco editor instance
   */
  private setupReadonlyProperties(editor: monaco.editor.IStandaloneCodeEditor): void {
    const model = editor.getModel();
    const originalValue = model.getValue();
    const readonlyProps = new Set(["name", "id", "status"]);
    const readonlyRanges: Range[] = [];
    const propNameRanges: Range[] = [];

    this.findPropertyRanges(model, originalValue, readonlyProps, readonlyRanges, propNameRanges);
    this.addReadonlyLineRange(model, readonlyRanges);
    this.addDecorations(editor, readonlyRanges, propNameRanges);
  }

  /**
   * Finds all property ranges in the JSON content and categorizes them as readonly or property names.
   * Uses regex to identify JSON properties and their values.
   * @param model - The Monaco editor text model
   * @param originalValue - The original JSON content
   * @param readonlyProps - Set of property names that should be readonly
   * @param readonlyRanges - Array to store readonly property ranges
   * @param propNameRanges - Array to store property name ranges
   */
  private findPropertyRanges(model: monaco.editor.ITextModel, originalValue: string, readonlyProps: Set<string>, readonlyRanges: Range[], propNameRanges: Range[]): void {
    const regex = /"(\w+)"\s*:\s*("[^"]*"|\d+|true|false|null)/g;
    let match;
    while ((match = regex.exec(originalValue)) !== null) {
      const prop = match[1];
      this.addPropertyNameRange(model, match, propNameRanges);
      if (readonlyProps.has(prop)) {
        this.addReadonlyPropertyRange(model, match, readonlyRanges);
      }
    }
  }

  /**
   * Adds a property name range to the property name ranges array.
   * Calculates the position of the property name (without quotes) in the editor.
   * @param model - The Monaco editor text model
   * @param match - The regex match result
   * @param propNameRanges - Array to store property name ranges
   */
  private addPropertyNameRange(model: monaco.editor.ITextModel, match: RegExpExecArray, propNameRanges: Range[]): void {
    const prop = match[1];
    const nameStartIndex = match.index + 1;
    const nameEndIndex = nameStartIndex + prop.length;
    const nameStartPos = model.getPositionAt(nameStartIndex);
    const nameEndPos = model.getPositionAt(nameEndIndex);
    propNameRanges.push(new Range(nameStartPos.lineNumber, nameStartPos.column, nameEndPos.lineNumber, nameEndPos.column));
  }

  /**
   * Adds a readonly property range to the readonly ranges array.
   * Calculates the position of the entire property-value pair in the editor.
   * @param model - The Monaco editor text model
   * @param match - The regex match result
   * @param readonlyRanges - Array to store readonly property ranges
   */
  private addReadonlyPropertyRange(model: monaco.editor.ITextModel, match: RegExpExecArray, readonlyRanges: Range[]): void {
    const valueStartIndex = match.index;
    const valueEndIndex = valueStartIndex + match[0].length;
    const valueStartPos = model.getPositionAt(valueStartIndex);
    const valueEndPos = model.getPositionAt(valueEndIndex);
    readonlyRanges.push(new Range(valueStartPos.lineNumber, valueStartPos.column, valueEndPos.lineNumber, valueEndPos.column));
  }

  /**
   * Adds a readonly range for the first N lines of the document.
   * Makes the beginning of the document readonly to prevent structural changes.
   * @param model - The Monaco editor text model
   * @param readonlyRanges - Array to store readonly ranges
   */
  private addReadonlyLineRange(model: monaco.editor.ITextModel, readonlyRanges: Range[]): void {
    const READONLY_LINE_COUNT = 24;
    const readonlyLineCount = Math.min(READONLY_LINE_COUNT, model.getLineCount());
    const firstNLinesRange = new Range(
      1, 1,
      readonlyLineCount, model.getLineMaxColumn(readonlyLineCount)
    );
    readonlyRanges.push(firstNLinesRange);
  }

  /**
   * Adds visual decorations to readonly areas in the editor.
   * Applies CSS classes to indicate which areas are readonly.
   * @param editor - The Monaco editor instance
   * @param readonlyRanges - Array of readonly ranges
   * @param propNameRanges - Array of property name ranges
   */
  private addDecorations(editor: monaco.editor.IStandaloneCodeEditor, readonlyRanges: Range[], propNameRanges: Range[]): void {
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
    editor.deltaDecorations([], decorations);
  }

  /**
   * Sets up edit interception to prevent modifications to readonly areas.
   * Listens for content changes and reverts any edits that overlap with readonly ranges.
   * @param editor - The Monaco editor instance
   */
  private setupEditInterception(editor: monaco.editor.IStandaloneCodeEditor): void {
    const model = editor.getModel();
    const originalValue = model.getValue();
    const readonlyProps = new Set(["name", "id", "status"]);
    const readonlyRanges: Range[] = [];
    const propNameRanges: Range[] = [];

    this.findPropertyRanges(model, originalValue, readonlyProps, readonlyRanges, propNameRanges);

    editor.onDidChangeModelContent((e) => {
      const forbiddenEdits = this.getForbiddenEdits(e, readonlyRanges, propNameRanges, model);
      if (forbiddenEdits.length > 0) {
        editor.executeEdits("readonly-revert", forbiddenEdits);
      }
    });
  }

  /**
   * Identifies forbidden edits that overlap with readonly areas.
   * Checks each change against readonly ranges and creates revert operations.
   * @param e - The model content changed event
   * @param readonlyRanges - Array of readonly ranges
   * @param propNameRanges - Array of property name ranges
   * @param model - The Monaco editor text model
   * @returns Array of edit operations to revert forbidden changes
   */
  private getForbiddenEdits(e: monaco.editor.IModelContentChangedEvent, readonlyRanges: Range[], propNameRanges: Range[], model: monaco.editor.ITextModel): monaco.editor.IIdentifiedSingleEditOperation[] {
    const forbiddenEdits: monaco.editor.IIdentifiedSingleEditOperation[] = [];
    
    for (const change of e.changes) {
      const changeRange = new Range(
        change.range.startLineNumber,
        change.range.startColumn,
        change.range.endLineNumber,
        change.range.endColumn
      );
      
      const overlapsReadonly = [...propNameRanges, ...readonlyRanges].some(readonlyRange =>
        readonlyRange.intersects(changeRange)
      );
      
      if (overlapsReadonly) {
        const originalText = model.getValueInRange(changeRange);
        forbiddenEdits.push({
          range: changeRange,
          text: originalText,
          forceMoveMarkers: true
        });
      }
    }
    
    return forbiddenEdits;
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
