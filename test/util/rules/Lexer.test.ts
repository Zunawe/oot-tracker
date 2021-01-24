/* global describe, it, expect */
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
    const lexer = new Lexer('true')
    const tokens = getTokens(lexer)
    expect(tokens).toStrictEqual([
      { type: TokenType.BOOLEAN, symbol: 'true' },
      { type: TokenType.EOF, symbol: '' }
    ])
  })

  it('should create a token for a false literal', () => {
    const lexer = new Lexer('false')
    const tokens = getTokens(lexer)
    expect(tokens).toStrictEqual([
      { type: TokenType.BOOLEAN, symbol: 'false' },
      { type: TokenType.EOF, symbol: '' }
    ])
  })

  it('should correctly tokenize an AND operation', () => {
    const lexer = new Lexer('true AND false')
    const tokens = getTokens(lexer)
    expect(tokens).toStrictEqual([
      { type: TokenType.BOOLEAN, symbol: 'true' },
      { type: TokenType.AND, symbol: 'AND' },
      { type: TokenType.BOOLEAN, symbol: 'false' },
      { type: TokenType.EOF, symbol: '' }
    ])
  })

  it('should correctly tokenize an OR operation', () => {
    const lexer = new Lexer('true OR false')
    const tokens = getTokens(lexer)
    expect(tokens).toStrictEqual([
      { type: TokenType.BOOLEAN, symbol: 'true' },
      { type: TokenType.OR, symbol: 'OR' },
      { type: TokenType.BOOLEAN, symbol: 'false' },
      { type: TokenType.EOF, symbol: '' }
    ])
  })

  it('should correctly tokenize parentheses', () => {
    const lexer = new Lexer('true OR (false AND false)')
    const tokens = getTokens(lexer)
    expect(tokens).toStrictEqual([
      { type: TokenType.BOOLEAN, symbol: 'true' },
      { type: TokenType.OR, symbol: 'OR' },
      { type: TokenType.LEFT_PAREN, symbol: '(' },
      { type: TokenType.BOOLEAN, symbol: 'false' },
      { type: TokenType.AND, symbol: 'AND' },
      { type: TokenType.BOOLEAN, symbol: 'false' },
      { type: TokenType.RIGHT_PAREN, symbol: ')' },
      { type: TokenType.EOF, symbol: '' }
    ])
  })

  it('should correctly tokenize variables', () => {
    const lexer = new Lexer('true OR ITEM')
    const tokens = getTokens(lexer)
    expect(tokens).toStrictEqual([
      { type: TokenType.BOOLEAN, symbol: 'true' },
      { type: TokenType.OR, symbol: 'OR' },
      { type: TokenType.IDENT, symbol: 'ITEM' },
      { type: TokenType.EOF, symbol: '' }
    ])
  })

  // it('should correctly tokenize function calls', () => {
  //   const lexer = new Lexer('true OR _func/ITEM')
  //   const tokens = getTokens(lexer)
  //   expect(tokens).toStrictEqual([
  //     { type: TokenType.BOOLEAN, symbol: 'true' },
  //     { type: TokenType.OR, symbol: 'OR' },
  //     { type: TokenType.IDENT, symbol: '_func' },
  //     { type: TokenType.FORWARD_SLASH, symbol: '/' },
  //     { type: TokenType.ARG, symbol: 'ITEM' },
  //     { type: TokenType.EOF, symbol: '' }
  //   ])
  // })
})
