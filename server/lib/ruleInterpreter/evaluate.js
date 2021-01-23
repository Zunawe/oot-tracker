const AST = require('./AST')

/**
 * Eval an expression
 * @param {Expr} expr An AST node to evaluate
 * @param {object} mem A map of names to values
 */
const evaluate = (expr, mem) => {
  if (expr instanceof AST.B) {
    return expr.value
  } else if (expr instanceof AST.Var) {
    return evaluateVar(expr, mem)
  } else if (expr instanceof AST.Binary) {
    return evaluateBinary(expr, mem)
  }
}

/**
 * Evaluate a binary operation
 * @param {Binary} expr An AST node to evaluate
 * @param {object} mem A map of names to values
 */
const evaluateBinary = (expr, mem) => {
  const op = expr.op
  const lhs = expr.lhs
  const rhs = expr.rhs

  if (op instanceof AST.And) {
    return evaluate(lhs) && evaluate(rhs)
  } else if (op instanceof AST.Or) {
    return evaluate(lhs) || evaluate(rhs)
  } else {
    throw new Error('Could not evaluate expression')
  }
}

/**
 * Get a variable from memory
 * @param {Var} expr An AST node to evaluate
 * @param {object} mem A map of names to values
 */
const evaluateVar = (expr, mem) => {
  if (expr.name in mem) {
    return mem[expr.name]
  } else {
    throw new Error(`Undefined variable: ${expr.name}`)
  }
}

module.exports = evaluate
