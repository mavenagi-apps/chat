import {Disclosure} from '@headlessui/react'
import {ChevronDownIcon, ClipboardIcon} from '@heroicons/react/20/solid'

import {Button} from './button'
import {cn} from './lib/utils'

export const ErrorFallbackRender = ({
  error,
  resetErrorBoundary,
  componentStack,
  eventId,
  className,
}: {
  error: Error
  resetErrorBoundary: () => void
  componentStack?: string
  eventId?: string
  className?: string
}) => {
  return (
    <div
      className={cn(
        'bg-bg-danger text-fg-danger border-fg-danger flex flex-col items-stretch gap-6 rounded-lg border p-6',
        className
      )}
      role="alert"
    >
      <div className="flex flex-col gap-2">
        <div className="font-bold">We&apos;re sorry, something went wrong</div>
        <pre className="whitespace-break-spaces break-words">{error.message}</pre>

        {eventId && <div className="tabular-nums">Event ID: {eventId}</div>}
        {componentStack && (
          <Disclosure>
            {({open}) => (
              <>
                <Disclosure.Button className="hover:text-fg-danger/80 flex items-center gap-1 rounded-lg text-xs font-medium">
                  <span>Show stack trace</span>
                  <ChevronDownIcon className={`${open ? 'rotate-180 transform' : ''} size-3`} />
                </Disclosure.Button>
                <Disclosure.Panel className="relative whitespace-pre-wrap text-wrap rounded-md bg-rose-200 p-4 text-xs">
                  <Button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `Message: ${error.message}\nEvent ID: ${eventId ?? 'not provided'}\nStack Trace:\n${componentStack}`
                      )
                    }
                    variant="danger"
                    outline
                    className="absolute right-2 top-2 w-fit"
                  >
                    <ClipboardIcon />
                  </Button>
                  {componentStack}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        )}
      </div>
      <Button className="self-start" variant="danger" onClick={() => resetErrorBoundary()}>
        Retry
      </Button>
    </div>
  )
}
