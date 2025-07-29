/**
 * Provides the same functionality without triggering Monaco CSS loading
 */
export class CustomRange {
  public readonly startLineNumber: number;
  public readonly startColumn: number;
  public readonly endLineNumber: number;
  public readonly endColumn: number;

  constructor(startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number) {
    this.startLineNumber = startLineNumber;
    this.startColumn = startColumn;
    this.endLineNumber = endLineNumber;
    this.endColumn = endColumn;
  }

  /**
   * Checks if this range intersects with another range
   */
  public intersects(other: CustomRange): boolean {
    return !(
      this.endLineNumber < other.startLineNumber ||
      this.startLineNumber > other.endLineNumber ||
      (this.endLineNumber === other.startLineNumber && this.endColumn < other.startColumn) ||
      (this.startLineNumber === other.endLineNumber && this.startColumn > other.endColumn)
    );
  }

  /**
   * Checks if this range contains a position
   */
  public containsPosition(lineNumber: number, column: number): boolean {
    if (lineNumber < this.startLineNumber || lineNumber > this.endLineNumber) {
      return false;
    }
    if (lineNumber === this.startLineNumber && column < this.startColumn) {
      return false;
    }
    if (lineNumber === this.endLineNumber && column > this.endColumn) {
      return false;
    }
    return true;
  }

  /**
   * Creates a range from Monaco's range format
   */
  public static fromMonacoRange(range: any): CustomRange {
    return new CustomRange(
      range.startLineNumber,
      range.startColumn,
      range.endLineNumber,
      range.endColumn
    );
  }

  /**
   * Converts to Monaco's range format
   */
  public toMonacoRange(): any {
    return {
      startLineNumber: this.startLineNumber,
      startColumn: this.startColumn,
      endLineNumber: this.endLineNumber,
      endColumn: this.endColumn
    };
  }
} 
