export abstract class Node {
  abstract dump (): string
}
export abstract class Expr extends Node {}

// class Call extends Expr {
//   func: Var

//   constructor (func: Var, arg) {
//     super()
//     this.func = func
//     this.arg = arg
//   }
// }

export class Binary extends Expr {
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
  name: string

  constructor (name: string) {
    super()
    this.name = name
  }

  dump (): string {
    return this.name
  }
}

export abstract class Bop extends Node {}
export class And extends Bop {
  dump (): string {
    return 'AND'
  }
}
export class Or extends Bop {
  dump (): string {
    return 'OR'
  }
}
