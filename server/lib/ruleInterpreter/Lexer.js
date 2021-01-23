const Reader = require('./Reader')

const token = (type, symbol) => ({ type, symbol })

class Lexer {
  constructor (input) {
    this._tokens = []
    this._i = -1
    this._reader = new Reader(input)
    this._process()
  }

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

  peek (k) {
    k = k === undefined ? 1 : k
    return this._tokens[this._i + k]
  }

  consume (k) {
    this._i += k === undefined ? 1 : k
    return this._tokens[this._i]
  }
}

module.exports = Lexer
