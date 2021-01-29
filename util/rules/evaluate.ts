import { Option, none } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'

import {
  B,
  Binary,
  BuiltInFunc,
  Call,
  Expr,
  Func,
  S,
  Var
} from './AST'
import Env, { ActivationRecord } from './Env'

export const toBoolean = (e: Expr): boolean => {
  switch (e._tag) {
    case 'B': return (e as B).b
    default: throw new Error(`Cannot interpret expression as boolean: ${e?.dump?.()}`)
  }
}

export const toString = (e: Expr): string => {
  switch (e._tag) {
    case 'S': return (e as S).s
    default: throw new Error(`Cannot interpret expression as string: ${e?.dump?.()}`)
  }
}

const seqToArray = (e: Expr): Expr[] => {
  let op, e1, e2

  switch (e._tag) {
    case 'Binary':
      op = (e as Binary).op
      e1 = (e as Binary).e1
      e2 = (e as Binary).e2
      switch (op._tag) {
        case 'Seq': return [e1].concat(seqToArray(e2))
        default: return [e]
      }
    default: return [e]
  }
}

/**
 * Eval an expression
 * @param env The environment to evaluate the expression in context of
 * @param e The expression to evaluate
 * @returns The expression reduced as much as possible
 */
const evaluate = (env: Env, e: Expr): Expr => {
  let x, op, e1: Expr, e2: Expr, v1: Expr, v2: Expr
  switch (e._tag) {
    case 'B':
    case 'S':
    case 'Empty':
      return e
    case 'Var':
      x = (e as Var).x
      return lookup(env, x)
    case 'Binary':
      op = (e as Binary).op
      e1 = (e as Binary).e1
      e2 = (e as Binary).e2
      v1 = evaluate(env, e1)
      v2 = evaluate(env, e2)

      switch (op._tag) {
        case 'And': return new B(toBoolean(v1) && toBoolean(v2))
        case 'Or': return new B(toBoolean(evaluate(env, e1)) || toBoolean(evaluate(env, e2)))
        case 'EqualTo':
          switch (v1._tag) {
            case 'B':
              switch (v2._tag) {
                case 'B': return new B(toBoolean(v1) === toBoolean(v2))
                default: throw new Error('Cannot compare boolean and ' + v2.dump())
              }
            case 'S':
              switch (v2._tag) {
                case 'S': return new B(toString(v1) === toString(v2))
                default: throw new Error('Cannot compare string and ' + v2.dump())
              }
            default: throw new Error(`Could not match expr to value: ${e.dump()}`)
          }
        default: throw new Error(`Can't use operator [${op.dump()}]: ${e.dump()}`)
      }
    case 'Call':
      e1 = (e as Call).e1
      e2 = (e as Call).e2

      return pipe(
        evaluate(env, e1),
        (func) => {
          let body, params, argList: Expr[], f

          let ar: ActivationRecord
          let result: Expr

          switch (func._tag) {
            case 'Func':
              body = (func as Func).body
              params = (func as Func).params
              argList = seqToArray(e2)

              ar = new ActivationRecord()
              params.forEach((param, i) => ar.bind(param.x, evaluate(env, argList[i])))

              env.stack.push(ar)
              result = evaluate(env, body)
              env.stack.pop()

              return result
            case 'BuiltInFunc':
              f = (func as BuiltInFunc).f
              argList = seqToArray(e2)

              return f(argList.map((arg) => evaluate(env, arg)))
            default: throw new Error(`Cannot call value [${e.dump()}]`)
          }
        }
      )
    default: throw new Error(`Could not match expression: ${e.dump()}`)
  }
}

/**
 * Get a variable from memory. First checks the stack, then checks global memory.
 * @param env The environment to  lookup the symbol in
 * @param {string} symbol The symbol to look up
 * @returns The expression bound to the provided symbol.
 */
const lookup = (env: Env, symbol: string): Expr => {
  let value: Option<Expr>
  const ar = env.stack.peek()
  switch (ar._tag) {
    case 'Some':
      value = ar.value.get(symbol)
      break
    case 'None':
      value = none
  }

  switch (value._tag) {
    case 'Some': return value.value
    case 'None':
      if (symbol in env.mem) {
        return env.mem[symbol]
      }
      throw new Error(`Undefined variable: ${symbol}`)
  }
}

export default evaluate
