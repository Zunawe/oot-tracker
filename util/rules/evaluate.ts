import { Option, some, none } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { match, matchW } from 'pattern-matching-ts/match'

import {
  B,
  Binary,
  Call,
  Expr,
  Function,
  S,
  Var
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

export const toString = (e: Expr): string => {
  return matchW('_tag')({
    S: ({ s }) => s,
    _: () => { throw new Error(`Cannot interpret expression as string: ${e?.dump?.()}`) }
  })(e)
}

/**
 * Eval an expression
 * @param env The environment to evaluate the expression in context of
 * @param e The expression to evaluate
 * @returns The expression reduced as much as possible
 */
const evaluate = (env: Env, e: Expr): Expr => {
  return matchW('_tag')({
    B: () => e,
    S: () => e,
    Empty: () => e,
    Var: (e) => {
      const { name } = e as Var
      return lookup(env, name)
    },
    Binary: (e: Binary) => {
      const { op, lhs, rhs } = e
      const e1p = evaluate(env, lhs)
      const e2p = evaluate(env, rhs)

      return matchW('_tag')({
        And: () => new B(toBoolean(evaluate(env, lhs)) && toBoolean(evaluate(env, rhs))),
        Or: () => new B(toBoolean(evaluate(env, lhs)) || toBoolean(evaluate(env, rhs))),
        EqualTo: () => matchW('_tag')({
          B: (b1: B) => matchW('_tag')({
            B: (b2: B) => new B(toBoolean(b1) === toBoolean(b2)),
            _: () => { throw new Error('Cannot compare boolean and ' + rhs.dump()) }
          })(e2p),
          S: (s1: S) => matchW('_tag')({
            S: (s2: S) => new B(toString(s1) === toString(s2)),
            _: () => { throw new Error('Cannot compare string and ' + rhs.dump()) }
          })(e2p),
          _: () => { throw new Error(`Could not match expr to value: ${e.dump()}`) }
        })(e1p),
        _: () => { throw new Error(`Can't use operator [${op.dump()}]: ${e.dump()}`) }
      })(op)
    },
    Call: (e) => {
      const { func, args } = e as Call

      return pipe(
        evaluate(env, func),
        match<Expr, Expr>({
          Function: (e) => {
            const seqToArray = (seq: Expr): Expr[] => matchW('_tag')({
              Binary: (binary) => {
                const { op, lhs, rhs } = binary as Binary
                return matchW('_tag')({
                  Seq: () => [evaluate(env, lhs)].concat(seqToArray(rhs)),
                  _: () => [evaluate(env, seq)]
                })(op)
              },
              _: () => [evaluate(env, seq)]
            })(seq)
            const { body, params } = e as Function
            const evaluatedArgs: Expr[] = seqToArray(args)

            const ar: ActivationRecord = new ActivationRecord()
            params.forEach((param, i) => ar.bind(param.name, evaluatedArgs[i]))

            env.stack.push(ar)
            const result: Expr = evaluate(env, body)
            env.stack.pop()

            return result
          },
          _: (e) => { throw new Error(`Cannot call value [${e.dump()}]`) }
        })
      )
    },
    _: () => { throw new Error(`Could not match expression: ${e.dump()}`) }
  })(e)
}

/**
 * Get a variable from memory. First checks the stack, then checks global memory.
 * @param env The environment to  lookup the symbol in
 * @param {string} symbol The symbol to look up
 * @returns The expression bound to the provided symbol.
 */
const lookup = (env: Env, symbol: string): Expr => {
  const value: Option<Expr> = match<Option<ActivationRecord>, Option<Expr>>({
    Some: ({ value }) => value.get(symbol),
    None: () => none
  })(env.stack.peek())

  return match<Option<Expr>, Expr>({
    Some: ({ value }) => value,
    None: () => {
      if (symbol in env.mem) {
        return env.mem[symbol]
      }
      throw new Error(`Undefined variable: ${symbol}`)
    }
  })(value)
}

export default evaluate
