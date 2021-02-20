interface Matchable {
  _tag: string
}

const match = <V, R>(handlers: { [key: string]: (value: any) => R }): (value: V) => R => {
  return (value) => {
    const tag = ((value as any) as Matchable)._tag
    if (tag in handlers) {
      return handlers[tag](value)
    } else if ('_' in handlers) {
      return handlers._(value)
    } else {
      throw new Error('Could not find match')
    }
  }
}

export default match
