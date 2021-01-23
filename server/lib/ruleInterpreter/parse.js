const Lexer = require('./Lexer')
const AST = require('./AST')

const parse = (input) => {
  const parseExpression = () => {
    const lhs = parseAnd()
    if (lhs === null) throw new Error('Failed to parse')
    const op = parseOrOp()
    if (op === null) return lhs
    const rhs = parseExpression()
    if (rhs === null) throw new Error('Failed to parse')
    return new AST.Binary(op, lhs, rhs)
  }

  const parseAnd = () => {
    const lhs = parseTerm()
    if (lhs === null) return null
    const op = parseAndOp()
    if (op === null) return lhs
    const rhs = parseAnd()
    if (rhs === null) throw new Error('Failed to parse')
    return new AST.Binary(op, lhs, rhs)
  }

  const parseTerm = () => {
    const boolNode = parseBool()
    if (boolNode) return boolNode

    if (!parseLeftParenthesis()) return null
    const expr = parseExpression()
    if (expr === null) throw new Error('Could not parse term')
    if (!parseRightParenthesis()) throw new Error('Missing right parenthesis')
    return expr
  }

  const parseBool = () => {
    let node

    node = parseTrue()
    if (node) return node
    node = parseFalse()
    if (node) return node

    return null
  }

  const parseLeftParenthesis = () => {
    if (lexer.peek().type === '(') {
      lexer.consume()
      return true
    }
    return false
  }

  const parseRightParenthesis = () => {
    if (lexer.peek().type === ')') {
      lexer.consume()
      return true
    }
    return false
  }

  const parseAndOp = () => {
    if (lexer.peek().type === 'AND') {
      lexer.consume()
      return new AST.And()
    }
    return null
  }

  const parseOrOp = () => {
    if (lexer.peek().type === 'OR') {
      lexer.consume()
      return new AST.Or()
    }
    return null
  }

  const parseTrue = () => {
    if (lexer.peek().type === 'TRUE_LITERAL') {
      lexer.consume()
      return new AST.B(true)
    }
    return null
  }

  const parseFalse = () => {
    if (lexer.peek().type === 'FALSE_LITERAL') {
      lexer.consume()
      return new AST.B(false)
    }
    return null
  }

  const lexer = new Lexer(input)
  return parseExpression()
}

module.exports = parse
