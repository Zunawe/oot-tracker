import {
  Expr,
  Binary,
  B,
  Var,

  Bop,
  And,
  Or
} from './AST'

export interface Memory {
  [key: string]: boolean
}

/**
 * Eval an expression
 * @param {Expr} expr An AST node to evaluate
 * @param {object} mem A map of names to values
 */
const evaluate = (expr: Expr, mem: Memory): boolean => {
  if (expr instanceof B) {
    return expr.value
  } else if (expr instanceof Var) {
    return evaluateVar(expr, mem)
  } else if (expr instanceof Binary) {
    return evaluateBinary(expr, mem)
  // } else if (expr instanceof Call) {
    // return evaluateCall(expr, mem)
  } else {
    throw new Error('Could not evaluate expression')
  }
}

/**
 * Evaluate a binary operation
 * @param {Binary} expr An AST node to evaluate
 * @param {object} mem A map of names to values
 */
const evaluateBinary = (expr: Binary, mem: Memory): boolean => {
  const op: Bop = expr.op
  const lhs: Expr = expr.lhs
  const rhs: Expr = expr.rhs

  if (op instanceof And) {
    return evaluate(lhs, mem) && evaluate(rhs, mem)
  } else if (op instanceof Or) {
    return evaluate(lhs, mem) || evaluate(rhs, mem)
  } else {
    throw new Error('Could not evaluate binary operation')
  }
}

/**
 * Get a variable from memory
 * @param {Var} expr An AST node to evaluate
 * @param {object} mem A map of names to values
 */
const evaluateVar = (expr: Var, mem: Memory): boolean => {
  if (expr.name in mem) {
    return mem[expr.name]
  } else {
    throw new Error(`Undefined variable: ${expr.name}`)
  }
}

/**
 * Get a variable from memory
 * @param {Call} expr An AST node to evaluate
 * @param {object} mem A map of names to values
 */
// const evaluateCall = (expr, mem) => {
//   const { func, arg } = expr
//   if (func.name in mem) {
//     const result = mem[func.name](arg.name)
//     return evaluate(parse(result), mem)
//   } else {
//     throw new Error(`Undefined variable: ${expr.name}`)
//   }
// }

export default evaluate
