import { Maybe, Just, Nothing, MaybeType } from '../Maybe'
import Lexer, { TokenType, Token } from './Lexer'
import {
  Expr,
  Binary,
  B,
  Var,

  And,
  Or
} from './AST'

/**
 * (
 *   {E, A, T, C, B, x, t, f},
 *   {t, f, x},
 *   E,
 *   {
 *     E -> A | A 'OR' E,
 *     A -> T | T 'AND' A,
 *     T -> B | C | x | '(' E ')'
 *     C -> x '/' x
 *     B -> t | f
 *   }
 * )
 */

/**
 * Create an AST from a string
 * @param {string} input The string to parse
 */
const parse = (input: string): Expr => {
  const lexer = new Lexer(input)

  /**
   * Try to parse either an AND binary operation or an OR binary operation
   */
  const parseExpression = (): Maybe<Expr> => {
    const lhs: Maybe<Expr> = parseAnd()
    if (lhs.type === MaybeType.Nothing) throw new Error('Failed to parse')
    const op: Maybe<Or> = parseOrOp()
    if (op.type === MaybeType.Nothing) return lhs
    const rhs: Maybe<Expr> = parseExpression()
    if (rhs.type === MaybeType.Nothing) throw new Error('Failed to parse')
    return Just(new Binary(op.value, lhs.value, rhs.value))
  }

  /**
   * Try to parse either a term or an AND binary operation
   */
  const parseAnd = (): Maybe<Expr> => {
    const lhs: Maybe<Expr> = parseTerm()
    if (lhs.type === MaybeType.Nothing) return Nothing()
    const op: Maybe<Or> = parseAndOp()
    if (op.type === MaybeType.Nothing) return lhs
    const rhs: Maybe<Expr> = parseAnd()
    if (rhs.type === MaybeType.Nothing) throw new Error('Failed to parse')
    return Just(new Binary(op.value, lhs.value, rhs.value))
  }

  /**
   * Try to parse either a boolean or parenthesized expression
   */
  const parseTerm = (): Maybe<Expr> => {
    const boolNode: Maybe<B> = parseBool()
    if (boolNode.type === MaybeType.Just) return boolNode

    // const call = parseCall()
    // if (call) return call

    const varNode: Maybe<Var> = parseVar()
    if (varNode.type === MaybeType.Just) return varNode

    if (!parseLeftParenthesis()) return Nothing()
    const expr: Maybe<Expr> = parseExpression()
    if (expr.type === MaybeType.Nothing) throw new Error('Could not parse term')
    if (!parseRightParenthesis()) throw new Error('Missing right parenthesis')
    return expr
  }

  /**
   * Try to parse a boolean literal. Return null if not possible.
   */
  const parseBool = (): Maybe<B> => {
    const token: Token = lexer.peek()

    if (token.type === TokenType.BOOLEAN) {
      lexer.consume()
      return Just(new B(token.symbol === 'true'))
    }

    return Nothing()
  }

  /**
   * Create a Var node if the token is an identifier. Return null otherwise.
   */
  const parseVar = (): Maybe<Var> => {
    if (lexer.peek().type === 'IDENT') {
      const token = lexer.consume()
      return Just(new Var(token.symbol))
    }
    return Nothing()
  }

  /**
   * Try to parse a function call
   */
  // const parseCall = () => {
  //   if (lexer.peek(2).type === '/') {
  //     const func = parseVar()
  //     if (func === null) throw new Error('Failed to parse')
  //     lexer.consume() // Consume the slash
  //     const arg = parseArg()
  //     if (arg === null) throw new Error('Failed to parse')
  //     return new AST.Call(func, arg)
  //   }
  // }

  /**
   * Create a Var node if the token is an argument. Return null otherwise.
   */
  // const parseArg = () => {
  //   if (lexer.peek().type === 'ARG') {
  //     const token = lexer.consume()
  //     return new AST.Var(token.symbol)
  //   }
  //   return null
  // }

  /**
   * Return true if the next token is a left parenthesis. Return false otherwise.
   */
  const parseLeftParenthesis = (): boolean => {
    if (lexer.peek().type === TokenType.LEFT_PAREN) {
      lexer.consume()
      return true
    }
    return false
  }

  /**
   * Return true if the next token is a right parenthesis. Return false otherwise.
   */
  const parseRightParenthesis = (): boolean => {
    if (lexer.peek().type === TokenType.RIGHT_PAREN) {
      lexer.consume()
      return true
    }
    return false
  }

  /**
   * Create an And node if the token is an AND operator. Return null otherwise.
   */
  const parseAndOp = (): Maybe<And> => {
    if (lexer.peek().type === TokenType.AND) {
      lexer.consume()
      return Just(new And())
    }
    return Nothing()
  }

  /**
   * Create an Or node if the token is an OR operator. Return null otherwise.
   */
  const parseOrOp = (): Maybe<Or> => {
    if (lexer.peek().type === TokenType.OR) {
      lexer.consume()
      return Just(new Or())
    }
    return Nothing()
  }

  const root: Maybe<Expr> = parseExpression()
  if (root.type === MaybeType.Nothing) throw new Error('Nothing to parse')
  return root.value
}

export default parse
