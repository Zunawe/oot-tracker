import { checkRule } from './rules'
import { Memory } from './rules/evaluate'

export interface Region {
  exits: { [key: string]: string }
}

const canReach = (from: string, to: string, regions: { [key: string]: Region }, blacklist: { [key: string]: string[] }, ctx: Memory): boolean => {
  const unchecked: string[] = [from]
  const checked: string[] = []

  while (unchecked.length > 0) {
    const current: string = unchecked.shift() as string

    if (current === to) return true

    for (const [exit, rule] of Object.entries(regions[current].exits)) {
      if (checked.includes(exit)) continue
      if (blacklist?.[current]?.includes(exit)) continue
      if (!checkRule(rule, ctx)) continue
      unchecked.push(exit)
    }
    checked.push(current)
  }

  return false
}

export default canReach
