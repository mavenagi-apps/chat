import {useState} from '@storybook/preview-api'
import type {Meta, StoryObj} from '@storybook/react'

import {
  AlertDialog,
  AlertDialogActions,
  AlertDialogBody,
  AlertDialogDescription,
  type AlertDialogProps,
  AlertDialogTitle,
} from './alert-dialog'
import {Button} from './button'
import {Input} from './form/input'

const meta: Meta<typeof AlertDialog> = {
  title: 'Alert Dialog',
  component: AlertDialog,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof AlertDialog>

function wrap(Component: React.ComponentType<AlertDialogProps>) {
  const WrappedComponent = (props: AlertDialogProps) => {
    const [isOpen, setIsOpen] = useState(false)
    return <Component {...props} open={isOpen} onClose={setIsOpen} />
  }
  WrappedComponent.displayName = `WrappedComponent(${Component.displayName || Component.name || 'Component'})`
  return WrappedComponent
}

export const BasicExample: Story = {
  render: wrap(props => (
    <>
      <Button type="button" onClick={() => props.onClose(true)}>
        Refund payment
      </Button>
      <AlertDialog {...props}>
        <AlertDialogTitle>Are you sure you want to refund this payment?</AlertDialogTitle>
        <AlertDialogDescription>
          The refund will be reflected in the customer&apos;s bank account 2 to 3 business days after processing.
        </AlertDialogDescription>
        <AlertDialogActions>
          <Button plain onClick={() => props.onClose(false)}>
            Cancel
          </Button>
          <Button onClick={() => props.onClose(false)}>Refund</Button>
        </AlertDialogActions>
      </AlertDialog>
    </>
  )),
}

export const WithBody: Story = {
  render: wrap(props => (
    <>
      <Button type="button" onClick={() => props.onClose(true)}>
        Delete repository
      </Button>
      <AlertDialog {...props}>
        <AlertDialogTitle>Verification required</AlertDialogTitle>
        <AlertDialogDescription>To continue, please enter your password.</AlertDialogDescription>
        <AlertDialogBody>
          <Input name="password" type="password" aria-label="Password" placeholder="•••••••" />
        </AlertDialogBody>
        <AlertDialogActions>
          <Button plain onClick={() => props.onClose(false)}>
            Cancel
          </Button>
          <Button onClick={() => props.onClose(false)}>Continue</Button>
        </AlertDialogActions>
      </AlertDialog>
    </>
  )),
}
