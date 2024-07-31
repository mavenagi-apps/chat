'use client'

import React from 'react'
import {RxDragHandleDots2} from 'react-icons/rx'
// eslint-disable-next-line  node/no-unpublished-import
import * as ResizablePrimitive from 'react-resizable-panels'

// eslint-disable-next-line  node/no-unpublished-import
import {cn} from './lib/utils'

export type ResizableDirection = 'horizontal' | 'vertical'

const ResizablePanelGroup = ({className, ...props}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn('data-[panel-group-direction=vertical]:flex-col', className)}
    {...props}
  />
)
const ResizablePanel = React.forwardRef(function ResizablePanel(
  props: React.ComponentProps<typeof ResizablePrimitive.Panel>,
  ref: React.ForwardedRef<ResizablePrimitive.ImperativePanelHandle>
) {
  return <ResizablePrimitive.Panel className={cn('border-gray-200', props.className)} ref={ref} {...props} />
})

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
  direction?: ResizableDirection
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      'bg-border focus-visible:ring-ring relative flex w-0 items-center justify-center border-gray-200 after:absolute after:inset-y-0 after:left-1/2 after:w-0 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90',
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-6 w-3 items-center justify-center rounded-sm border bg-white">
        <RxDragHandleDots2 className="h-5.5 w-3" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

export type ResizableImperativePanelHandle = ResizablePrimitive.ImperativePanelHandle

export {ResizablePanelGroup, ResizablePanel, ResizableHandle}
