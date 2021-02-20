import { Expr } from './AST'
import Env from './Env'
import evaluate, { toBoolean } from './evaluate'
import parse from './parse'

export const checkRule = (env: Env, rule: string): boolean => {
  const root: Expr = parse(rule)
  try {
    return toBoolean(evaluate(env, root))
  } catch (e) {
    throw new Error(`Error while evaluating this expression: ${root.dump()}\n${(e as Error).message}`)
  }
}
