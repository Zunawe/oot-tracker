/**
 * Reader for an input to be parsed.
 */
class Reader {
  private readonly input: string
  private i: number = -1

  constructor (input: string) {
    this.input = input
  }

  /**
   * Check the value of a single character later in the input
   * @param k The number of characters forward to look
   * @returns The character at position k from the cursor
   */
  peek (k = 1): string {
    return this.input.charAt(this.i + k)
  }

  /**
   * Move the cursor forward k spaces and return the last character
   * @param k The number of characters forward to consume
   * @returns The character at position k from the cursor
   */
  consume (k = 1): string {
    this.i += k
    return this.input.charAt(this.i)
  }

  /**
   * Check whether the character k spaces from the cursor is at or after the end of the input
   * @param k The number of characters forward check
   * @returns false if the character is still within the input
   */
  isEOF (k = 1): boolean {
    return this.i + k >= this.input.length
  }

  /**
   * Gets the position of the cursor in the input
   * @returns The index of the next character that will be returned
   */
  getCursorLocation (): number {
    return this.i + 1
  }
}

export default Reader
