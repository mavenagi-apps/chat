'use client'

import {CalendarIcon, ChevronDownIcon} from '@heroicons/react/16/solid'
import {format} from 'date-fns'

import {Button} from '../button'
import {Calendar} from '../calendar'
import {Popover, PopoverButton, PopoverPanel} from '../popover'
import {asControlledComponent} from './as-controlled-component'

export type DatePickerProps = {
  value?: Date | undefined
  onChange?: (date: Date | undefined) => void
  disabled?: boolean
  label?: string
  anchor?:
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | 'top start'
    | 'top end'
    | 'right start'
    | 'right end'
    | 'bottom start'
    | 'bottom end'
    | 'left start'
    | 'left end'
    | undefined
}
export const DatePicker = asControlledComponent(
  ({value, disabled, onChange, label = 'Date', anchor}: DatePickerProps) => {
    return (
      <Popover>
        {({close}) => (
          <>
            <PopoverButton
              data-slot="control"
              disabled={disabled}
              as={Button}
              variant="secondary"
              className="w-full justify-start"
            >
              <CalendarIcon />
              {value ? format(value, 'PPP') : label}
              <ChevronDownIcon />
            </PopoverButton>
            <PopoverPanel anchor={{to: anchor}} className="p-4">
              <Calendar
                mode="single"
                defaultMonth={value || new Date()}
                selected={value}
                onSelect={day => {
                  onChange?.(day)
                  close()
                }}
                initialFocus
              />
            </PopoverPanel>
          </>
        )}
      </Popover>
    )
  },
  {
    defaultValue: undefined,
  }
)
