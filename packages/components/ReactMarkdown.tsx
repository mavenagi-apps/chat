// eslint-disable-next-line node/no-extraneous-import
import 'highlight.js/styles/atom-one-dark.css'
import React from 'react'
import RMReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

import {cn} from '@magi/ui'

export interface ReactMarkdownProps {
  children: string
  bulletsInside?: boolean
  linkTargetInNewTab?: boolean
}

export function ReactMarkdown({children, bulletsInside = false, linkTargetInNewTab = true}: ReactMarkdownProps) {
  // Note: list-style-position: inside does not work well on chrome if the <li> might have <p> within them
  const listStylePosition = bulletsInside ? 'inside' : 'outside'
  return (
    <RMReactMarkdown
      rehypePlugins={[[rehypeHighlight, {detect: true}]]}
      unwrapDisallowed
      components={{
        ul: ({node: _node, ...props}) => (
          <ul style={{listStyleType: 'disc', listStylePosition: listStylePosition}} {...props} />
        ),
        ol: ({node: _node, ...props}) => {
          return (
            <ul
              style={{
                listStyleType: 'decimal',
                listStylePosition: listStylePosition,
              }}
              {...props}
            />
          )
        },
        pre: ({node: _node, className, ...props}) => (
          <pre className={cn('whitespace-break-spaces', className)} {...props} />
        ),
        a: ({node: _node, children, ...props}) => {
          // Reference: https://github.com/remarkjs/react-markdown/issues/12
          if (linkTargetInNewTab) {
            props.target = '_blank'
            props.rel = 'noopener noreferrer'
          }

          return <a {...props}>{children}</a>
        },
      }}
    >
      {children}
    </RMReactMarkdown>
  )
}
