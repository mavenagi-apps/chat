import {CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon} from '@heroicons/react/20/solid'
import type {Meta, StoryObj} from '@storybook/react'

import {Alert, AlertDescription, AlertTitle} from './alert'

const meta: Meta<typeof Alert> = {
  title: 'Alert',
  component: Alert,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Alert>

export const Default: Story = {
  render: () => {
    const Component = () => {
      return (
        <div className="flex w-[600px] flex-col items-stretch gap-2">
          <Alert variant="danger">
            <ExclamationTriangleIcon />
            <AlertTitle>Title</AlertTitle>
            <AlertDescription>Description</AlertDescription>
          </Alert>
          <Alert variant="danger">
            <AlertTitle>Title</AlertTitle>
            <AlertDescription>Description</AlertDescription>
          </Alert>
          <Alert variant="danger">
            <AlertDescription>Description</AlertDescription>
          </Alert>
          <Alert variant="danger">
            <AlertTitle>Title</AlertTitle>
          </Alert>
          <Alert variant="success">
            <InformationCircleIcon />
            <AlertTitle>Title</AlertTitle>
            <AlertDescription>Description</AlertDescription>
          </Alert>
          <Alert variant="warning">
            <InformationCircleIcon />
            <AlertTitle>Title</AlertTitle>
            <AlertDescription>Description</AlertDescription>
          </Alert>
          <Alert variant="info">
            <InformationCircleIcon />
            <AlertTitle>Title</AlertTitle>
            <AlertDescription>Description</AlertDescription>
          </Alert>
          <Alert variant="info">
            <AlertTitle>Title</AlertTitle>
            <AlertDescription>Description</AlertDescription>
          </Alert>
          <Alert variant="info">
            <CheckCircleIcon />
            <AlertTitle>You have successfully refreshed your corpora.</AlertTitle>
          </Alert>
          <Alert variant="info">
            <AlertTitle>Title</AlertTitle>
          </Alert>
        </div>
      )
    }
    return <Component />
  },
}
