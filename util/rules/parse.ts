import { Option, some, none } from 'fp-ts/Option'
import { match } from 'pattern-matching-ts/match'
import { pipe } from 'fp-ts/lib/function'

import Lexer, { TokenType, Token } from './Lexer'
import {
  Expr,
  Call,
  Binary,
  B,
  Var,

  And,
  Or
} from './AST'

/**
 * (
 *   {expression, term, factor, bool, functioncall, arguments, identifier, empty},
 *   {bool, identifier, empty},
 *   expression,
 *   {
 *     expression ::= term | term 'OR' expression
 *     term ::= factor | factor 'AND' term
 *     factor ::= bool | functioncall | identifier | '(' expression ')'
 *     functioncall ::= identifier '(' arguments ')'
 *     arguments ::= empty | expression | expression ',' arguments

 *     bool ::= 'TRUE' | 'FALSE'
 *     identifier ::= [a-zA-Z_][a-zA-Z0-9_]*
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
    parseTerm(),
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
  const parseTerm = (): Option<Expr> => pipe(
    parseFactor(),
    match({
      None: () => none,
      Some: (lhs) => pipe(
        parseAndOp(),
        match({
          None: () => lhs,
          Some: (op) => pipe(
            parseTerm(),
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
  const parseFactor = (): Option<Expr> => pipe(
    parseBool(),
    match({
      Some: (node) => node,
      None: () => pipe(
        parseCall(),
        match({
          Some: (e) => e,
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
    })
  )

  const parseCall = (): Option<Call> => {
    const func: Token = lexer.peek()
    if (func.type !== TokenType.IDENT) return none
    if (lexer.peek(2).type !== TokenType.LEFT_PAREN) return none
    lexer.consume(2)

    const args: Expr[] = []
    if (lexer.peek().type !== TokenType.RIGHT_PAREN) {
      pipe(
        parseExpression(),
        match({
          Some: ({ value }) => args.push(value)
        })
      )
    }
    while (lexer.peek().type === TokenType.COMMA) {
      lexer.consume()
      pipe(
        parseExpression(),
        match({
          Some: ({ value }) => args.push(value)
        })
      )
    }

    return some(new Call(new Var(func.symbol), args))
  }

  /**
   * Try to parse a boolean literal. Return null if not possible.
   */
  const parseBool = (): Option<B> => {
    const token: Token = lexer.peek()

    if (token.type === TokenType.BOOLEAN) {
      lexer.consume()
      return some(new B(token.symbol === 'TRUE'))
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
