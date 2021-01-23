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

  get children () {
    return [this.lhs, this.rhs]
  }
}

class B extends Expr {
  constructor (b) {
    super()
    this.value = b
  }

  get children () {
    return null
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
