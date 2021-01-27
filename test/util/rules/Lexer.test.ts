import Lexer, { Token, TokenType } from '../../../util/rules/Lexer'

describe('Lexer', () => {

  const getTokens = (lexer: Lexer): Array<Token> => {
    let token: Token
    const tokens: Array<Token> = []

    do {
      token = lexer.consume()
      tokens.push(token)
    } while (token.type !== TokenType.EOF)

    return tokens
  }

  it('should create a token for a true literal', () => {
    const lexer = new Lexer('TRUE')
    const tokens = getTokens(lexer)
    expect(tokens).toStrictEqual([
      { type: TokenType.BOOLEAN, symbol: 'TRUE' },
      { type: TokenType.EOF, symbol: '' }
    ])
  })

  it('should create a token for a false literal', () => {
    const lexer = new Lexer('FALSE')
    const tokens = getTokens(lexer)
    expect(tokens).toStrictEqual([
      { type: TokenType.BOOLEAN, symbol: 'FALSE' },
      { type: TokenType.EOF, symbol: '' }
    ])
  })

  it('should create a token for a string literal', () => {
    const lexer = new Lexer('"this is a string"')
    const tokens = getTokens(lexer)
    expect(tokens).toStrictEqual([
      { type: TokenType.STRING, symbol: 'this is a string' },
      { type: TokenType.EOF, symbol: '' }
    ])
  })

  it('should create a token for a string literal even if it has other syntax in it', () => {
    const lexer = new Lexer('"this is a string with () and TRUE"')
    const tokens = getTokens(lexer)
    expect(tokens).toStrictEqual([
      { type: TokenType.STRING, symbol: 'this is a string with () and TRUE' },
      { type: TokenType.EOF, symbol: '' }
    ])
  })

  it('should correctly tokenize an AND operation', () => {
    const lexer = new Lexer('TRUE AND FALSE')
    const tokens = getTokens(lexer)
    expect(tokens).toStrictEqual([
      { type: TokenType.BOOLEAN, symbol: 'TRUE' },
      { type: TokenType.AND, symbol: 'AND' },
      { type: TokenType.BOOLEAN, symbol: 'FALSE' },
      { type: TokenType.EOF, symbol: '' }
    ])
  })

  it('should correctly tokenize an OR operation', () => {
    const lexer = new Lexer('TRUE OR FALSE')
    const tokens = getTokens(lexer)
    expect(tokens).toStrictEqual([
      { type: TokenType.BOOLEAN, symbol: 'TRUE' },
      { type: TokenType.OR, symbol: 'OR' },
      { type: TokenType.BOOLEAN, symbol: 'FALSE' },
      { type: TokenType.EOF, symbol: '' }
    ])
  })

  it('should correctly tokenize an EQUAL_TO operation', () => {
    const lexer = new Lexer('"string1" == "string2"')
    const tokens = getTokens(lexer)
    expect(tokens).toStrictEqual([
      { type: TokenType.STRING, symbol: 'string1' },
      { type: TokenType.EQUAL_TO, symbol: '==' },
      { type: TokenType.STRING, symbol: 'string2' },
      { type: TokenType.EOF, symbol: '' }
    ])
  })

  it('should correctly tokenize parentheses', () => {
    const lexer = new Lexer('TRUE OR (FALSE AND FALSE)')
    const tokens = getTokens(lexer)
    expect(tokens).toStrictEqual([
      { type: TokenType.BOOLEAN, symbol: 'TRUE' },
      { type: TokenType.OR, symbol: 'OR' },
      { type: TokenType.LEFT_PAREN, symbol: '(' },
      { type: TokenType.BOOLEAN, symbol: 'FALSE' },
      { type: TokenType.AND, symbol: 'AND' },
      { type: TokenType.BOOLEAN, symbol: 'FALSE' },
      { type: TokenType.RIGHT_PAREN, symbol: ')' },
      { type: TokenType.EOF, symbol: '' }
    ])
  })

  it('should correctly tokenize variables', () => {
    const lexer = new Lexer('TRUE OR ITEM')
    const tokens = getTokens(lexer)
    expect(tokens).toStrictEqual([
      { type: TokenType.BOOLEAN, symbol: 'TRUE' },
      { type: TokenType.OR, symbol: 'OR' },
      { type: TokenType.IDENT, symbol: 'ITEM' },
      { type: TokenType.EOF, symbol: '' }
    ])
  })
})
