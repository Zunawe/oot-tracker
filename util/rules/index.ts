import { Expr } from './AST'
import evaluate, { Memory } from './evaluate'
import parse from './parse'

export const checkRule = (rule: string, ctx: Memory): boolean => {
  const ast: Expr = parse(rule)
  return evaluate(ast, ctx)
}
