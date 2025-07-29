export class Range {
  constructor(
    public startLineNumber: number,
    public startColumn: number,
    public endLineNumber: number,
    public endColumn: number
  ) {}

  // Returns true if this range intersects with another
  intersects(other: Range): boolean {
    // If one range ends before the other starts, they don't intersect
    if (this.endLineNumber < other.startLineNumber ||
        this.startLineNumber > other.endLineNumber) {
      return false;
    }
    // If on the same line, check columns
    if (this.startLineNumber === other.endLineNumber && this.startColumn > other.endColumn) {
      return false;
    }
    if (this.endLineNumber === other.startLineNumber && this.endColumn < other.startColumn) {
      return false;
    }
    return true;
  }
} 
