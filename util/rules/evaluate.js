const AST = require('./AST')
const parse = require('./parse')

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
  } else if (expr instanceof AST.Call) {
    return evaluateCall(expr, mem)
  } else {
    throw new Error('Could not evaluate expression')
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
    return evaluate(lhs, mem) && evaluate(rhs, mem)
  } else if (op instanceof AST.Or) {
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
const evaluateVar = (expr, mem) => {
  if (expr.name in mem) {
    if (typeof mem[expr.name] === 'boolean') {
      // A variable storing a boolean
      return mem[expr.name]
    } else if (typeof mem[expr.name] === 'string') {
      // An alias for an expression to be evaluated
      // Parsing and evaluating here is probably a no-no
      // But this isn't supposed to be very sophisticated or secure
      return evaluate(parse(mem[expr.name]), mem)
    }
  } else {
    throw new Error(`Undefined variable: ${expr.name}`)
  }
}

/**
 * Get a variable from memory
 * @param {Call} expr An AST node to evaluate
 * @param {object} mem A map of names to values
 */
const evaluateCall = (expr, mem) => {
  const { func, arg } = expr
  if (func.name in mem) {
    const result = mem[func.name](arg.name)
    if (typeof result === 'boolean') {
      return result
    } else if (typeof result === 'string') {
      return evaluate(parse(result), mem)
    } else {
      throw new Error('Invalid function return type')
    }
  } else {
    throw new Error(`Undefined variable: ${expr.name}`)
  }
}

module.exports = evaluate
