class Expr {
  get children () {
    throw new Error('Not implemented')
  }
}

class Call extends Expr {
  constructor (func, arg) {
    super()
    this.func = func
    this.arg = arg
  }
}

class Binary extends Expr {
  constructor (op, lhs, rhs) {
    super()
    this.op = op
    this.lhs = lhs
    this.rhs = rhs
  }
}

class B extends Expr {
  constructor (b) {
    super()
    this.value = b
  }
}

class Var extends Expr {
  constructor (n) {
    super()
    this.name = n
  }
}

class Bop {}
class And extends Bop {}
class Or extends Bop {}

module.exports = {
  Expr,
  Call,
  Binary,
  B,
  Var,

  Bop,
  And,
  Or
}
