const Lexer = require('./Lexer')
const AST = require('./AST')

/**
 * (
 *   {E, A, T, B, x, t, f},
 *   {t, f, x},
 *   E,
 *   {
 *     E -> A | A 'OR' E,
 *     A -> T | T 'AND' A,
 *     T -> B | x | '(' E ')'
 *     B -> t | f
 *     t -> 'true'
 *     f -> 'false'
 *   }
 * )
 */

/**
 * Create an AST from a string
 * @param {string} input The string to parse
 */
const parse = (input) => {
  const lexer = new Lexer(input)

  /**
   * Try to parse either an AND binary operation or an OR binary operation
   */
  const parseExpression = () => {
    const lhs = parseAnd()
    if (lhs === null) throw new Error('Failed to parse')
    const op = parseOrOp()
    if (op === null) return lhs
    const rhs = parseExpression()
    if (rhs === null) throw new Error('Failed to parse')
    return new AST.Binary(op, lhs, rhs)
  }

  /**
   * Try to parse either a term or an AND binary operation
   */
  const parseAnd = () => {
    const lhs = parseTerm()
    if (lhs === null) return null
    const op = parseAndOp()
    if (op === null) return lhs
    const rhs = parseAnd()
    if (rhs === null) throw new Error('Failed to parse')
    return new AST.Binary(op, lhs, rhs)
  }

  /**
   * Try to parse either a boolean or parenthesized expression
   */
  const parseTerm = () => {
    const boolNode = parseBool()
    if (boolNode) return boolNode

    const varNode = parseVar()
    if (varNode) return varNode

    if (!parseLeftParenthesis()) return null
    const expr = parseExpression()
    if (expr === null) throw new Error('Could not parse term')
    if (!parseRightParenthesis()) throw new Error('Missing right parenthesis')
    return expr
  }

  /**
   * Try to parse a boolean literal. Return null if not possible.
   */
  const parseBool = () => {
    let node

    node = parseTrue()
    if (node) return node
    node = parseFalse()
    if (node) return node

    return null
  }

  /**
   * Create a Var node if the token is an identifier. Return null otherwise.
   */
  const parseVar = () => {
    if (lexer.peek().type === 'IDENT') {
      const token = lexer.consume()
      return new AST.Var(token.symbol)
    }
    return null
  }

  /**
   * Return true if the next token is a left parenthesis. Return false otherwise.
   */
  const parseLeftParenthesis = () => {
    if (lexer.peek().type === '(') {
      lexer.consume()
      return true
    }
    return false
  }

  /**
   * Return true if the next token is a right parenthesis. Return false otherwise.
   */
  const parseRightParenthesis = () => {
    if (lexer.peek().type === ')') {
      lexer.consume()
      return true
    }
    return false
  }

  /**
   * Create an And node if the token is an AND operator. Return null otherwise.
   */
  const parseAndOp = () => {
    if (lexer.peek().type === 'AND') {
      lexer.consume()
      return new AST.And()
    }
    return null
  }

  /**
   * Create an Or node if the token is an OR operator. Return null otherwise.
   */
  const parseOrOp = () => {
    if (lexer.peek().type === 'OR') {
      lexer.consume()
      return new AST.Or()
    }
    return null
  }

  /**
   * Create a B node if the token is a true literal. Return null otherwise.
   */
  const parseTrue = () => {
    if (lexer.peek().type === 'TRUE_LITERAL') {
      lexer.consume()
      return new AST.B(true)
    }
    return null
  }

  /**
   * Create a B node if the token is a false literal. Return null otherwise.
   */
  const parseFalse = () => {
    if (lexer.peek().type === 'FALSE_LITERAL') {
      lexer.consume()
      return new AST.B(false)
    }
    return null
  }

  return parseExpression()
}

module.exports = parse
