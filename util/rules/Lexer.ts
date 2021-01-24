import Reader from './Reader'

export enum TokenType {
  LEFT_PAREN = 'LEFT_PAREN',
  RIGHT_PAREN = 'RIGHT_PAREN',
  BOOLEAN = 'BOOLEAN',
  AND = 'AND',
  OR = 'OR',
  FORWARD_SLASH = 'FORWARD_SLASH',
  IDENT = 'IDENT',
  ARG = 'ARG',
  EOF = 'EOF'
}

export interface Token {
  type: TokenType
  symbol: string
}

/**
 * Create a token object from the type and symbol.
 * @param {string} type The type of token (AND, IDENT, (, etc...)
 * @param {symbol} symbol The string representation of this token
 */
const token = (type: TokenType, symbol: string): Token => ({ type, symbol })

/**
 * Transforms an input into a list of tokens and then reads out those tokens
 */
class Lexer {
  private readonly tokens: Token[]
  private i: number
  private readonly reader: Reader

  constructor (input: string) {
    this.tokens = []
    this.i = -1
    this.reader = new Reader(input)
    this.process()
  }

  /**
   * Get the name of a symbol at the current cursor position. Does not consume.
   * @returns The name of a symbol at the current cursor position
   */
  private getName (): string {
    let k = 1
    let buffer = ''
    while (!this.reader.isEOF(k) && /[a-zA-Z0-9_]/.test(this.reader.peek(k))) {
      buffer += this.reader.peek(k)
      ++k
    }

    if (buffer.length === 0) {
      throw new Error(`Unrecognizable syntax at character [${this.reader.getCursorLocation()}]`)
    }

    return buffer
  }

  /**
   * Read the input and generate tokens
   */
  private process (): void {
    const reader = this.reader
    let symbol, arg

    while (!reader.isEOF()) {
      const current = reader.peek()
      switch (current) {
        case ' ':
        case '\t':
        case '\n':
          reader.consume()
          break
        case '(':
          this.tokens.push(token(TokenType.LEFT_PAREN, current))
          this.reader.consume()
          break
        case ')':
          this.tokens.push(token(TokenType.RIGHT_PAREN, current))
          this.reader.consume()
          break
        case '/':
          this.tokens.push(token(TokenType.FORWARD_SLASH, current))
          this.reader.consume()
          arg = this.getName()
          this.tokens.push(token(TokenType.ARG, arg))
          this.reader.consume(arg.length)
          break
        default:
          symbol = this.getName()
          switch (symbol) {
            case 'AND':
              this.tokens.push(token(TokenType.AND, symbol))
              break
            case 'OR':
              this.tokens.push(token(TokenType.OR, symbol))
              break
            case 'true':
            case 'false':
              this.tokens.push(token(TokenType.BOOLEAN, symbol))
              break
            default:
              this.tokens.push(token(TokenType.IDENT, symbol))
              break
          }
          this.reader.consume(symbol.length)
          break
      }
    }
    this.tokens.push(token(TokenType.EOF, ''))
  }

  /**
   * Check the value of a single token later in the list
   * @param {number} k The number of tokens forward to look
   * @returns {string} The token at position k from the cursor
   */
  peek (k = 1): Token {
    return this.tokens[this.i + k]
  }

  /**
   * Move the cursor forward k spaces and return the last token
   * @param {number} k The number of tokens forward to consume
   * @returns {string} The token at position k from the cursor
   */
  consume (k = 1): Token {
    this.i += k
    return this.tokens[this.i]
  }
}

export default Lexer
