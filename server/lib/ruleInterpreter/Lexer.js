const Reader = require('./Reader')

/**
 * Create a token object from the type and symbol.
 * @param {string} type The type of token (AND, IDENT, (, etc...)
 * @param {symbol} symbol The string representation of this token
 */
const token = (type, symbol) => ({ type, symbol })

/**
 * Transforms an input into a list of tokens and then reads out those tokens
 */
class Lexer {
  constructor (input) {
    this._tokens = []
    this._i = -1
    this._reader = new Reader(input)
    this._process()
  }

  /**
   * Get the name of a symbol at the current cursor position. Does not consume.
   * @returns The name of a symbol at the current cursor position
   */
  _getName () {
    let k = 1
    let buffer = ''
    while (!this._reader.isEOF(k) && /[a-zA-Z0-9_]/.test(this._reader.peek(k))) {
      buffer += this._reader.peek(k)
      ++k
    }

    if (buffer.length === 0) {
      throw new Error(`Unrecognizable syntax at character [${this._reader._i}]`)
    }

    return buffer
  }

  /**
   * Read the input and generate tokens
   */
  _process () {
    const reader = this._reader
    let symbol

    while (!reader.isEOF()) {
      const current = reader.peek()
      switch (current) {
        case ' ':
        case '\t':
        case '\n':
          reader.consume()
          break
        case '(':
        case ')':
        case '/':
          this._tokens.push(token(current, current))
          this._reader.consume()
          break
        default:
          symbol = this._getName()
          switch (symbol) {
            case 'AND':
              this._tokens.push(token('AND', symbol))
              break
            case 'OR':
              this._tokens.push(token('OR', symbol))
              break
            case 'true':
              this._tokens.push(token('TRUE_LITERAL', symbol))
              break
            case 'false':
              this._tokens.push(token('FALSE_LITERAL', symbol))
              break
            default:
              this._tokens.push(token('IDENT', symbol))
              break
          }
          this._reader.consume(symbol.length)
          break
      }
    }
    this._tokens.push(token('EOF', null))
  }

  /**
   * Check the value of a single token later in the list
   * @param {number} k The number of tokens forward to look
   * @returns {string} The token at position k from the cursor
   */
  peek (k = 1) {
    return this._tokens[this._i + k]
  }

  /**
   * Move the cursor forward k spaces and return the last token
   * @param {number} k The number of tokens forward to consume
   * @returns {string} The token at position k from the cursor
   */
  consume (k = 1) {
    this._i += k
    return this._tokens[this._i]
  }
}

module.exports = Lexer
