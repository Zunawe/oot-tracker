/**
 * Reader for an input to be parsed.
 */
class Reader {
  constructor (input) {
    this._input = input
    this._i = -1
  }

  /**
   * Check the value of a single character later in the input
   * @param {number} k The number of characters forward to look
   * @returns {string} The character at position k from the cursor
   */
  peek (k = 1) {
    return this._input.charAt(this._i + k)
  }

  /**
   * Move the cursor forward k spaces and return the last character
   * @param {number} k The number of characters forward to consume
   * @returns {string} The character at position k from the cursor
   */
  consume (k = 1) {
    this._i += k
    return this._input.charAt(this._i)
  }

  /**
   * Check whether the character k spaces from the cursor is at or after the end of the input
   * @param {number} k The number of characters forward check
   * @returns {boolean} false if the character is still within the input
   */
  isEOF (k = 1) {
    return this._i + k >= this._input.length
  }
}

module.exports = Reader
