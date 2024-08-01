import invariant from 'tiny-invariant'

/// does not close eventSource on close, must be closed manually by caller
export async function* makePeriodicEventIterator(eventSource: EventSource, signal: AbortSignal) {
  const messageQueue: (string | undefined)[] = []
  const resolveQueue: ((value: IteratorResult<string>) => void)[] = []
  const close = () => {
    if (resolveQueue.length > 0) {
      const resolve = resolveQueue.shift()!
      resolve({value: undefined, done: true})
    } else {
      messageQueue.push(undefined)
    }
  }

  const onPeriodicEvent = (message: MessageEvent<string>) => {
    if (resolveQueue.length > 0) {
      const resolve = resolveQueue.shift()!
      resolve({value: message.data, done: false})
    } else {
      messageQueue.push(message.data)
    }
  }

  try {
    signal.addEventListener('abort', close)
    eventSource.addEventListener('error', close)
    eventSource.addEventListener('periodic-event', onPeriodicEvent)
    const reader = {
      [Symbol.asyncIterator]() {
        return {
          async next() {
            if (messageQueue.length > 0) {
              const value = messageQueue.shift()
              return {value, done: value === undefined}
            }
            return new Promise<IteratorResult<string>>(resolve => {
              resolveQueue.push(resolve)
            })
          },
        }
      },
    }
    for await (const chunk of reader) {
      if (signal.aborted) {
        break
      }
      invariant(chunk !== undefined)
      yield chunk
    }
  } finally {
    eventSource.removeEventListener('periodic-event', onPeriodicEvent)
    eventSource.removeEventListener('error', close)
    signal.removeEventListener('abort', close)
  }
}
