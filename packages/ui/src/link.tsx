import {DataInteractive as HeadlessDataInteractive} from '@headlessui/react'
import NextLink, {type LinkProps as NextLinkProps} from 'next/link'
import React from 'react'

export type LinkProps = NextLinkProps & React.ComponentPropsWithoutRef<'a'>
export const Link = React.forwardRef(function Link(props: LinkProps, ref: React.ForwardedRef<HTMLAnchorElement>) {
  return (
    <HeadlessDataInteractive>
      <NextLink prefetch={false} {...props} ref={ref} />
    </HeadlessDataInteractive>
  )
})

export const Anchor = React.forwardRef(function Anchor(
  props: {href: string} & React.ComponentPropsWithoutRef<'a'>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  return (
    <HeadlessDataInteractive>
      <a {...props} ref={ref} />
    </HeadlessDataInteractive>
  )
})
