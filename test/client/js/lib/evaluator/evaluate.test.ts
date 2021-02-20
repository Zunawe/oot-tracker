import { Func, Var } from '../../../../../client/js/lib/evaluator/AST'
import evaluate, { toBoolean, toString } from '../../../../../client/js/lib/evaluator/evaluate'
import parse from '../../../../../client/js/lib/evaluator/parse'
import Env from '../../../../../client/js/lib/evaluator/Env'

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

    it('should evaluate a string literal', () => {
      expect(toString(evaluate(env, parse('"a string"')))).toBe('a string')
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

  describe('==', () => {
    it('should evaluate string equality', () => {
      expect(toBoolean(evaluate(env, parse('"test" == "test"')))).toBe(true)
      expect(toBoolean(evaluate(env, parse('"test" == "test2"')))).toBe(false)
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
      env.mem['returnFalse'] = new Func(parse('FALSE'), [])
      expect(toBoolean(evaluate(env, parse('returnFalse()')))).toBe(false)
    })

    it('should call a function with one parameter', () => {
      env.mem['identity'] = new Func(parse('param1'), [parse('param1') as Var])
      expect(toBoolean(evaluate(env, parse('identity(TRUE)')))).toBe(true)
      expect(toBoolean(evaluate(env, parse('identity(FALSE)')))).toBe(false)
    })

    it('should call a function with multiple parameters', () => {
      env.mem['orFunction'] = new Func(parse('param1 OR param2'), [parse('param1') as Var, parse('param2') as Var])
      expect(toBoolean(evaluate(env, parse('orFunction(TRUE, FALSE)')))).toBe(true)
      expect(toBoolean(evaluate(env, parse('orFunction(FALSE, FALSE)')))).toBe(false)
    })

    it('should call a function with complex arguments', () => {
      env.mem['identity'] = new Func(parse('param1'), [parse('param1') as Var])
      expect(toBoolean(evaluate(env, parse('identity(TRUE AND (FALSE OR TRUE))')))).toBe(true)
      expect(toBoolean(evaluate(env, parse('identity(TRUE AND (FALSE OR FALSE))')))).toBe(false)
    })

    it('should call a function that calls a function', () => {
      env.mem['f1'] = new Func(parse('f2(param1) AND param1'), [parse('param1') as Var])
      env.mem['f2'] = new Func(parse('param2 == TRUE'), [parse('param2') as Var])
      expect(toBoolean(evaluate(env, parse('f1(TRUE))')))).toBe(true)
      expect(toBoolean(evaluate(env, parse('f1(FALSE))')))).toBe(false)
    })
  })

  // eval was moved
  describe.skip('eval', () => {
    it('should eval a simple literal', () => {
      expect(toBoolean(evaluate(env, parse('eval("FALSE")')))).toBe(false)
    })

    it('should eval an operation', () => {
      expect(toBoolean(evaluate(env, parse('eval("FALSE OR TRUE")')))).toBe(true)
      expect(toBoolean(evaluate(env, parse('eval("FALSE AND TRUE")')))).toBe(false)
    })

    it('should eval under the current scope', () => {
      env.mem['VARIABLE'] = parse('FALSE')
      expect(toBoolean(evaluate(env, parse('eval("VARIABLE")')))).toBe(false)
      env.mem['VARIABLE'] = parse('TRUE')
      expect(toBoolean(evaluate(env, parse('eval("VARIABLE")')))).toBe(true)
    })
  })
})
