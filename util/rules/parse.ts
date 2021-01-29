import { Option, some, none } from 'fp-ts/Option'
import { match } from 'pattern-matching-ts/match'
import { pipe } from 'fp-ts/lib/function'

import Lexer, { TokenType } from './Lexer'
import {
  And,
  B,
  Binary,
  Call,
  Empty,
  EqualTo,
  Expr,
  Or,
  S,
  Seq,
  Var
} from './AST'

/**
 * letter = "a" | "b" | "c" | "d" | "e" | "f" |
 *          "g" | "h" | "i" | "j" | "k" | "l" |
 *          "m" | "n" | "o" | "p" | "q" | "r" |
 *          "s" | "t" | "u" | "v" | "w" | "x" |
 *          "y" | "z" | "A" | "B" | "C" | "D" |
 *          "E" | "F" | "G" | "H" | "I" | "J" |
 *          "K" | "L" | "M" | "N" | "O" | "P" |
 *          "Q" | "R" | "S" | "T" | "U" | "V" |
 *          "W" | "X" | "Y" | "Z";
 * digit = "0" | "1" | "2" | "3" | "4" |
 *         "5" | "6" | "7" | "8" | "9";
 *
 * expr = seq;
 * seq = binary {, binary};
 * binary = unary {bop unary};
 * unary = unary | call;
 * call = term ["(" expr ")"];
 * term = x | b | s | empty | "(" expr ")";
 *
 * bop = "AND" | "OR" | "==";
 * x = (letter | digit) {letter | digit | "_"}
 * b = "TRUE" | "FALSE"
 * s = '"' {?all_characters? - '"'} '"'
 * empty = "";
 */

/**
 * Parses a string into an abstract syntax tree
 * @param input The string to parse
 * @returns The root of the parsed tree
 */
const parse = (input: string): Expr => {
  const lexer: Lexer = new Lexer(input)
  return parseExpr(lexer)
}

const parseExpr = (lexer: Lexer): Expr => pipe(
  parseSeq(lexer),
  match({
    Some: ({ value }) => value,
    None: () => new Empty()
  })
)

const parseSeq = (lexer: Lexer): Option<Expr> => pipe(
  parseBinary(lexer, 0),
  match({
    Some: (oLHS) => {
      if (lexer.peek().type === TokenType.COMMA) {
        lexer.consume()
        return pipe(
          parseBinary(lexer, 0),
          match({
            Some: (oRHS) => some(new Binary(new Seq(), oLHS.value, oRHS.value)),
            None: () => { throw new Error('Expected expression after ","') }
          })
        )
      }
      return oLHS
    }
  })
)

const binaryOperatorMap = [
  {
    [TokenType.EQUAL_TO]: EqualTo
  },
  {
    [TokenType.OR]: Or
  },
  {
    [TokenType.AND]: And
  }
]
const parseBinary = (lexer: Lexer, level: number): Option<Expr> => {
  if (level >= binaryOperatorMap.length) {
    return parseUnary(lexer)
  }

  return pipe(
    parseBinary(lexer, level + 1),
    match({
      Some: (oLHS) => pipe(
        parseBinaryOperator(lexer, level),
        match({
          Some: (oBop) => pipe(
            parseBinary(lexer, level),
            match({
              Some: (oRHS) => some(new Binary(oBop.value, oLHS.value, oRHS.value)),
              None: () => { throw new Error('Expected right hand side of binary operation') }
            })
          ),
          None: () => oLHS
        })
      ),
      None: () => none
    })
  )
}

const parseUnary = (lexer: Lexer): Option<Expr> => pipe(
  parseCall(lexer)
)

const parseCall = (lexer: Lexer): Option<Expr> => pipe(
  parseTerm(lexer),
  match({
    Some: (oTerm) => {
      const term = oTerm.value
      if (lexer.peek().type === TokenType.LEFT_PAREN) {
        lexer.consume()
        const args: Expr = parseExpr(lexer)
        if (lexer.peek().type === TokenType.RIGHT_PAREN) {
          lexer.consume()
          return some(new Call(term, args))
        }
        throw new Error('Missing right parenthesis')
      }

      return oTerm
    },
    None: () => { throw new Error('Should be unreachable') }
  })
)

const parseTerm = (lexer: Lexer): Option<Expr> => pipe(
  parseVar(lexer),
  match<Option<Expr>, Option<Expr>>({
    Some: (e) => e,
    None: () => parseBool(lexer)
  }),
  match<Option<Expr>, Option<Expr>>({
    Some: (e) => e,
    None: () => parseString(lexer)
  }),
  match<Option<Expr>, Option<Expr>>({
    Some: (e) => e,
    None: () => {
      if (lexer.peek().type === TokenType.LEFT_PAREN) {
        lexer.consume()
        const e: Expr = parseExpr(lexer)
        if (lexer.peek().type === TokenType.RIGHT_PAREN) {
          lexer.consume()
          return some(e)
        }

        throw new Error('Missing right parenthesis')
      }
      return some(new Empty())
    }
  })
)

const parseVar = (lexer: Lexer): Option<Expr> => {
  if (lexer.peek().type === TokenType.IDENT) {
    return some(new Var(lexer.consume().symbol))
  }
  return none
}

const parseBool = (lexer: Lexer): Option<Expr> => {
  if (lexer.peek().type === TokenType.BOOLEAN) {
    return some(new B(lexer.consume().symbol === 'TRUE'))
  }
  return none
}

const parseString = (lexer: Lexer): Option<Expr> => {
  if (lexer.peek().type === TokenType.STRING) {
    return some(new S(lexer.consume().symbol))
  }
  return none
}

const parseBinaryOperator = (lexer: Lexer, level: number): Option<Expr> => {
  const operators: any = binaryOperatorMap[level]
  if (lexer.peek().type in operators) {
    return some(new operators[lexer.consume().type]())
  }
  return none
}

export default parse
