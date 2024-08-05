import {
  type AgentFields,
//   type Integration,
//   type Quality,
//   type QualityScoreReason,
//   type Sentiment,
//   TicketInsightsCategory,
} from '@magi/types/data'

// export type DashboardOrgPage = 'agents' | 'members' | 'settings'
// export type DashboardAgentPage =
//   | 'metrics'
//   | 'tickets'
//   | 'feedback'
//   | 'train'
//   | 'eval'
//   | 'integrate'
//   | 'actions'
//   | 'settings'
//   | 'users'
//   | 'playground'
// export type DashboardAgentSubPage = 'inbox' | 'actions' | 'knowledge' | 'triggers'

// export function orgPage(orgId: string | undefined) {
//   return `/dashboard/${orgId || ''}`
// }

// export function orgFriendlyPage(friendlyId: string | undefined) {
//   return `/${friendlyId || ''}`
// }

// export function dashboardOrgPage({orgId, page}: {orgId: string; page: DashboardOrgPage}) {
//   return `/dashboard/${orgId}/${page}/`
// }

// export function dashboardAgentPage({
//   orgId,
//   agentId,
//   page,
//   subpage,
// }: {
//   orgId: string
//   agentId: string
//   page: DashboardAgentPage
//   subpage?: DashboardAgentSubPage
// }) {
//   return `/dashboard/${orgId}/${agentId}/${page}/${subpage || ''}`
// }

// export function agentPage(orgId: string, agentId: string) {
//   return `/dashboard/${orgId}/${agentId}/`
// }

// export function trainPage(orgId: string, agentId: string) {
//   return dashboardAgentPage({orgId: orgId, agentId: agentId, page: 'train', subpage: 'knowledge'})
// }

// export function corpusPage(orgId: string, agentId: string, corpusId: string) {
//   return `/dashboard/${orgId}/${agentId}/train/knowledge/${corpusId}/`
// }

// export function documentPage(orgId: string, agentId: string, corpusId: string, docId: string) {
//   return `/dashboard/${orgId}/${agentId}/train/knowledge/${corpusId}/${docId}/`
// }

// export function trainActionsPage(orgId: string, agentId: string) {
//   return dashboardAgentPage({orgId: orgId, agentId: agentId, page: 'train', subpage: 'actions'})
// }

// export function trainActionPage(orgId: string, agentId: string, actionId: string) {
//   return `${trainActionsPage(orgId, agentId)}/${actionId}`
// }

export function agentImage(agentId: string, type: AgentFields) {
  return `/api/v1/files/${agentId}/${type}`
}

// export function insightsPage(orgId: string, agentId: string) {
//   return dashboardAgentPage({orgId: orgId, agentId: agentId, page: 'metrics'})
// }

// export function allTicketsPage(orgId: string, agentId: string) {
//   return dashboardAgentPage({orgId: orgId, agentId: agentId, page: 'tickets'})
// }

// export function ticketsByQualityPage({orgId, agentId, quality}: {orgId: string; agentId: string; quality: Quality}) {
//   return `/dashboard/${orgId}/${agentId}/tickets?quality=${quality}`
// }

// export function ticketsByQualityReasonPage({
//   orgId,
//   agentId,
//   qualityReason,
// }: {
//   orgId: string
//   agentId: string
//   qualityReason: QualityScoreReason
// }) {
//   return `/dashboard/${orgId}/${agentId}/tickets?qualityReason=${qualityReason}`
// }

// export function ticketsBySentimentPage({
//   orgId,
//   agentId,
//   sentiment,
// }: {
//   orgId: string
//   agentId: string
//   sentiment: Sentiment
// }) {
//   return `/dashboard/${orgId}/${agentId}/tickets?sentiment=${sentiment}`
// }

// export function ticketsByInsightsCategoryPage({
//   orgId,
//   agentId,
//   type,
//   category,
// }: {
//   orgId: string
//   agentId: string
//   type: TicketInsightsCategory
//   category: string
// }) {
//   const filterName: string = type === TicketInsightsCategory.HUMAN_AGENT ? 'agents' : type.toLowerCase()
//   return `/dashboard/${orgId}/${agentId}/tickets?${filterName}=${category}`
// }

// export function ticketPage({orgId, agentId, ticketId}: {orgId: string; agentId: string; ticketId: string}) {
//   return `/dashboard/${orgId}/${agentId}/tickets/${ticketId}`
// }

// export function allFeedbackPage({orgId, agentId}: {orgId: string; agentId: string}) {
//   return `/dashboard/${orgId}/${agentId}/feedback`
// }

// export function allUsersPage({orgId, agentId}: {orgId: string; agentId: string}) {
//   return `/dashboard/${orgId}/${agentId}/users`
// }

// export function userPage({orgId, agentId, agentUserId}: {orgId: string; agentId: string; agentUserId: string}) {
//   return `/dashboard/${orgId}/${agentId}/users/${agentUserId}`
// }

// export function feedbackPage({orgId, agentId, feedbackId}: {orgId: string; agentId: string; feedbackId: string}) {
//   return `/dashboard/${orgId}/${agentId}/feedback/${feedbackId}`
// }

// export function evaluatePage(orgId: string, agentId: string) {
//   return dashboardAgentPage({orgId: orgId, agentId: agentId, page: 'eval'})
// }

// export function referenceSetPage(orgId: string, agentId: string, referenceSetId: string) {
//   return `/dashboard/${orgId}/${agentId}/eval/${referenceSetId}/`
// }

// export function referenceSessionPage(
//   orgId: string,
//   agentId: string,
//   referenceSetId: string,
//   referenceSessionId: string
// ) {
//   return `/dashboard/${orgId}/${agentId}/eval/${referenceSetId}/${referenceSessionId}`
// }

// export function evalResultSetPage(orgId: string, agentId: string, referenceSetId: string, evalResultSetId: string) {
//   return `/dashboard/${orgId}/${agentId}/eval/${referenceSetId}/results/${evalResultSetId}/`
// }

// export function integratePage({orgId, agentId}: {orgId: string; agentId: string}) {
//   return dashboardAgentPage({orgId: orgId, agentId: agentId, page: 'integrate'})
// }

// export function playgroundPage({
//   orgId,
//   agentId,
//   ticketId,
//   stream = undefined,
// }: {
//   orgId: string
//   agentId: string
//   ticketId?: string | undefined
//   stream?: boolean | undefined
// }) {
//   const params = new URLSearchParams()
//   if (ticketId) {
//     params.append('ticketId', ticketId)
//   }
//   if (stream) {
//     params.append('stream', '1')
//   }
//   return `/dashboard/${orgId}/${agentId}/playground?` + params
// }

// export function externalIntegrationPage({
//   orgId,
//   agentId,
//   integration,
// }: {
//   orgId: string
//   agentId: string
//   integration: Integration
// }) {
//   return `/dashboard/${orgId}/${agentId}/integrate/${integration}`
// }

// export function apiPage({orgId, agentId}: {orgId: string; agentId: string}) {
//   return `/dashboard/${orgId}/${agentId}/integrate/api`
// }
// export function appMarketplacePage({orgId, agentId}: {orgId: string; agentId: string}) {
//   return `/dashboard/${orgId}/${agentId}/integrate/app_marketplace`
// }

// export function appInstallPage({orgId, agentId, appId}: {orgId: string; agentId: string; appId: string}) {
//   return `/dashboard/${orgId}/${agentId}/integrate/app_marketplace/${appId}`
// }

// export function chatSettingsPage({orgId, agentId}: {orgId: string; agentId: string}) {
//   return `/dashboard/${orgId}/${agentId}/integrate/chat`
// }
// export function instantAnswersSettingsPage({orgId, agentId}: {orgId: string; agentId: string}) {
//   return `/dashboard/${orgId}/${agentId}/integrate/instant`
// }

// export function membersUrl(orgId: string) {
//   return dashboardOrgPage({orgId: orgId, page: 'members'})
// }

// export function invitationsUrl(orgId: string) {
//   return `/dashboard/${orgId}/members/invitations`
// }

// export function signOut() {
//   return '/api/auth/logout'
// }

// export function signIn() {
//   return '/api/auth/login'
// }

// export function signUp() {
//   return '/signup'
// }

// export function chatPreviewPage({apiKey}: {orgFriendlyId: string; apiKey: string}) {
//   return `/chatpreview/${apiKey}`
// }

// export function instantAnswersPreviewPage({apiKey}: {orgFriendlyId: string; apiKey: string}) {
//   return `/instantpreview/${apiKey}`
// }

// export function searchPage({orgFriendlyId, agentId}: {orgFriendlyId: string; agentId: string}) {
//   const regex = /app\.(?<envPrefix>(staging|([^.]+)\.sb)\.)?mavenagi\.com/
//   const matchs = regex.exec(window.location.hostname)
//   return `https://${orgFriendlyId}.${matchs?.groups?.envPrefix ?? ''}onmaven.ai/search/${agentId}`
// }
