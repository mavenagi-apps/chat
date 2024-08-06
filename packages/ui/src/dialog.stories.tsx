import {useState} from '@storybook/preview-api'
import type {Meta, StoryObj} from '@storybook/react'

import {Button} from './button'
import {Dialog, DialogActions, DialogBody, type DialogProps, DialogTitle} from './dialog'
import {Field, Label} from './form/fieldset'
import {Input} from './form/input'

const meta: Meta<typeof Dialog> = {
  title: 'Dialog',
  component: Dialog,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Dialog>

function wrap(Component: React.ComponentType<DialogProps>) {
  const WrappedComponent = (props: DialogProps) => {
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
      <Dialog {...props}>
        <DialogTitle>Refund payment</DialogTitle>
        <DialogBody>
          <div>
            The refund will be reflected in the customer&apos;s bank account 2 to 3 business days after processing.
          </div>
          <Field>
            <Label>Amount</Label>
            <Input name="amount" placeholder="$0.00" />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button variant="secondary" onClick={() => props.onClose(false)}>
            Cancel
          </Button>
          <Button onClick={() => props.onClose(false)}>Refund</Button>
        </DialogActions>
      </Dialog>
    </>
  )),
}

export const WithScrollingContent: Story = {
  render: wrap(props => (
    <>
      <Button type="button" onClick={() => props.onClose(true)}>
        Agree to terms
      </Button>
      <Dialog {...props}>
        <DialogTitle>Terms and conditions</DialogTitle>
        <DialogBody className="text-sm/6 text-zinc-900 dark:text-white">
          <div>Please agree to the following terms and conditions to continue.</div>
          <p className="mt-4">
            By accessing and using our services, you are agreeing to these terms, which have been meticulously tailored
            for our benefit and your compliance.
          </p>
          <h3 className="mt-6 font-bold">Comprehensive Acceptance of Terms</h3>
          <p className="mt-4">
            Your engagement with our application signifies your irrevocable acceptance of these terms, which are binding
            regardless of your awareness or understanding of them. Your continued use acts as a silent nod of agreement
            to any and all stipulations outlined herein.
          </p>
          <h3 className="mt-6 font-bold">Unwavering Account Security</h3>
          <p className="mt-4">
            The security of your account rests solely on your shoulders. We absolve ourselves of any responsibility for
            your account’s integrity or any mishaps that may arise due to your negligence or inability to safeguard your
            credentials adequately.
          </p>
          <h3 className="mt-6 font-bold">Mandatory User Conduct</h3>
          <p className="mt-4">
            As a user, you are obliged to adhere to a code of conduct that we deem fit. Non-compliance or deviations, no
            matter how minor, may lead to unpredictable yet fully justified repercussions from our end.
          </p>
          <h3 className="mt-6 font-bold">Absolute Content Ownership Transfer</h3>
          <p className="mt-4">
            By posting content on our platform, you unwittingly grant us irrevocable, unrestricted ownership of said
            content. While you may retain a nominal sense of ownership, understand that our authority supersedes yours
            in every aspect of content utilization.
          </p>
          <h3 className="mt-6 font-bold">Unannounced Service Changes</h3>
          <p className="mt-4">
            We reserve the exclusive right to alter, modify, or completely disband any element of our service, at any
            time, without prior notification. Your adaptability to these changes is expected and required for continued
            use.
          </p>
          <h3 className="mt-6 font-bold">Explicit Disclaimer of Warranties</h3>
          <p className="mt-4">
            Our service is offered to you ‘as is’, without any guarantees or assurances of its functionality,
            reliability, or suitability for your purposes. Any expectations you harbor regarding its performance are
            your responsibility alone.
          </p>
          <h3 className="mt-6 font-bold">Strict Limitation of Liability</h3>
          <p className="mt-4">
            Our liability is constrained to the fullest extent permissible by law. We categorically deny any
            responsibility for direct, indirect, incidental, or consequential damages that may befall you as a result of
            engaging with our service.
          </p>
          <h3 className="mt-6 font-bold">Unilateral Termination Rights</h3>
          <p className="mt-4">
            Our discretion extends to terminating or suspending your access to our application at any given moment, for
            reasons that remain solely ours to discern. This termination can be enacted without prior notice or
            explanation.
          </p>
          <h3 className="mt-6 font-bold">Jurisdictional Governance</h3>
          <p className="mt-4">
            These terms are unilaterally governed by the legal jurisdiction of our choice. Your consent to these terms
            constitutes an unspoken agreement to submit to the laws and jurisdiction we prefer, irrespective of your
            geographical location.
          </p>
          <h3 className="mt-6 font-bold">Ongoing Amendments to Terms</h3>
          <p className="mt-4">
            We reserve the right to amend, revise, or overhaul these terms at our leisure. Your responsibility is to
            remain informed of these changes, as ignorance will not exempt you from their binding effects.
          </p>
          <p className="mt-4">
            By utilizing our services, you implicitly agree to be perpetually bound by these terms, acknowledging their
            absolute nature and our unchallenged prerogative to prioritize our interests above all else.
          </p>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => props.onClose(false)}>
            Cancel
          </Button>
          <Button onClick={() => props.onClose(false)}>I agree</Button>
        </DialogActions>
      </Dialog>
    </>
  )),
}
