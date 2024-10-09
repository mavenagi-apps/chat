import clsx from 'clsx'
import {type PropsWithChildren, forwardRef} from 'react'
import {twMerge} from 'tailwind-merge'

export const ChatBubble = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{
    direction: 'left' | 'left-hug' | 'right' | 'full'
    className?: string
    author?: string
  }>
>(function ChatBubble({children, direction, className, author}, ref) {
  return (
    <div ref={ref} className={clsx('mb-5 flex flex-col', direction === 'right' && 'items-end')}>
      <div
        className={twMerge(
          'grid w-full gap-y-5 border border-gray-200 bg-white p-4 shadow-sm sm:rounded-lg',
          direction === 'right' && 'sm:ml-8 sm:w-fit',
          direction === 'left' && 'sm:mr-8',
          direction === 'left-hug' && 'sm:mr-8 sm:w-fit',
          className
        )}
      >
        {children}
      </div>
      {author && (
        <div className='mt-1 ml-3 text-xs text-gray-500'>
          {author}
        </div>
      )}
    </div>
  )
})