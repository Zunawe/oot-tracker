class Reader {
  constructor (input) {
    this._input = input
    this._i = -1
  }

  peek (k) {
    k = k === undefined ? 1 : k
    return this._input.charAt(this._i + k)
  }

  consume (k) {
    this._i += k === undefined ? 1 : k
    return this._input.charAt(this._i)
  }

  isEOF (k) {
    k = k === undefined ? 1 : k
    return this._i + k >= this._input.length
  }
}

module.exports = Reader
