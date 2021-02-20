import fs from 'fs'
import Env from './rules/Env'
import { pipe } from 'fp-ts/lib/pipeable'
import evaluate from './rules/evaluate'
import match from './match'
import helpers from '../config/helpers'
import parse from './rules/parse'
import { Expr, Func, Var, BuiltInFunc, S, B } from './rules/AST'
import { checkRule } from './rules'

export interface Graph {
  edges: Array<[string, string]>
  nodes: {
    [key: string]: string[]
  }
}

export interface Region {
  id: string
  location: string
  exits: Array<[string, string, string]>
  checks: Check[]
}

interface Check {
  id: string
  description: string
  type: string
  rules: string
}

export const createEnv = (): Env => {
  const env = new Env()

  env.mem = {
    eval: new BuiltInFunc((e: Expr[]): Expr => {
      if (e.length !== 1) throw new Error('Wrong number of arguments to eval')

      return pipe(
        e[0], match<Expr, Expr>({
          S: ({ s }: S) => evaluate(env, parse(s)),
          _: () => { throw new Error('Cannot eval anything but a string') }
        })
      )
    }),
    debug: new BuiltInFunc((e: Expr[]): Expr => {
      if (e.length !== 1) throw new Error('Wrong number of arguments to debug')
      console.log(`DEBUG: ${e[0].dump()}`)

      return e[0]
    }),
    at: new BuiltInFunc((e: Expr[]): Expr => {
      if (e.length !== 2) throw new Error('Wrong number of arguments to at')
      return pipe(
        e[0], match({
          S: ({ s }: S) => {
            return canReach(env.state.graphs.CHILD, "Dodongo's Cavern Beginning", s) || canReach(env.state.graphs.ADULT, "Dodongo's Cavern Beginning", s) ? evaluate(env, e[1]) : new B(false)
          },
          _: () => { throw new Error('Expected string as first argument to at') }
        })
      )
    })
  }

  const items: string[] = JSON.parse(fs.readFileSync('./config/items.json', { encoding: 'utf-8' }))
  const skips: string[] = JSON.parse(fs.readFileSync('./config/skips.json', { encoding: 'utf-8' }))

  items.forEach((item) => {
    env.mem[item] = parse('FALSE')
  })
  skips.forEach((skip) => {
    env.mem[skip] = parse('FALSE')
  })
  helpers.forEach((f) => {
    env.mem[f[0]] = createFunc(f)
  })
  env.mem.AGE = parse('"CHILD"')

  return env
}

const createFunc = ([name, args, body]: [string, string[], string]): Expr => {
  const f = new Func(parse(body), args.map((arg) => new Var(arg)))
  return f
}

export const generateRegionGraph = (env: Env, regions: Region[]): void => {
  env.state.graphs = env.state.graphs ?? {}
  env.state.graphs.CHILD = {
    edges: [],
    nodes: {}
  }
  env.state.graphs.ADULT = {
    edges: [],
    nodes: {}
  }

  let dirty: boolean
  do {
    dirty = false
    for (const { id, exits } of regions) {
      env.state.graphs.CHILD.nodes[id] = env.state.graphs.CHILD.nodes[id] ?? []
      env.state.graphs.ADULT.nodes[id] = env.state.graphs.ADULT.nodes[id] ?? []

      for (const [exitId, childRule, adultRule] of exits) {
        if (!(env.state.graphs.CHILD as Graph).nodes[id].includes(exitId)) {
          env.mem.AGE = new S('CHILD')
          if (checkRule(env, childRule)) {
            env.state.graphs.CHILD.nodes[id].push(exitId)
            env.state.graphs.CHILD.edges.push([id, exitId])
            dirty = true
          }
        }
        if (!(env.state.graphs.ADULT as Graph).nodes[id].includes(exitId)) {
          env.mem.AGE = new S('ADULT')
          if (checkRule(env, adultRule)) {
            env.state.graphs.ADULT.nodes[id].push(exitId)
            env.state.graphs.ADULT.edges.push([id, exitId])
            dirty = true
          }
        }
      }
    }
  } while (dirty)
}

export const findReachableNodes = (graph: Graph, root: string): string[] => {
  const visited: string[] = [root]
  const toCheck: string[] = [root]

  while (toCheck.length > 0) {
    const current: string = toCheck.shift() as string
    if (graph.nodes[current] === undefined) continue

    for (const to of graph.nodes[current]) {
      if (visited.includes(to)) continue

      toCheck.push(to)
      visited.push(to)
    }
  }

  return visited
}

export const canReach = (graph: Graph, from: string, to: string): boolean => {
  return findReachableNodes(graph, from).includes(to)
}

export const buildRegionList = (): Region[] => {
  const regions = JSON.parse(fs.readFileSync('./config/locations/dodongosCavern.json', { encoding: 'utf-8' }))
  return regions
}

// const env = createEnv()
// env.mem.BOMB_BAG_1 = parse('TRUE')
// env.mem.BOW_1 = parse('TRUE')

// generateRegionGraph(env, buildRegionList())
// console.log(findReachableNodes(env.state.graphs.CHILD, "Dodongo's Cavern Beginning"))
// console.log(findReachableNodes(env.state.graphs.ADULT, "Dodongo's Cavern Beginning"))
// console.log(env.state.graphs.CHILD.nodes)
// console.log(env.state.graphs.ADULT.nodes)
