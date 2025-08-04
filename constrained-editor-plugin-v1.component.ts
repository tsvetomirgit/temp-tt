import { Component, Input, OnDestroy } from '@angular/core';
import { NgxEditorModel } from 'ngx-monaco-editor';
import { constrainedEditor } from 'constrained-editor-plugin';
import { editor } from 'monaco-editor';
import { MonacoValidationService, ValidationState } from './monaco-validation.service';
import { Observable } from 'rxjs';

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

  constructor(private validationService: MonacoValidationService) {}

  // Reactive observables from the service
  readonly validationState$: Observable<ValidationState> = this.validationService.validationState$;
  readonly errors$: Observable<string[]> = this.validationService.errors$;
  readonly errorCount$: Observable<number> = this.validationService.errorCount$;
  readonly editorContent$: Observable<string> = this.validationService.editorContent$;

  /**
   * Extracts all property names from the simpleJson and determines which ones are editable
   * @returns Array of field names that should be editable (not in readonlyFields)
   */
  getEditableFields(): string[] {
    try {
      const jsonObj = JSON.parse(simpleJson);
      const allFields = this.extractAllPropertyNames(jsonObj);
      
      // Return fields that are NOT in readonlyFields (i.e., editable fields)
      return allFields.filter(field => !this.readonlyFields.includes(field));
    } catch (error) {
      console.error('Error parsing JSON or extracting fields:', error);
      return [];
    }
  }

  /**
   * Recursively extracts all property names from a JSON object
   * @param obj The JSON object to extract property names from
   * @returns Array of all property names found in the object
   */
  private extractAllPropertyNames(obj: any): string[] {
    const properties: string[] = [];
    
    if (obj && typeof obj === 'object') {
      // Get direct properties of this object
      Object.keys(obj).forEach(key => {
        if (!properties.includes(key)) {
          properties.push(key);
        }
        
        // Recursively extract properties from nested objects/arrays
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item: any) => {
            properties.push(...this.extractAllPropertyNames(item));
          });
        } else if (obj[key] && typeof obj[key] === 'object') {
          properties.push(...this.extractAllPropertyNames(obj[key]));
        }
      });
    }
    
    return Array.from(new Set(properties));
  }

  /**
   * Checks if decorations already exist and are valid
   * @returns true if decorations exist and are valid, false otherwise
   */
  private hasValidDecorations(): boolean {
    if (!this.decorationsCollection || !this.editor) {
      return false;
    }
    
    // Check if the decoration IDs are still valid
    const model = this.editor.getModel();
    if (!model) {
      return false;
    }
    
    // Get all decorations from the model
    const allDecorations = model.getAllDecorations();
    
    // Check if our decoration collection has valid decorations
    const validDecorations = allDecorations.filter(decoration => 
      this.decorationsCollection.includes(decoration.id)
    );
    
    console.log(`Found ${validDecorations.length} valid decorations out of ${this.decorationsCollection.length} tracked`);
    
    // Consider valid if we have at least some decorations
    return validDecorations.length > 0;
  }

  /**
   * Gets information about existing decorations
   */
  private getDecorationsInfo(): void {
    if (!this.editor) {
      console.log('No editor available');
      return;
    }
    
    const model = this.editor.getModel();
    if (!model) {
      console.log('No model available');
      return;
    }
    
    const allDecorations = model.getAllDecorations();
    console.log(`Total decorations in model: ${allDecorations.length}`);
    
    if (this.decorationsCollection) {
      console.log(`Tracked decoration IDs: ${this.decorationsCollection.length}`);
      console.log('Tracked decoration IDs:', this.decorationsCollection);
    }
    
    // Show details of our read-only decorations
    const readOnlyDecorations = allDecorations.filter(decoration => 
      decoration.options.className === 'readOnly'
    );
    console.log(`Read-only decorations: ${readOnlyDecorations.length}`);
  }

  /**
   * Public method to get current validation state
   */
  getValidationState(): ValidationState {
    return this.validationService.getValidationState();
  }

  /**
   * Public method to check if submit should be disabled
   */
  shouldDisableSubmit(): boolean {
    return this.validationService.shouldDisableSubmit();
  }

  /**
   * Gets the current editor content
   */
  getEditorContent(): string {
    return this.validationService.getEditorContent();
  }

  /**
   * Gets the current editor content as parsed JSON
   */
  getEditorContentAsJson(): any {
    return this.validationService.getEditorContentAsJson();
  }

  /**
   * Handles form submission
   */
  onSubmit(): void {
    // Get current validation state
    const currentState = this.validationService.getValidationState();
    
    if (currentState.isValid) {
      const jsonContent = this.validationService.getEditorContentAsJson();
      if (jsonContent) {
        console.log('Submitting valid JSON:', jsonContent);
        // Here you can add your submission logic
        // For example, sending to a service, API, etc.
        
        // Example: Emit an event with the valid JSON
        // this.jsonSubmitted.emit(jsonContent);
      }
    } else {
      console.log('Cannot submit: Content has validation errors');
    }
  }

  init(event: editor.IStandaloneCodeEditor): void {
    this.editor = event;
    this.monaco = window['monaco'];
    this.setDiagnosticsOptions(this.schema);
    
    // Clear any existing decorations first
    if (this.decorationsCollection) {
      this.editor.deltaDecorations(this.decorationsCollection, []);
      this.decorationsCollection = null;
    }
    
    // Set up Monaco's built-in validation tracking
    this.validationService.initialize(this.editor, this.monaco);
    
    // Wait for the editor to be fully ready and content to be stable
    const applyConstraints = () => {
      if (this.editor && this.editor.getModel()) {
        this.constrainedFields();
      } else {
        // If editor is not ready, try again after a short delay
        setTimeout(applyConstraints, 50);
      }
    };
    
    // Start the process
    applyConstraints();
  }

  constrainedFields() {
    if (!this.editor) {
      console.log('Editor not ready, skipping constrainedFields');
      return;
    }

    const model = this.editor.getModel();
    if (!model) {
      console.log('Model not ready, skipping constrainedFields');
      return;
    }

    // Check for existing decorations first
    console.log('=== Checking existing decorations ===');
    this.getDecorationsInfo();
    
    if (this.hasValidDecorations()) {
      console.log('Valid decorations already exist, skipping re-application');
      return;
    }

    console.log('=== Applying constraints and decorations ===');
    
    const constrainedInstance = constrainedEditor(this.monaco);
    constrainedInstance.initializeIn(this.editor);

    const restrictions = [];
    const decorations = [];

    // Get editable fields dynamically from the JSON
    const editableFields = this.getEditableFields();
    console.log('Editable fields:', editableFields);

    // Process editable fields - these will be added to restrictions (allowed regions)
    editableFields.forEach((field) => {
      const matches = model.findMatches(
        `"${field}"\\s*:`,
        true,
        true,
        false,
        null,
        true
      );
      console.log(`Found ${matches.length} matches for field: ${field}`);
      matches.forEach((match) => {
        const { startLineNumber, endLineNumber } = match.range;
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
      });
    });

    // Process readonly fields - these will get visual decorations
    this.readonlyFields.forEach((field) => {
      const matches = model.findMatches(
        `"${field}"\\s*:`,
        true,
        true,
        false,
        null,
        true
      );
      console.log(`Found ${matches.length} matches for readonly field: ${field}`);
      matches.forEach((match) => {
        const { startLineNumber, endLineNumber } = match.range;
        const range = new this.monaco.Range(
          startLineNumber,
          1,
          endLineNumber,
          model.getLineMaxColumn(endLineNumber)
        );
        decorations.push({
          range,
          options: {
            isWholeLine: true,
            className: 'readOnly',
          },
        });
      });
    });

    console.log(`Applying ${restrictions.length} restrictions and ${decorations.length} decorations`);

    // Add restrictions to the constrained editor instance
    // This will allow editing ONLY in the specified regions (editable fields)
    // and make everything else read-only
    constrainedInstance.addRestrictionsTo(model, restrictions);

    // Add new decorations for read-only fields
    this.decorationsCollection = this.editor.deltaDecorations(
      this.decorationsCollection || [],
      decorations
    );
    
    console.log('Constraints and decorations applied successfully');
    console.log('=== Final decoration state ===');
    this.getDecorationsInfo();
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
    // Clear decorations properly
    if (this.decorationsCollection && this.editor) {
      this.editor.deltaDecorations(this.decorationsCollection, []);
      this.decorationsCollection = null;
    }
    
    // Clean up validation service
    this.validationService.dispose();
    
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
    
    // Optionally reset Monaco JSON diagnostics if you want to remove your schema:
    if (this.monaco) {
      this.monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [] // Remove all schemas or restore previous state if you saved it
      });
    }
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
