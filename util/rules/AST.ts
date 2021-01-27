export abstract class Node {
  abstract dump (): string
}
export abstract class Expr extends Node {
  readonly _tag: string = 'Expr'
}

export class B extends Expr {
  readonly _tag: string = 'B'
  readonly b: boolean

  constructor (b: boolean) {
    super()
    this.b = b
  }

  dump (): string {
    return this.b.toString().toUpperCase()
  }
}

export class S extends Expr {
  readonly _tag: string = 'S'
  readonly s: string

  constructor (s: string) {
    super()
    this.s = s
  }

  dump (): string {
    return `'${this.s}'`
  }
}

export class Function extends Expr {
  readonly _tag: string = 'Function'
  readonly body: Expr
  readonly params: Var[]

  constructor (body: Expr, params: Var[]) {
    super()
    this.body = body
    this.params = params
  }

  dump (): string {
    const paramsString: string = this.params.reduce((acc, param, i, arr) => {
      return acc + param.dump() + (i < arr.length - 1 ? ', ' : '')
    }, '')
    return `(${paramsString}) { ${this.body.dump()} }`
  }
}

export class Call extends Expr {
  readonly _tag: string = 'Call'
  readonly func: Var
  readonly args: Expr[]

  constructor (func: Var, args: Expr[]) {
    super()
    this.func = func
    this.args = args
  }

  dump (): string {
    const argsString: string = this.args.reduce((acc, arg, i, arr) => {
      return acc + arg.dump() + (i < arr.length - 1 ? ', ' : '')
    }, '')
    return `${this.func.name}(${argsString})`
  }
}

export class Binary extends Expr {
  readonly _tag: string = 'Binary'
  readonly op: Bop
  readonly lhs: Expr
  readonly rhs: Expr

  constructor (op: Bop, lhs: Expr, rhs: Expr) {
    super()
    this.op = op
    this.lhs = lhs
    this.rhs = rhs
  }

  dump (): string {
    return `(${this.lhs.dump()} ${this.op.dump()} ${this.rhs.dump()})`
  }
}

export class Var extends Expr {
  readonly _tag: string = 'Var'
  readonly name: string

  constructor (name: string) {
    super()
    this.name = name
  }

  dump (): string {
    return this.name
  }
}

export abstract class Bop extends Node {
  readonly _tag: string = 'Bop'
}
export class And extends Bop {
  readonly _tag: string = 'And'
  dump (): string {
    return 'AND'
  }
}
export class Or extends Bop {
  readonly _tag: string = 'Or'
  dump (): string {
    return 'OR'
  }
}
