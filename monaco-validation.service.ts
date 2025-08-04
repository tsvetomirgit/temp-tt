import { Injectable } from '@angular/core';
import { editor, MarkerSeverity } from 'monaco-editor';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { Uri } from 'monaco-editor';

export interface ValidationState {
  isValid: boolean;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MonacoValidationService {
  private editor: editor.IStandaloneCodeEditor | null = null;
  private monaco: typeof import('monaco-editor') | null = null;
  private markersListener: { dispose(): void } | null = null;
  
  // RxJS subjects for reactive state management
  private validationStateSubject = new BehaviorSubject<ValidationState>({
    isValid: true,
    errors: []
  });
  
  private editorContentSubject = new BehaviorSubject<string>('');
  private validationTriggerSubject = new Subject<void>();

  // Public observables
  public readonly validationState$: Observable<ValidationState> = this.validationStateSubject.asObservable();
  public readonly errors$: Observable<string[]> = this.validationState$.pipe(
    map(state => state.errors),
    distinctUntilChanged()
  );
  public readonly editorContent$: Observable<string> = this.editorContentSubject.asObservable();
  public readonly errorCount$: Observable<number> = this.errors$.pipe(
    map(errors => errors.length),
    distinctUntilChanged()
  );

  constructor() {
    // Set up reactive validation pipeline
    this.validationTriggerSubject.pipe(
      debounceTime(100) // Debounce rapid validation triggers
    ).subscribe(() => {
      this.checkMonacoValidation();
    });
  }

  /**
   * Initialize the validation service with an editor instance
   */
  initialize(editor: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')): void {
    this.editor = editor;
    this.monaco = monaco;
    this.setupValidationTracking();
  }

  /**
   * Sets up validation tracking for Monaco's built-in JSON schema validation
   */
  private setupValidationTracking(): void {
    if (!this.editor || !this.monaco) {
      return;
    }

    // Listen for marker changes (validation errors/warnings)
    this.markersListener = this.monaco.editor.onDidChangeMarkers((e: Uri[]) => {
      // Check if the markers are for our editor
      const modelUri = this.editor?.getModel()?.uri;
      if (modelUri && e.includes(modelUri)) {
        this.validationTriggerSubject.next();
      }
    });

    // Listen for content changes
    this.editor.onDidChangeModelContent(() => {
      const content = this.editor?.getValue() || '';
      this.editorContentSubject.next(content);
      this.validationTriggerSubject.next();
    });

    // Initial validation check
    setTimeout(() => {
      this.validationTriggerSubject.next();
    }, 500); // Give Monaco time to apply schema validation
  }

  /**
   * Checks Monaco's built-in validation markers
   */
  private checkMonacoValidation(): void {
    if (!this.editor || !this.monaco) {
      this.updateValidationState({
        isValid: false,
        errors: ['Editor not available']
      });
      return;
    }

    const model = this.editor.getModel();
    if (!model) {
      this.updateValidationState({
        isValid: false,
        errors: ['Model not available']
      });
      return;
    }

    // Get all markers (validation errors/warnings) for this model
    const markers = this.monaco.editor.getModelMarkers({ resource: model.uri });
    
    // Filter for validation errors (not warnings)
    const validationErrors = markers.filter((marker) => 
      marker.severity === MarkerSeverity.Error
    );

    const newState: ValidationState = {
      isValid: validationErrors.length === 0,
      errors: validationErrors.map((marker) => marker.message)
    };

    this.updateValidationState(newState);

    console.log(`Monaco validation: ${validationErrors.length} errors found`);
    if (validationErrors.length > 0) {
      console.log('Validation errors:', newState.errors);
    }
  }

  /**
   * Update validation state and emit to subscribers
   */
  private updateValidationState(state: ValidationState): void {
    this.validationStateSubject.next(state);
  }

  /**
   * Get current validation state (synchronous)
   */
  getValidationState(): ValidationState {
    return this.validationStateSubject.value;
  }

  /**
   * Check if submit should be disabled (synchronous)
   */
  shouldDisableSubmit(): boolean {
    return !this.validationStateSubject.value.isValid;
  }

  /**
   * Get current editor content (synchronous)
   */
  getEditorContent(): string {
    return this.editorContentSubject.value;
  }

  /**
   * Get current editor content as parsed JSON (synchronous)
   */
  getEditorContentAsJson(): any {
    try {
      return JSON.parse(this.getEditorContent());
    } catch (error) {
      return null;
    }
  }

  /**
   * Get validation errors as a formatted string
   */
  getValidationErrorsText(): string {
    return this.validationStateSubject.value.errors.join('\n');
  }

  /**
   * Check if there are any validation errors (synchronous)
   */
  hasErrors(): boolean {
    return this.validationStateSubject.value.errors.length > 0;
  }

  /**
   * Get the number of validation errors (synchronous)
   */
  getErrorCount(): number {
    return this.validationStateSubject.value.errors.length;
  }

  /**
   * Force a validation check
   */
  forceValidationCheck(): void {
    this.validationTriggerSubject.next();
  }

  /**
   * Get editor content as observable
   */
  getEditorContentAsObservable(): Observable<string> {
    return this.editorContent$;
  }

  /**
   * Get editor content as JSON observable
   */
  getEditorContentAsJsonObservable(): Observable<any> {
    return this.editorContent$.pipe(
      map(content => {
        try {
          return JSON.parse(content);
        } catch (error) {
          return null;
        }
      })
    );
  }

  /**
   * Subscribe to validation state changes
   */
  onValidationChange(callback: (state: ValidationState) => void): void {
    this.validationState$.subscribe(callback);
  }

  /**
   * Subscribe to error count changes
   */
  onErrorCountChange(callback: (count: number) => void): void {
    this.errorCount$.subscribe(callback);
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.markersListener) {
      this.markersListener.dispose();
      this.markersListener = null;
    }
    
    this.editor = null;
    this.monaco = null;
    
    // Complete subjects
    this.validationStateSubject.complete();
    this.editorContentSubject.complete();
    this.validationTriggerSubject.complete();
  }
} 
