import clsx from 'clsx'
import {type PropsWithChildren, forwardRef} from 'react'
import {twMerge} from 'tailwind-merge'

export const ChatBubble = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{
    direction: 'left' | 'right' | 'full'
    className?: string
  }>
>(function ChatBubble({children, direction, className}, ref) {
  return (
    <div ref={ref} className={clsx('mb-5 flex', direction === 'right' && 'justify-end')}>
      <div
        className={twMerge(
          'grid w-full gap-y-5 border border-gray-200 bg-white p-4 shadow-sm sm:rounded-lg',
          direction === 'right' && 'sm:ml-8 sm:w-fit',
          direction === 'left' && 'sm:mr-8',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
})
