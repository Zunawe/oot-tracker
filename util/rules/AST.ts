export abstract class Node {
  abstract dump (): string
}
export abstract class Expr extends Node {
  readonly _tag: string = 'Expr'
}

// class Call extends Expr {
//   func: Var

//   constructor (func: Var, arg) {
//     super()
//     this.func = func
//     this.arg = arg
//   }
// }

export class Binary extends Expr {
  readonly _tag: string = 'Binary'
  op: Bop
  lhs: Expr
  rhs: Expr

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

export class B extends Expr {
  readonly _tag: string = 'B'
  value: boolean

  constructor (b: boolean) {
    super()
    this.value = b
  }

  dump (): string {
    return this.value.toString()
  }
}

export class Var extends Expr {
  readonly _tag: string = 'Var'
  name: string

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
