import { Expr, BuiltInFunc, S } from './AST'
import { Option, some, none } from 'fp-ts/lib/Option'
import parse from './parse'
import evaluate from './evaluate'
import match from '../match'
import { pipe } from 'fp-ts/lib/pipeable'

export class ActivationRecord {
  members: {
    [key: string]: Expr
  }

  constructor () {
    this.members = {}
  }

  get (name: string): Option<Expr> {
    if (name in this.members) {
      return some(this.members[name])
    }
    return none
  }

  bind (name: string, value: Expr): void {
    this.members[name] = value
  }
}

export class Stack {
  private readonly records: ActivationRecord[]

  constructor () {
    this.records = []
  }

  push (record: ActivationRecord): void {
    this.records.push(record)
  }

  pop (): ActivationRecord {
    const record: ActivationRecord | undefined = this.records.pop()

    if (record === undefined) throw new Error('Cannot pop record off empty stack')
    return record
  }

  peek (): Option<ActivationRecord> {
    return this.records.length > 0 ? some(this.records[this.records.length - 1]) : none
  }
}

export default class Env {
  mem: {
    [key: string]: Expr
  }

  stack: Stack

  constructor () {
    this.mem = {
      eval: new BuiltInFunc((e: Expr[]): Expr => {
        if (e.length !== 1) throw new Error('Wrong number of arguments to eval')

        return pipe(
          e[0], match<Expr, Expr>({
            S: ({ s }: S) => evaluate(this, parse((e[0] as S).s)),
            _: () => { throw new Error('Cannot eval anything but a string') }
          })
        )
      })
    }
    this.stack = new Stack()
  }
}
