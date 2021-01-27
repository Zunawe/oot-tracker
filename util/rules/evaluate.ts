import { Option, some, none } from 'fp-ts/lib/Option'
import { match, matchW } from 'pattern-matching-ts/match'

import {
  Expr,
  Call,
  Function,
  B,
  Binary,
  Var,
  Bop
} from './AST'

class ActivationRecord {
  members: {
    [key: string]: Expr
  }

  constructor () {
    this.members = {}
  }

  get (name: string): Option<Expr> {
    if (name in this.members) {
      return some(this.members[name])
    }
    return none
  }

  bind (name: string, value: Expr): void {
    this.members[name] = value
  }
}

class Stack {
  private readonly records: ActivationRecord[]

  constructor () {
    this.records = []
  }

  push (record: ActivationRecord): void {
    this.records.push(record)
  }

  pop (): ActivationRecord {
    const record: ActivationRecord | undefined = this.records.pop()

    if (record === undefined) throw new Error('Cannot pop record off empty stack')
    return record
  }

  peek (): Option<ActivationRecord> {
    return this.records.length > 0 ? some(this.records[this.records.length - 1]) : none
  }
}

export class Env {
  mem: {
    [key: string]: Expr
  }

  stack: Stack

  constructor () {
    this.mem = {}
    this.stack = new Stack()
  }
}

export const toBoolean = (e: Expr): boolean => {
  return matchW('_tag')({
    B: ({ b }) => b,
    _: () => { throw new Error(`Cannot interpret expression as boolean: ${e?.dump?.()}`) }
  })(e)
}

/**
 * Eval an expression
 * @param {Expr} expr An AST node to evaluate
 * @param {object} mem A map of names to values
 */
const evaluate = (env: Env, e: Expr): Expr => {
  return match<Expr, Expr>({
    B: () => e,
    Var: (e: Expr) => {
      const { name } = e as Var
      return lookup(env, name)
    },
    Binary: (e: Expr) => {
      const { op, lhs, rhs } = e as Binary
      return match<Bop, B>({
        And: () => new B(toBoolean(evaluate(env, lhs)) && toBoolean(evaluate(env, rhs))),
        Or: () => new B(toBoolean(evaluate(env, lhs)) || toBoolean(evaluate(env, rhs)))
      })(op)
    },
    Call: (e) => {
      const { func, args } = e as Call

      const ar: ActivationRecord = new ActivationRecord()
      const { body, params } = lookup(env, func.name) as Function
      params.forEach((param, i) => ar.bind(param.name, evaluate(env, args[i])))

      env.stack.push(ar)
      const result: Expr = evaluate(env, body)
      env.stack.pop()

      return result
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
const lookup = (env: Env, name: string): Expr => {
  const value: Option<Expr> = match<Option<ActivationRecord>, Option<Expr>>({
    Some: ({ value }) => value.get(name),
    None: () => none
  })(env.stack.peek())

  return match<Option<Expr>, Expr>({
    Some: ({ value }) => value,
    None: () => {
      if (name in env.mem) {
        return env.mem[name]
      }
      throw new Error(`Undefined variable: ${name}`)
    }
  })(value)
}

export default evaluate
