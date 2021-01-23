class Expr {
  get children () {
    throw new Error('Not implemented')
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

class Bop {}
class And extends Bop {}
class Or extends Bop {}

module.exports = {
  Expr,
  Binary,
  B,

  Bop,
  And,
  Or
}
