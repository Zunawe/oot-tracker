import { Option, some, none } from 'fp-ts/Option'
import { match } from 'pattern-matching-ts/match'
import { pipe } from 'fp-ts/lib/function'

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
  const parseExpression = (): Option<Expr> => pipe(
    parseAnd(),
    match({
      None: () => none,
      Some: (lhs) => pipe(
        parseOrOp(),
        match({
          None: () => lhs,
          Some: (op) => pipe(
            parseExpression(),
            match({
              None: () => { throw new Error('Failed to parse') },
              Some: (rhs) => some(new Binary(op.value, lhs.value, rhs.value))
            })
          )
        })
      )
    })
  )

  /**
   * Try to parse either a term or an AND binary operation
   */
  const parseAnd = (): Option<Expr> => pipe(
    parseTerm(),
    match({
      None: () => none,
      Some: (lhs) => pipe(
        parseAndOp(),
        match({
          None: () => lhs,
          Some: (op) => pipe(
            parseAnd(),
            match({
              None: () => { throw new Error('Could not parse') },
              Some: (rhs) => some(new Binary(op.value, lhs.value, rhs.value))
            })
          )
        })
      )
    })
  )

  /**
   * Try to parse either a boolean or parenthesized expression
   */
  const parseTerm = (): Option<Expr> => pipe(
    parseBool(),
    match({
      Some: (node) => node,
      None: () => pipe(
        parseVar(),
        match({
          Some: (node) => node,
          None: () => pipe(
            parseLeftParenthesis(),
            match({
              Some: () => pipe(
                parseExpression(),
                match({
                  Some: (e) => pipe(
                    parseRightParenthesis(),
                    match({
                      Some: () => e,
                      None: () => { throw new Error('Missing right parenthesis') }
                    })
                  ),
                  None: () => { throw new Error('Could not parse') }
                })
              ),
              None: () => none
            })
          )
        })
      )
    })
  )

  // const call = parseCall()
  // if (call) return call

  //   const varNode: Option<Var> = parseVar()
  //   if (varNode.type === MaybeType.Just) return varNode

  //   if (!parseLeftParenthesis()) return Nothing()
  //   const expr: Maybe<Expr> = parseExpression()
  //   if (expr.type === MaybeType.Nothing) throw new Error('Could not parse term')
  //   if (!parseRightParenthesis()) throw new Error('Missing right parenthesis')
  //   return expr
  // }

  /**
   * Try to parse a boolean literal. Return null if not possible.
   */
  const parseBool = (): Option<B> => {
    const token: Token = lexer.peek()

    if (token.type === TokenType.BOOLEAN) {
      lexer.consume()
      return some(new B(token.symbol === 'true'))
    }

    return none
  }

  /**
   * Create a Var node if the token is an identifier. Return null otherwise.
   */
  const parseVar = (): Option<Var> => {
    if (lexer.peek().type === 'IDENT') {
      const token = lexer.consume()
      return some(new Var(token.symbol))
    }
    return none
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
  const parseLeftParenthesis = (): Option<true> => {
    if (lexer.peek().type === TokenType.LEFT_PAREN) {
      lexer.consume()
      return some(true)
    }
    return none
  }

  /**
   * Return true if the next token is a right parenthesis. Return false otherwise.
   */
  const parseRightParenthesis = (): Option<true> => {
    if (lexer.peek().type === TokenType.RIGHT_PAREN) {
      lexer.consume()
      return some(true)
    }
    return none
  }

  /**
   * Create an And node if the token is an AND operator. Return null otherwise.
   */
  const parseAndOp = (): Option<And> => {
    if (lexer.peek().type === TokenType.AND) {
      lexer.consume()
      return some(new And())
    }
    return none
  }

  /**
   * Create an Or node if the token is an OR operator. Return null otherwise.
   */
  const parseOrOp = (): Option<Or> => {
    if (lexer.peek().type === TokenType.OR) {
      lexer.consume()
      return some(new Or())
    }
    return none
  }

  return pipe(
    parseExpression(),
    match({
      Some: (e) => e.value,
      None: () => { throw new Error('Nothing to parse') }
    })
  )
}

export default parse
