/* global describe, it, expect */
import evaluate from '../../../../server/lib/ruleInterpreter/evaluate'
import parse from '../../../../server/lib/ruleInterpreter/parse'

describe('evaluate', () => {
  describe('literals', () => {
    it('should evaluate a true literal', () => {
      expect(evaluate(parse('true'), {})).toBe(true)
    })

    it('should evaluate a false literal', () => {
      expect(evaluate(parse('false'), {})).toBe(false)
    })
  })

  describe('AND', () => {
    it('should evaluate an AND truth table', () => {
      expect(evaluate(parse('false AND false'), {})).toBe(false)
      expect(evaluate(parse('true AND false'), {})).toBe(false)
      expect(evaluate(parse('false AND true'), {})).toBe(false)
      expect(evaluate(parse('true AND true'), {})).toBe(true)
    })

    it('should evaluate a sequence of ANDs', () => {
      expect(evaluate(parse('false AND false AND true'), {})).toBe(false)
      expect(evaluate(parse('false AND true AND false'), {})).toBe(false)
      expect(evaluate(parse('true AND false AND false'), {})).toBe(false)
      expect(evaluate(parse('true AND true AND true'), {})).toBe(true)
      expect(evaluate(parse('true AND true AND true AND false'), {})).toBe(false)
    })
  })

  describe('OR', () => {
    it('should evaluate an OR truth table', () => {
      expect(evaluate(parse('false OR false'), {})).toBe(false)
      expect(evaluate(parse('true OR false'), {})).toBe(true)
      expect(evaluate(parse('false OR true'), {})).toBe(true)
      expect(evaluate(parse('true OR true'), {})).toBe(true)
    })

    it('should evaluate a sequence of ORs', () => {
      expect(evaluate(parse('false OR false OR true'), {})).toBe(true)
      expect(evaluate(parse('false OR true OR false'), {})).toBe(true)
      expect(evaluate(parse('true OR false OR false'), {})).toBe(true)
      expect(evaluate(parse('false OR false OR false'), {})).toBe(false)
      expect(evaluate(parse('true OR false OR true OR false'), {})).toBe(true)
    })
  })

  describe('Association', () => {
    it('should prioritize AND operators', () => {
      expect(evaluate(parse('false OR true AND false'), {})).toBe(false)
    })

    it('should use parentheses correctly', () => {
      expect(evaluate(parse('true AND (false OR true)'), {})).toBe(true)
    })
  })

  describe('Variables', () => {
    it('should get a variable from provided memory', () => {
      expect(evaluate(parse('ITEM'), { ITEM: false })).toBe(false)
    })

    it('should throw an error for accessing an undefined variable', () => {
      expect(() => evaluate(parse('ITEM'), {})).toThrow()
    })
  })

  describe('Function Calls', () => {
    it('should correctly call a function in memory', () => {
      const mem = {
        _func: (arg) => arg === 'TEST'
      }

      expect(evaluate(parse('_func/TEST'), mem)).toBe(true)
      expect(evaluate(parse('_func/TEST_BAD'), mem)).toBe(false)
    })

    it('should correctly call a function in context of other operations', () => {
      const mem = {
        _func: () => true,
        TEST: true
      }

      expect(evaluate(parse('_func/TEST AND true'), mem)).toBe(true)
      expect(evaluate(parse('_func/TEST AND false'), mem)).toBe(false)
      expect(evaluate(parse('(_func/TEST) AND TEST'), mem)).toBe(true)
    })
  })
})
