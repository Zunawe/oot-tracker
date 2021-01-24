/* global describe, beforeEach, it, expect */
import canReach from '../../util/canReach'

describe('canReach', () => {
  let regions, ctx

  beforeEach(() => {
    regions = {
      'Region 1': {
        exits: {
          'Region 2': 'true'
        }
      },
      'Region 2': {
        exits: {
          'Region 1': 'true',
          'Region 3': 'CONDITION_1'
        }
      },
      'Region 3': {
        exits: {
          'Region 2': 'CONDITION_1',
          'Region 4': 'true'
        }
      },
      'Region 4': {
        exits: {}
      }
    }

    ctx = {
      CONDITION_1: true
    }
  })

  it('should follow a single edge', () => {
    expect(canReach('Region 1', 'Region 2', regions, {}, ctx)).toBe(true)
  })

  it('should follow multiple edges with conditions', () => {
    expect(canReach('Region 1', 'Region 4', regions, {}, ctx)).toBe(true)
  })

  it('should fail to find a path if condition is false', () => {
    ctx.CONDITION_1 = false
    expect(canReach('Region 1', 'Region 3', regions, {}, ctx)).toBe(false)
  })

  it('should utilize blacklist while traversing edges', () => {
    const blacklist = {
      'Region 2': ['Region 3']
    }
    expect(canReach('Region 1', 'Region 4', regions, blacklist, ctx)).toBe(false)
  })
})
