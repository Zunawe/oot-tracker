const evaluate = require('./evaluate')
const parse = require('./parse')

const interpret = (rule, ctx) => {
  const ast = parse(rule)
  return evaluate(ast, ctx)
}

module.exports = {
  interpret
}
