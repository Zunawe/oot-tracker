export abstract class Node {
  abstract dump (): string
}
export abstract class Expr extends Node {
  readonly _tag: string = 'Expr'
}

export class Empty extends Expr {
  readonly _tag: string = 'Empty'

  dump (): string {
    return ''
  }
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
    return `"${this.s}"`
  }
}

export class Func extends Expr {
  readonly _tag: string = 'Func'
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

export class BuiltInFunc extends Expr {
  readonly _tag: string = 'BuiltInFunc'
  readonly f: (args: Expr[]) => Expr

  constructor (f: (args: Expr[]) => Expr) {
    super()
    this.f = f
  }

  dump (): string {
    return 'built-in function'
  }
}

export class Call extends Expr {
  readonly _tag: string = 'Call'
  readonly e1: Expr
  readonly e2: Expr

  constructor (e1: Expr, e2: Expr) {
    super()
    this.e1 = e1
    this.e2 = e2
  }

  dump (): string {
    return `${this.e1.dump()}(${this.e2.dump()})`
  }
}

export class Binary extends Expr {
  readonly _tag: string = 'Binary'
  readonly op: Bop
  readonly e1: Expr
  readonly e2: Expr

  constructor (op: Bop, e1: Expr, e2: Expr) {
    super()
    this.op = op
    this.e1 = e1
    this.e2 = e2
  }

  dump (): string {
    return this.op._tag === 'Seq'
      ? `${this.e1.dump()}${this.op.dump()} ${this.e2.dump()}`
      : `(${this.e1.dump()} ${this.op.dump()} ${this.e2.dump()})`
  }
}

export class Var extends Expr {
  readonly _tag: string = 'Var'
  readonly x: string

  constructor (x: string) {
    super()
    this.x = x
  }

  dump (): string {
    return this.x
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
export class EqualTo extends Bop {
  readonly _tag: string = 'EqualTo'
  dump (): string {
    return '=='
  }
}
export class Seq extends Bop {
  readonly _tag: string = 'Seq'
  dump (): string {
    return ','
  }
}
