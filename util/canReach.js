const { checkRule } = require('./rules')

const canReach = (from, to, regions, blacklist = {}, ctx) => {
  const unchecked = [from]
  const checked = []

  while (unchecked.length > 0) {
    const current = unchecked.shift()

    if (current === to) return true

    for (const [exit, rule] of Object.entries(regions[current].exits)) {
      if (checked.includes(exit)) continue
      if (blacklist[current] && blacklist[current].includes(exit)) continue
      if (checkRule(rule, ctx) === false) continue
      unchecked.push(exit)
    }
    checked.push(current)
  }

  return false
}

module.exports = canReach
