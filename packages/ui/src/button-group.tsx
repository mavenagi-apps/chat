'use client'

import React, {type HTMLAttributes} from 'react'

const ButtonGroupContext = React.createContext<{} | undefined>(undefined)
export const useButtonGroupContext = () => React.useContext(ButtonGroupContext)

type ButtonGroupProps = HTMLAttributes<HTMLDivElement>
export const ButtonGroup = ({className, ...props}: ButtonGroupProps) => {
  return (
    <ButtonGroupContext.Provider value={{}}>
      <div className={className} role="group" {...props} />
    </ButtonGroupContext.Provider>
  )
}
