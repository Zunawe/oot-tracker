const AST = require('./AST')

const evaluate = (expr, mem) => {
  if (expr instanceof AST.B) {
    return expr.value
  } else if (expr instanceof AST.Binary) {
    return evaluateBinary(expr, mem)
  }
}

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

module.exports = evaluate
