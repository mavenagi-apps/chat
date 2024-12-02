'use client'

import React from 'react'

export const buttonStyles = {
  base: [
    // Base
    'relative isolate inline-flex items-center justify-center gap-x-2 border rounded-lg font-semibold',

    // Focus
    'data-[focus]:outline-offset-2',

    // Sizing
    'px-[calc(theme(spacing.3)-1px)] py-[calc(theme(spacing[1.5])-1px)] text-sm/6',

    // Icon
    '[&>[data-slot=icon]]:-mx-0.5 [&>[data-slot=icon]]:my-0.5 [&>[data-slot=icon]]:size-4 [&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:text-[--btn-icon] [&>[data-slot=icon]]:sm:my-1 [&>[data-slot=icon]]:sm:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:data-[hover]:[--btn-icon:ButtonText]',
  ],
  solid: [
    // Optical border, implemented as the button background to avoid corner artifacts
    'border-transparent bg-[--btn-border]',

    // Button background, implemented as foreground layer to stack on top of pseudo-border layer
    'before:absolute before:inset-0 before:-z-10 before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-[--btn-bg]',

    // Shim/overlay, inset to match button foreground and used for hover state + highlight shadow
    'after:absolute after:inset-0 after:-z-10 after:rounded-[calc(theme(borderRadius.lg)-1px)]',

    // White overlay on hover
    'after:data-[active]:bg-[--btn-hover-overlay] after:data-[hover]:bg-[--btn-hover-overlay]',

    // Disabled
    'before:data-[disabled]:shadow-none after:data-[disabled]:shadow-none',
  ],
  outline: [
    // Base
    'border-[--btn-border] text-[--btn-fg] data-[active]:bg-zinc-950/[2.5%] data-[hover]:bg-zinc-950/[2.5%]',
  ],
  plain: [
    // Base
    'border-transparent text-[--btn-fg] data-[active]:bg-zinc-950/5 data-[hover]:bg-zinc-950/5',

    // Icon
    '[--btn-icon:theme(colors.zinc.500)] data-[active]:[--btn-icon:theme(colors.zinc.700)] data-[hover]:[--btn-icon:theme(colors.zinc.700)]',
  ],
  colors: {
    solid: {
      primary: [
        'text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:var(--brand-color)] [--btn-border:var(--brand-color)]',
        '[--btn-icon:var(--brand-color)] hover:[--btn-bg:color-mix(in_srgb,var(--brand-color),black_10%)] active:[--btn-bg:color-mix(in_srgb,var(--brand-color),black_20%)]',
      ],
      secondary: [
        'text-zinc-950 [--btn-bg:white] [--btn-border:theme(colors.zinc.950/10%)] [--btn-hover-overlay:theme(colors.zinc.950/2.5%)] data-[active]:[--btn-border:theme(colors.zinc.950/15%)] data-[hover]:[--btn-border:theme(colors.zinc.950/15%)]',
        '[--btn-icon:theme(colors.zinc.500)] data-[active]:[--btn-icon:theme(colors.zinc.700)] data-[hover]:[--btn-icon:theme(colors.zinc.700)]',
      ],
      tertiary: [
        'text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.gray.900)] [--btn-border:theme(colors.gray.700/90%)]',
        '[--btn-icon:theme(colors.gray.300)] data-[active]:[--btn-icon:theme(colors.gray.200)] data-[hover]:[--btn-icon:theme(colors.gray.200)]',
      ],
      danger: [
        'text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.red.600)] [--btn-border:theme(colors.red.700/90%)]',
        '[--btn-icon:theme(colors.red.300)] data-[active]:[--btn-icon:theme(colors.red.200)] data-[hover]:[--btn-icon:theme(colors.red.200)]',
      ],
      warning: [
        'text-amber-950 [--btn-hover-overlay:theme(colors.white/25%)] [--btn-bg:theme(colors.amber.400)] [--btn-border:theme(colors.amber.500/80%)]',
        '[--btn-icon:theme(colors.amber.600)]',
      ],
      success: [
        'text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.green.600)] [--btn-border:theme(colors.green.700/90%)]',
        '[--btn-icon:theme(colors.white/60%)] data-[active]:[--btn-icon:theme(colors.white/80%)] data-[hover]:[--btn-icon:theme(colors.white/80%)]',
      ],
    },
    outline: {
      primary: [
        '[--btn-fg:theme(colors.violet.600)] [--btn-border:theme(colors.violet.700/90%)]',
        '[--btn-icon:theme(colors.violet.500)] data-[active]:[--btn-icon:theme(colors.violet.700)] data-[hover]:[--btn-icon:theme(colors.violet.700)]',
      ],
      secondary: [
        '[--btn-fg:theme(colors.zinc.950)] [--btn-border:theme(colors.zinc.950/90%)]',
        '[--btn-icon:theme(colors.zinc.500)] data-[active]:[--btn-icon:theme(colors.zinc.700)] data-[hover]:[--btn-icon:theme(colors.zinc.700)]',
      ],
      tertiary: [
        '[--btn-fg:theme(colors.gray.900)] [--btn-border:theme(colors.gray.700/90%)]',
        '[--btn-icon:theme(colors.gray.500)] data-[active]:[--btn-icon:theme(colors.gray.700)] data-[hover]:[--btn-icon:theme(colors.gray.700)]',
      ],
      danger: [
        '[--btn-fg:theme(colors.red.600)] [--btn-border:theme(colors.red.700/90%)]',
        '[--btn-icon:theme(colors.red.500)] data-[active]:[--btn-icon:theme(colors.red.700)] data-[hover]:[--btn-icon:theme(colors.red.700)]',
      ],
      warning: [
        '[--btn-fg:theme(colors.amber.400)] [--btn-border:theme(colors.amber.500/80%)]',
        '[--btn-icon:theme(colors.amber.500)] data-[active]:[--btn-icon:theme(colors.amber.700)] data-[hover]:[--btn-icon:theme(colors.amber.700)]',
      ],
      success: [
        '[--btn-fg:theme(colors.green.600)] [--btn-border:theme(colors.green.700/90%)]',
        '[--btn-icon:theme(colors.green.500)] data-[active]:[--btn-icon:theme(colors.green.700)] data-[hover]:[--btn-icon:theme(colors.green.700)]',
      ],
    },
    plain: {
      primary: [
        '[--btn-fg:theme(colors.violet.600)]',
        '[--btn-icon:theme(colors.violet.600)] data-[active]:[--btn-icon:theme(colors.violet.700)] data-[hover]:[--btn-icon:theme(colors.violet.700)]',
      ],
      secondary: [
        '[--btn-fg:theme(colors.zinc.950)]',
        '[--btn-icon:theme(colors.zinc.500)] data-[active]:[--btn-icon:theme(colors.zinc.700)] data-[hover]:[--btn-icon:theme(colors.zinc.700)]',
      ],
      tertiary: [
        '[--btn-fg:theme(colors.gray.900)]',
        '[--btn-icon:theme(colors.gray.900)] data-[active]:[--btn-icon:theme(colors.gray.700)] data-[hover]:[--btn-icon:theme(colors.gray.700)]',
      ],
      danger: [
        '[--btn-fg:theme(colors.red.600)]',
        '[--btn-icon:theme(colors.red.500)] data-[active]:[--btn-icon:theme(colors.red.700)] data-[hover]:[--btn-icon:theme(colors.red.700)]',
      ],
      warning: [
        '[--btn-fg:theme(colors.amber.400)]',
        '[--btn-icon:theme(colors.amber.500)] data-[active]:[--btn-icon:theme(colors.amber.700)] data-[hover]:[--btn-icon:theme(colors.amber.700)]',
      ],
      success: [
        '[--btn-fg:theme(colors.green.600)]',
        '[--btn-icon:theme(colors.green.500)] data-[active]:[--btn-icon:theme(colors.green.700)] data-[hover]:[--btn-icon:theme(colors.green.700)]',
      ],
    },
  },
};

/* Expand the hit area to at least 44×44px on touch devices */
export function TouchTarget({children}: {children: React.ReactNode}) {
  return (
    <>
      {children}
      <span
        className="absolute left-1/2 top-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden"
        aria-hidden="true"
      />
    </>
  )
}
