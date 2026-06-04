import React from 'react'
import './container.css'

type Props = {
  children?: React.ReactNode
  className?: string
}

const Container: React.FC<Props> = ({ children, className = '' }) => {
  return <div className={`container ${className}`.trim()}>{children}</div>
}

export default Container
