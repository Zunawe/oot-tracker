import { Option, Some, none } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'

import {
  B,
  Binary,
  Bop,
  BuiltInFunc,
  Call,
  Expr,
  Func,
  S,
  Var
} from './AST'
import Env, { ActivationRecord } from './Env'
import match from '../match'

export const toBoolean = (e: Expr): boolean => pipe(
  e, match<Expr, boolean>({
    B: ({ b }: B) => b,
    _: () => { throw new Error(`Cannot interpret expression as boolean: ${e.dump()}`) }
  })
)

export const toString = (e: Expr): string => pipe(
  e, match<Expr, string>({
    S: ({ s }: S) => s,
    _: () => { throw new Error(`Cannot interpret expression as string: ${e.dump()}`) }
  })
)

const seqToArray = (e: Expr): Expr[] => pipe(
  e, match<Expr, Expr[]>({
    Binary: ({ op, e1, e2 }: Binary) => pipe(
      op, match<Bop, Expr[]>({
        Seq: () => [e1].concat(seqToArray(e2)),
        _: () => [e]
      })
    ),
    _: () => [e]
  })
)

/**
 * Eval an expression
 * @param env The environment to evaluate the expression in context of
 * @param e The expression to evaluate
 * @returns The expression reduced as much as possible
 */
const evaluate = (env: Env, e: Expr): Expr => pipe(
  e, match<Expr, Expr>({
    B: () => e,
    S: () => e,
    Empty: () => e,
    Var: ({ x }: Var) => lookup(env, x),
    Binary: ({ op, e1, e2 }: Binary) => {
      const v1 = evaluate(env, e1)
      const v2 = evaluate(env, e2)

      return pipe(
        op, match<Bop, Expr>({
          And: () => new B(toBoolean(v1) && toBoolean(v2)),
          Or: () => new B(toBoolean(v1) || toBoolean(v2)),
          EqualTo: () => pipe(
            v1, match<Expr, B>({
              B: (b1: B) => pipe(
                v2, match<Expr, B>({
                  B: (b2: B) => new B(b1.b === b2.b),
                  _: () => { throw new Error('Cannot compare boolean and ' + v2.dump()) }
                })
              ),
              S: (s1: S) => pipe(
                v2, match<Expr, B>({
                  S: (s2: S) => new B(s1.s === s2.s),
                  _: () => { throw new Error('Cannot compare string and ' + v2.dump()) }
                })
              ),
              _: () => { throw new Error(`Could not match expr to value: ${e.dump()}`) }
            })
          ),
          _: () => { throw new Error(`Can't use operator [${op.dump()}]: ${e.dump()}`) }
        })
      )
    },
    Call: ({ e1, e2 }: Call) => {
      const argList = seqToArray(e2)
      return pipe(
        evaluate(env, e1), match<Expr, Expr>({
          Func: ({ body, params }: Func) => {
            const ar = new ActivationRecord()
            params.forEach((param, i) => ar.bind(param.x, evaluate(env, argList[i])))

            env.stack.push(ar)
            const result = evaluate(env, body)
            env.stack.pop()

            return result
          },
          BuiltInFunc: ({ f }: BuiltInFunc) => {
            return f(argList.map((arg) => evaluate(env, arg)))
          },
          _: () => { throw new Error(`Cannot call value [${e.dump()}]`) }
        })
      )
    },
    _: () => { throw new Error(`Could not match expression: ${e.dump()}`) }
  })
)

/**
 * Get a variable from memory. First checks the stack, then checks global memory.
 * @param env The environment to  lookup the symbol in
 * @param {string} symbol The symbol to look up
 * @returns The expression bound to the provided symbol.
 */
const lookup = (env: Env, symbol: string): Expr => pipe(
  env.stack.peek(), match<Option<ActivationRecord>, Option<Expr>>({
    Some: ({ value }: Some<ActivationRecord>) => value.get(symbol),
    None: () => none
  }),
  match<Option<Expr>, Expr>({
    Some: ({ value }: Some<Expr>) => value,
    None: () => {
      if (symbol in env.mem) {
        return env.mem[symbol]
      }
      throw new Error(`Undefined variable: ${symbol}`)
    }
  })
)

export default evaluate
