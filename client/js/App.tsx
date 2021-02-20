import React, { FC, useCallback } from 'react'

import { Button } from './components'
import { checkRule } from './lib/evaluator'
import Env from './lib/evaluator/Env'

export const App: FC = () => {
  const handleClick = useCallback(() => {
    console.log(checkRule(new Env(), 'TRUE OR FALSE'))
  }, [])

  return (
    <Button onClick={handleClick}>Click Me</Button>
  )
}
