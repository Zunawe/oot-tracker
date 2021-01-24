const evaluate = require('./evaluate')
const parse = require('./parse')

const checkRule = (rule, ctx) => {
  const ast = parse(rule)
  return evaluate(ast, ctx)
}

module.exports = {
  checkRule
}
