/* global describe, it, expect */
import { Function, Var } from '../../../util/rules/AST'
import evaluate, { Env, toBoolean } from '../../../util/rules/evaluate'
import parse from '../../../util/rules/parse'

describe('evaluate', () => {
  let env: Env

  beforeEach(() => {
    env = new Env()
  })

  describe('literals', () => {
    it('should evaluate a true literal', () => {
      expect(toBoolean(evaluate(env, parse('TRUE')))).toBe(true)
    })

    it('should evaluate a false literal', () => {
      expect(toBoolean(evaluate(env, parse('FALSE')))).toBe(false)
    })
  })

  describe('AND', () => {
    it('should evaluate an AND truth table', () => {
      expect(toBoolean(evaluate(env, parse('FALSE AND FALSE')))).toBe(false)
      expect(toBoolean(evaluate(env, parse('TRUE AND FALSE')))).toBe(false)
      expect(toBoolean(evaluate(env, parse('FALSE AND TRUE')))).toBe(false)
      expect(toBoolean(evaluate(env, parse('TRUE AND TRUE')))).toBe(true)
    })

    it('should evaluate a sequence of ANDs', () => {
      expect(toBoolean(evaluate(env, parse('FALSE AND FALSE AND TRUE')))).toBe(false)
      expect(toBoolean(evaluate(env, parse('FALSE AND TRUE AND FALSE')))).toBe(false)
      expect(toBoolean(evaluate(env, parse('TRUE AND FALSE AND FALSE')))).toBe(false)
      expect(toBoolean(evaluate(env, parse('TRUE AND TRUE AND TRUE')))).toBe(true)
      expect(toBoolean(evaluate(env, parse('TRUE AND TRUE AND TRUE AND FALSE')))).toBe(false)
    })
  })

  describe('OR', () => {
    it('should evaluate an OR truth table', () => {
      expect(toBoolean(evaluate(env, parse('FALSE OR FALSE')))).toBe(false)
      expect(toBoolean(evaluate(env, parse('TRUE OR FALSE')))).toBe(true)
      expect(toBoolean(evaluate(env, parse('FALSE OR TRUE')))).toBe(true)
      expect(toBoolean(evaluate(env, parse('TRUE OR TRUE')))).toBe(true)
    })

    it('should evaluate a sequence of ORs', () => {
      expect(toBoolean(evaluate(env, parse('FALSE OR FALSE OR TRUE')))).toBe(true)
      expect(toBoolean(evaluate(env, parse('FALSE OR TRUE OR FALSE')))).toBe(true)
      expect(toBoolean(evaluate(env, parse('TRUE OR FALSE OR FALSE')))).toBe(true)
      expect(toBoolean(evaluate(env, parse('FALSE OR FALSE OR FALSE')))).toBe(false)
      expect(toBoolean(evaluate(env, parse('TRUE OR FALSE OR TRUE OR FALSE')))).toBe(true)
    })
  })

  describe('Association', () => {
    it('should prioritize AND operators', () => {
      expect(toBoolean(evaluate(env, parse('FALSE OR TRUE AND FALSE')))).toBe(false)
    })

    it('should use parentheses correctly', () => {
      expect(toBoolean(evaluate(env, parse('TRUE AND (FALSE OR TRUE)')))).toBe(true)
    })
  })

  describe('Variables', () => {
    it('should get a variable from provided memory', () => {
      env.mem['ITEM'] = parse('FALSE')
      expect(toBoolean(evaluate(env, parse('ITEM')))).toBe(false)
      env.mem['ITEM'] = parse('TRUE')
      expect(toBoolean(evaluate(env, parse('ITEM')))).toBe(true)
    })

    it('should throw an error for accessing an undefined variable', () => {
      expect(() => evaluate(env, parse('ITEM'))).toThrow()
    })
  })

  describe('Function Calls', () => {
    it('should call a simple function with no parameters', () => {
      env.mem['returnFalse'] = new Function(parse('FALSE'), [])
      expect(toBoolean(evaluate(env, parse('returnFalse()')))).toBe(false)
    })

    it('should call a function with one parameter', () => {
      env.mem['identity'] = new Function(parse('param1'), [<Var>parse('param1')])
      expect(toBoolean(evaluate(env, parse('identity(TRUE)')))).toBe(true)
      expect(toBoolean(evaluate(env, parse('identity(FALSE)')))).toBe(false)
    })

    it('should call a function with multiple parameters', () => {
      env.mem['orFunction'] = new Function(parse('param1 OR param2'), [<Var>parse('param1'), <Var>parse('param2')])
      expect(toBoolean(evaluate(env, parse('orFunction(TRUE, FALSE)')))).toBe(true)
      expect(toBoolean(evaluate(env, parse('orFunction(FALSE, FALSE)')))).toBe(false)
    })

    it('should call a function with complex arguments', () => {
      env.mem['identity'] = new Function(parse('param1'), [<Var>parse('param1')])
      expect(toBoolean(evaluate(env, parse('identity(TRUE AND (FALSE OR TRUE))')))).toBe(true)
      expect(toBoolean(evaluate(env, parse('identity(TRUE AND (FALSE OR FALSE))')))).toBe(false)
    })
  })
})
