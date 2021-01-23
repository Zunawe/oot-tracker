/* global describe, it, expect */
import evaluate from '../../../../server/lib/ruleInterpreter/evaluate'
import parse from '../../../../server/lib/ruleInterpreter/parse'

describe('evaluate', () => {
  it('should evaluate a true literal', () => {
    expect(evaluate(parse('true'), {})).toBe(true)
  })

  it('should evaluate a false literal', () => {
    expect(evaluate(parse('false'), {})).toBe(false)
  })

  it('should evaluate an AND truth table', () => {
    expect(evaluate(parse('false AND false'), {})).toBe(false)
    expect(evaluate(parse('true AND false'), {})).toBe(false)
    expect(evaluate(parse('false AND true'), {})).toBe(false)
    expect(evaluate(parse('true AND true'), {})).toBe(true)
  })

  it('should evaluate an OR truth table', () => {
    expect(evaluate(parse('false OR false'), {})).toBe(false)
    expect(evaluate(parse('true OR false'), {})).toBe(true)
    expect(evaluate(parse('false OR true'), {})).toBe(true)
    expect(evaluate(parse('true OR true'), {})).toBe(true)
  })

  it('should evaluate a sequence of ANDs', () => {
    expect(evaluate(parse('false AND false AND true'), {})).toBe(false)
    expect(evaluate(parse('false AND true AND false'), {})).toBe(false)
    expect(evaluate(parse('true AND false AND false'), {})).toBe(false)
    expect(evaluate(parse('true AND true AND true'), {})).toBe(true)
    expect(evaluate(parse('true AND true AND true AND false'), {})).toBe(false)
  })

  it('should evaluate a sequence of ORs', () => {
    expect(evaluate(parse('false OR false OR true'), {})).toBe(true)
    expect(evaluate(parse('false OR true OR false'), {})).toBe(true)
    expect(evaluate(parse('true OR false OR false'), {})).toBe(true)
    expect(evaluate(parse('false OR false OR false'), {})).toBe(false)
    expect(evaluate(parse('true OR false OR true OR false'), {})).toBe(true)
  })

  it('should prioritize AND operators', () => {
    expect(evaluate(parse('false OR true AND false'), {})).toBe(false)
  })
})
