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
