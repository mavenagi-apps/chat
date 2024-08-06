// import {MagiEvent} from '@/lib/analytics/events'
// import {useFetcher} from '@/lib/fetcher/react'
// import {useAnalytics} from '@/lib/use-analytics'
// import * as Sentry from '@sentry/nextjs'
// import {useMutation} from '@tanstack/react-query'
// import {useTranslations} from 'next-intl'
// import * as React from 'react'
// import {LuCopy, LuThumbsDown, LuThumbsUp} from 'react-icons/lu'
// import {RiCustomerService2Line} from 'react-icons/ri'
// import {toast} from 'sonner'
// import invariant from 'tiny-invariant'
// import {z} from 'zod'

// import {type Fetcher} from '@magi/fetcher'
// import {type Agent, BailoutType, type Feedback, FeedbackType, type TicketMessage} from '@magi/types/data'
// import {Textarea, useForm} from '@magi/ui'

// import {ButtonGroup} from '../button-group'
// import BailoutFormDisplay from './BailoutFormDisplay'

// type Props = {
//   message: TicketMessage
//   copyToClipboardFn?: (message: string) => void
//   feedbackCreateFn?: (
//     fetcher: Fetcher,
//     data: {ticketMessageId: string; feedback: Partial<Feedback>}
//   ) => Promise<Feedback>
//   feedbackUpdateFn?: (fetcher: Fetcher, data: {feedbackId: string; feedback: Partial<Feedback>}) => Promise<Feedback>
//   showClipboardButton?: boolean
//   showBailoutButton?: boolean
//   bailoutAgent?: Agent
// } & React.HTMLAttributes<HTMLDivElement>

// export default function FeedbackForm({
//   message,
//   children,
//   showClipboardButton = true,
//   showBailoutButton = false,
//   copyToClipboardFn = message => navigator.clipboard.writeText(message),
//   feedbackCreateFn = async (fetcher, {ticketMessageId, feedback}) =>
//     await (await fetcher.post<Feedback>(`ticketmessages/${ticketMessageId}/feedback`, feedback)).json(),
//   feedbackUpdateFn = async (fetcher, {feedbackId, feedback}) =>
//     await (await fetcher.put<Feedback>(`feedbacks/${feedbackId}`, feedback)).json(),
//   bailoutAgent = undefined,
//   ...props
// }: Props) {
//   const t = useTranslations('chat.FeedbackForm')
//   const analytics = useAnalytics()

//   const [feedbackId, setFeedbackId] = React.useState<string | undefined>(undefined)
//   const [feedbackType, setFeedbackType] = React.useState<
//     FeedbackType.THUMBS_UP | FeedbackType.THUMBS_DOWN | undefined
//   >()
//   const [feedbackTextFormShown, setFeedbackTextFormShown] = React.useState<boolean>(false)
//   const [manualBailoutFormShown, setManualBailoutFormShown] = React.useState<boolean>(false)

//   const fetcher = useFetcher()
//   const mutationFn = (feedback: Partial<Feedback>) =>
//     feedbackId === undefined
//       ? feedbackCreateFn(fetcher, {ticketMessageId: message.id, feedback})
//       : feedbackUpdateFn(fetcher, {feedbackId, feedback})
//   const thumbsMutation = useMutation({
//     mutationFn,
//     onSuccess: data => {
//       setFeedbackId(data.id)
//       setFeedbackType(data.type === FeedbackType.THUMBS_UP ? FeedbackType.THUMBS_UP : FeedbackType.THUMBS_DOWN)
//       methods.reset()
//       setFeedbackTextFormShown(true)
//     },
//     onError: error => {
//       toast.error('Error submitting feedback.')
//       Sentry.captureException(error)
//       setFeedbackId(undefined)
//       setFeedbackType(undefined)
//       setFeedbackTextFormShown(false)
//     },
//   })
//   const feedbackTextMutation = useMutation({
//     mutationFn,
//     onSuccess: () => {
//       toast.success('Thanks for your feedback!')
//       setFeedbackTextFormShown(false)
//     },
//     onError: error => {
//       toast.error('Error submitting feedback.')
//       Sentry.captureException(error)
//     },
//   })

//   const {Form, ...methods} = useForm({
//     schema: z.object({
//       text: z.string().min(1),
//     }),
//     onSubmit: async data => {
//       invariant(feedbackId, 'feedbackId should be defined')
//       await feedbackTextMutation.mutateAsync({text: data.text})
//     },
//   })

//   const thumbsOnClick = async (type: FeedbackType.THUMBS_UP | FeedbackType.THUMBS_DOWN) => {
//     setManualBailoutFormShown(false)
//     if (feedbackType !== type) {
//       setFeedbackTextFormShown(false)
//       await thumbsMutation.mutateAsync({type})
//     }
//   }

//   const buttonsContainerRef = React.useRef<HTMLDivElement>(null)
//   const thumbsUpRef = React.useRef<HTMLButtonElement>(null)
//   const thumbsDownRef = React.useRef<HTMLButtonElement>(null)
//   const manualBailoutRef = React.useRef<HTMLButtonElement>(null)

//   return (
//     <div {...props}>
//       <div className="flex justify-end">
//         <div className="relative flex flex-wrap justify-end gap-x-4 gap-y-2" ref={buttonsContainerRef}>
//           <ButtonGroup className="relative">
//             <button
//               type="button"
//               ref={thumbsUpRef}
//               {...(feedbackTextFormShown && feedbackType === FeedbackType.THUMBS_UP ? {'data-active': ''} : {})}
//               onClick={() => thumbsOnClick(FeedbackType.THUMBS_UP)}
//             >
//               <LuThumbsUp title={t('thumbs_up')} />
//             </button>
//             <button
//               type="button"
//               ref={thumbsDownRef}
//               {...(feedbackTextFormShown && feedbackType === FeedbackType.THUMBS_DOWN ? {'data-active': ''} : {})}
//               onClick={() => thumbsOnClick(FeedbackType.THUMBS_DOWN)}
//             >
//               <LuThumbsDown title={t('thumbs_down')} />
//             </button>
//             {showClipboardButton && (
//               <button
//                 type="button"
//                 onClick={() => {
//                   copyToClipboardFn(message.text)
//                   toast(t('copied_to_clipboard'))
//                 }}
//               >
//                 <LuCopy title={t('copy_to_clipboard')} />
//               </button>
//             )}
//             {showBailoutButton && bailoutAgent?.bailoutType === BailoutType.INTEGRATION && (
//               <button
//                 data-tooltip-target="tooltip-bailout"
//                 type="button"
//                 ref={manualBailoutRef}
//                 {...(manualBailoutFormShown ? {'data-active': ''} : {})}
//                 onClick={() => {
//                   analytics.logEvent(MagiEvent.manualBailoutClick, {
//                     agentId: message.agentId,
//                     ticketId: message.ticketId,
//                   })
//                   setManualBailoutFormShown(true)
//                   setFeedbackTextFormShown(false)
//                 }}
//               >
//                 <RiCustomerService2Line title={t('speak_to_agent')} />
//               </button>
//             )}
//           </ButtonGroup>
//           {children}
//         </div>
//       </div>

//       {(feedbackTextFormShown || manualBailoutFormShown) && (
//         <div className="relative mt-4 rounded-lg border border-gray-200 text-xs shadow-sm">
//           <div
//             className="absolute"
//             style={{
//               right:
//                 buttonsContainerRef.current !== null && thumbsUpRef.current !== null && thumbsDownRef.current !== null
//                   ? buttonsContainerRef.current.offsetWidth +
//                     4 -
//                     (manualBailoutFormShown && manualBailoutRef?.current
//                       ? manualBailoutRef.current.offsetLeft + manualBailoutRef.current.offsetWidth / 2
//                       : feedbackType === FeedbackType.THUMBS_UP
//                         ? thumbsUpRef.current.offsetLeft + thumbsUpRef.current.offsetWidth / 2
//                         : thumbsDownRef.current.offsetLeft + thumbsDownRef.current.offsetWidth / 2)
//                   : '-9999px',
//               top: '-6px',
//             }}
//           >
//             <div
//               className="absolute border-b border-r border-gray-200 bg-white"
//               style={{
//                 transform: 'rotate(-135deg)',
//                 height: '11px',
//                 width: '11px',
//               }}
//             />
//           </div>
//           {manualBailoutFormShown && bailoutAgent && (
//             <div className="p-4">
//               <BailoutFormDisplay
//                 message={t('human_agent_requested')}
//                 agent={bailoutAgent}
//                 showForm={true}
//                 ticketId={message.ticketId}
//                 ticketMessageId={message.id}
//               />
//             </div>
//           )}
//           {feedbackTextFormShown && (
//             <>
//               <div className="rounded-t-lg border-b border-gray-200 px-3 py-2">
//                 <h3 className="font-semibold">{t('feedback_reason')}</h3>
//               </div>
//               <div className="px-3 py-2">
//                 <Form.Form {...methods} className="grid gap-y-2">
//                   <Form.Field controlId="text">
//                     <Textarea
//                       className="text-xs"
//                       placeholder={
//                         feedbackType === FeedbackType.THUMBS_DOWN ? t('down_placeholder') : t('up_placeholder')
//                       }
//                       disabled={feedbackTextMutation.isPending}
//                     />
//                   </Form.Field>
//                   <div>
//                     <Form.SubmitButton
//                       variant="secondary"
//                       isProcessing={feedbackTextMutation.isPending}
//                       type="submit"
//                       className="float-right"
//                     >
//                       {t('submit')}
//                     </Form.SubmitButton>
//                   </div>
//                 </Form.Form>
//               </div>
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }
