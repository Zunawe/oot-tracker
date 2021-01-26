import { match } from 'pattern-matching-ts/match'

import {
  Expr,
  Bop
} from './AST'

export interface Env {
  [key: string]: boolean
}

/**
 * Eval an expression
 * @param {Expr} expr An AST node to evaluate
 * @param {object} mem A map of names to values
 */
const evaluate = (env: Env, e: Expr): boolean => {
  return match<Expr, boolean>({
    B: ({ value }: any) => value,
    Var: ({ name }: any) => lookup(env, name),
    Binary: ({ op, lhs, rhs }: any) => {
      return match<Bop, boolean>({
        And: () => evaluate(env, lhs) && evaluate(env, rhs),
        Or: () => evaluate(env, lhs) || evaluate(env, rhs)
      })(op)
    },
    _: () => {
      console.log(e)
      throw new Error(`Could not match expression: ${e.dump()}`)
    }
  })(e)
}

/**
 * Get a variable from memory
 * @param {Var} expr An AST node to evaluate
 * @param {object} mem A map of names to values
 */
const lookup = (env: Env, name: string): boolean => {
  if (name in env) {
    return env[name]
  } else {
    throw new Error(`Undefined variable: ${name}`)
  }
}

export default evaluate
