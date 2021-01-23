/* global describe, it, expect */
import Lexer from '../../../util/rules/Lexer'

describe('evaluate', () => {
  it('should create a token for a true literal', () => {
    const lexer = new Lexer('true')
    expect(lexer._tokens).toStrictEqual([
      { type: 'TRUE_LITERAL', symbol: 'true' },
      { type: 'EOF', symbol: null }
    ])
  })

  it('should create a token for a false literal', () => {
    const lexer = new Lexer('false')
    expect(lexer._tokens).toStrictEqual([
      { type: 'FALSE_LITERAL', symbol: 'false' },
      { type: 'EOF', symbol: null }
    ])
  })

  it('should correctly tokenize an AND operation', () => {
    const lexer = new Lexer('true AND false')
    expect(lexer._tokens).toStrictEqual([
      { type: 'TRUE_LITERAL', symbol: 'true' },
      { type: 'AND', symbol: 'AND' },
      { type: 'FALSE_LITERAL', symbol: 'false' },
      { type: 'EOF', symbol: null }
    ])
  })

  it('should correctly tokenize an OR operation', () => {
    const lexer = new Lexer('true OR false')
    expect(lexer._tokens).toStrictEqual([
      { type: 'TRUE_LITERAL', symbol: 'true' },
      { type: 'OR', symbol: 'OR' },
      { type: 'FALSE_LITERAL', symbol: 'false' },
      { type: 'EOF', symbol: null }
    ])
  })

  it('should correctly tokenize parentheses', () => {
    const lexer = new Lexer('true OR (false AND false)')
    expect(lexer._tokens).toStrictEqual([
      { type: 'TRUE_LITERAL', symbol: 'true' },
      { type: 'OR', symbol: 'OR' },
      { type: '(', symbol: '(' },
      { type: 'FALSE_LITERAL', symbol: 'false' },
      { type: 'AND', symbol: 'AND' },
      { type: 'FALSE_LITERAL', symbol: 'false' },
      { type: ')', symbol: ')' },
      { type: 'EOF', symbol: null }
    ])
  })

  it('should correctly tokenize variables', () => {
    const lexer = new Lexer('true OR ITEM')
    expect(lexer._tokens).toStrictEqual([
      { type: 'TRUE_LITERAL', symbol: 'true' },
      { type: 'OR', symbol: 'OR' },
      { type: 'IDENT', symbol: 'ITEM' },
      { type: 'EOF', symbol: null }
    ])
  })

  it('should correctly tokenize function calls', () => {
    const lexer = new Lexer('true OR _func/ITEM')
    expect(lexer._tokens).toStrictEqual([
      { type: 'TRUE_LITERAL', symbol: 'true' },
      { type: 'OR', symbol: 'OR' },
      { type: 'IDENT', symbol: '_func' },
      { type: '/', symbol: '/' },
      { type: 'ARG', symbol: 'ITEM' },
      { type: 'EOF', symbol: null }
    ])
  })
})
