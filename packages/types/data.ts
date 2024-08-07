/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 3.2.1263 on 2024-07-29 15:17:01.

export interface Page<T> extends Slice<T> {
    totalPages: number;
    totalElements: number;
}

export interface Pair<S, T> {
    first: S;
    second: T;
}

export interface ValidationErrorResponse {
    violations: Violation[];
}

export interface Agent extends AuditedEntity, Serializable {
    id: string;
    name: string;
    brandColor: string;
    brandFontColor: string;
    organizationId: string;
    friendlyId: string;
    persona: LlmPersona;
    additionalPromptText?: string;
    popularQuestions: string[];
    bailoutType: BailoutType;
    bailoutText: string;
    bailoutIntegration: Integration;
    hiddenTicketTags: string[];
    salesStatus?: SalesStatus;
    strictMode: boolean;
}

export interface BailoutForm {
    name: string;
    email: string;
    question: string;
}

export interface Constants {
    dontUseThisField: AgentFields;
    dontUseThisField3: LlmUsageContext;
    dontUseThisField4: LlmPersona;
    dontUseThisField5: LlmModel;
    dontUseThisField6: Integration;
    dontUseThisField8: SupportedLanguages;
    dontUseThisField9: TicketInsightsCategory;
}

export interface Corpus extends AuditedEntity, Serializable {
    id: string;
    externalId?: string;
    mavenAppId?: string;
    corpusVersionId?: string;
    type: Type;
    status: CorpusStatus;
    refreshFrequency: RefreshFrequency;
    name: string;
    agentId: string;
    sourceUrl?: string;
    urlExclusionPatterns: string[];
    includedKbArticleIds: string[];
    excludeLastUpdatedBefore?: Date;
    htmlTransformer: HtmlTransformer;
    active: boolean;
    tags: string[];
    crawlSpec?: InputSpec;
    integration?: Integration;
    integrationCategoryId?: string;
    mavenIsSourceOfTruth: boolean;
    userAddedDocsAllowed: boolean;
}

export interface Crawl extends AuditedEntity, Serializable {
    id?: string;
    status: Status;
    corpusId?: string;
    progress?: Progress;
}

export interface Document extends AuditedEntity, Serializable {
    id: string;
    externalLookupKey?: string;
    sourceUrl?: string;
    title?: string;
    text?: string;
    languageCode: LanguageCode;
    corpusId: string;
    processingVersion: number;
    corpusPolicy: CorpusPolicy;
    sourceCreatedAt?: Date;
    sourceUpdatedAt?: Date;
    sourceAuthor?: string;
    chunkingStatus: ChunkingStatus;
}

export interface Feedback extends AuditedEntity, Serializable {
    id: string;
    agentId: string;
    ticketMessageId: string;
    externalId?: string;
    mavenAppId?: string;
    text: string;
    type: FeedbackType;
}

export interface FeedbackWithTicketMessageAndUserMessage extends Serializable {
    feedback: Feedback;
    ticketMessage: TicketMessage;
    userMessage?: TicketMessage;
}

export interface Organization extends AuditedEntity, Serializable {
    id: string;
    name: string;
    friendlyId: string;
    auth0Id?: string;
    defaultAgentId?: string;
    defaultLanguage?: LanguageCode;
}

export interface PlaygroundRun extends AuditedEntity, Serializable {
    id: string;
    agentId: string;
    surfaces: Surface[];
    llmPersonas: LlmPersona[];
    userQuestionText?: string;
    subject?: string;
    additionalPromptText?: string;
    userContext: TicketUserContext;
    knowledgeSpec?: KnowledgeSpec;
}

export interface PromptTemplate extends AuditedEntity, Serializable {
    id: string;
    promptTemplate: string;
    usageContext: LlmUsageContext;
    model: LlmModel;
    promptVersion: number;
    persona: LlmPersona;
    active: boolean;
    archived: boolean;
}

export interface Ticket extends AuditedEntity, Serializable, ExternallyIngestible {
    id: string;
    externalId?: string;
    externalUrl?: string;
    mavenAppId?: string;
    surface: Surface;
    hidden: boolean;
    agentId: string;
    userContext?: TicketUserContext;
    subject?: string;
    insightsVersion?: number;
    /**
     * @deprecated
     */
    sentiment: Sentiment;
    userRequestSummary: string;
    agentResponseSummary: string;
    resolutionStatusSummary: string;
    broadCategory: string;
    detailedCategory?: string;
    originalCategory: string;
    subjectLanguage?: LanguageCode;
    allLanguages?: string[];
    tags?: string[];
    metadata?: { [index: string]: string };
    toEndpoint?: string;
    fromEndpoint?: string;
    playgroundContext?: PlaygroundContext;
    bailoutTicketId?: string;
    originalTicketId?: string;
}

export interface ConversationMessageId {
    agentId: string;
    appId: string;
    organizationId: string;
    referenceId: string;
    type: string;
}

export interface TicketMessage extends AuditedEntity, Serializable, ExternallyIngestible {
    responses: any;
    conversationMessageId: ConversationMessageId;
    id: string;
    externalId?: string;
    mavenAppId?: string;
    ticketId: string;
    agentId: string;
    type: MessageType;
    text: string;
    botContext: BotContext;
    userMessageId?: string;
    status: TicketMessageStatus;
    statusReason: TicketMessageStatusReason;
    language?: LanguageCode;
}

export interface TicketMessageWithFeedbacks extends Serializable {
    ticketMessage: TicketMessage;
    feedbacks: Feedback[];
    action?: Action;
}

export interface TicketWithLastQAndAPairAndQuality extends Serializable {
    ticket: Ticket;
    lastUserMessage?: TicketMessage;
    lastBotMessage?: TicketMessage;
    quality: Quality;
    qualityScoreReason?: QualityScoreReason;
}

export interface TicketWithMessages extends Serializable {
    ticket: Ticket;
    sentiment?: Sentiment;
    messages: TicketMessage[];
}

export interface User extends Serializable {
    id: string;
    name: string;
    email: string;
    pictureUrl: string;
    createdAt: Date;
    updatedAt: Date;
    authenticated: boolean;
}

export interface Action extends AuditedEntity, Serializable {
    id: string;
    agentId: string;
    externalId: string;
    mavenAppId: string;
    userInteractionRequired: boolean;
    deleted: boolean;
    searchStatus: ActionSearchStatus;
    name: string;
    description?: string;
    descriptionOverride?: string;
    buttonName?: string;
    userFormParameters: ActionParameter[];
    requiredUserContextFieldNames: string[];
    computedDescription?: string;
}

export interface ActionChangeSearchStatusRequest extends Serializable {
    actionIds: string[];
    searchStatus: ActionSearchStatus;
}

export interface AgentUser extends AuditedEntity, Serializable {
    id?: string;
    agentId: string;
}

export interface UserIdentifier extends AuditedEntity, Serializable {
    id?: string;
    agentId: string;
    type: UserIdentifierType;
    value: string;
    agentUserId: string;
    appProfileId: string;
}

export interface Invitation extends Serializable {
    id: string;
    email: string;
    role: Role;
    createdAt: Date;
    expiresAt: Date;
    invitationUrl: string;
}

export interface Member extends Serializable {
    id: string;
    orgId: string;
    name: string;
    pictureUrl: string;
    email: string;
    role: Role;
}

export interface AgentApiConfig extends Serializable {
    id: string;
    apiKey: string;
    apiSecret: string;
}

export interface AgentChatConfig extends Serializable {
    id: string;
    welcomeMessage: string;
}

export interface ServiceConfig extends AuditedEntity, Serializable {
    key: string;
    value: Config;
}

export interface AgentFreshdeskConfig extends AgentIntegrationConfig, Serializable {
    freshdeskWebhookEnabled: boolean;
    freshdeskSubdomain: string;
    freshdeskToken: string;
    freshdeskCustomTagField: string;
}

export interface AgentSalesforceConfig extends AgentIntegrationConfig, Serializable {
    salesforceWebhookEnabled: boolean;
    salesforceDomain: string;
    salesforceOrganizationId: string;
    salesforceIsLightning: boolean;
    salesforceClientId: string;
    salesforceClientSecret: string;
    salesforceFirstUserMessageCustomFieldName: string;
}

export interface AgentSlackQaBotConfig extends AgentIntegrationConfig, Serializable {
    slackAgentName: string;
    slackAgentAvailable: boolean;
}

export interface AgentTwilioConfig extends AgentIntegrationConfig, Serializable {
    twilioAccountSid: string;
    twilioToken: string;
    twilioSmsEndpoint?: string;
    twilioEnabled: boolean;
}

export interface AgentZendeskConfig extends AgentIntegrationConfig, Serializable {
    zendeskWebhookEnabled: boolean;
    zendeskSubdomain: string;
    zendeskUsername: string;
    zendeskToken: string;
}

export interface EvalResult extends AuditedEntity, Serializable {
    id: string;
    evalResultSetId: string;
    referenceSessionId: string;
    question: string;
    expectedAnswer?: string;
    actualAnswer: string;
    answerTicketMessageId: string;
    quality: Quality;
}

export interface EvalResultSet extends AuditedEntity, Serializable {
    id: string;
    agentId: string;
    referenceSetId: string;
    status: EvalStatus;
    name: string;
    resultCount: number;
    score: number;
}

export interface ReferenceSession extends AuditedEntity, Serializable {
    id: string;
    referenceSetId: string;
    questions: ReferenceQuestion[];
}

export interface ReferenceSet extends AuditedEntity, Serializable {
    id: string;
    type: ReferenceSetType;
    name: string;
    agentId: string;
}

export interface UserExperiments {
    enablePredictedNps: boolean;
    enableUseSitemapsInUi: boolean;
    enableConsecutiveActions: boolean;
}

export interface CopilotConfig {
    languageCode: string;
}

export interface ParsedId {
    id: string;
    type: string;
    parentId?: ParsedId;
    environment: string;
    rawProtoString: string;
}

export interface CorpusChangeActivationRequest extends Serializable {
    corpusIds: string[];
    active: boolean;
}

export interface CorpusSearchRequest extends Serializable {
    search: string;
    urlFilter: string;
    corpusTypeFilter: Type[];
    knowledgeStatusFilter: KnowledgeStatus[];
    createdAfter?: Date;
    createdBefore?: Date;
}

export interface CorpusSearchResponse extends Serializable {
    results: Page<Corpus>;
}

export interface DocumentChangePolicyRequest extends Serializable {
    docIds: string[];
    policy: CorpusPolicy;
}

export interface DocumentSearchRequest extends Serializable {
    search: string;
    urlFilter: string;
    corpusTypeFilter: Type[];
    knowledgeStatusFilter: KnowledgeStatus[];
    createdAfter?: Date;
    createdBefore?: Date;
}

export interface DocumentSearchResponse extends Serializable {
    results: Page<DocumentSearchResults>;
}

export interface DocumentSearchResults extends Serializable {
    id: string;
    title?: string;
    text?: string;
    sourceUrl?: string;
    languageCode: LanguageCode;
    corpusPolicy: CorpusPolicy;
    chunkingStatus: ChunkingStatus;
    createdAt: Date;
    createdBy: AuditUser;
    updatedAt: Date;
    updatedBy: AuditUser;
    corpusId: string;
    corpusType: Type;
    corpusIntegration?: Integration;
    corpusName?: string;
    corpusActive: boolean;
    isCorpusActive: boolean;
}

export interface FeedbackSearchRequest extends Serializable {
    search: string;
    types: FeedbackType[];
    createdAfter?: Date;
    createdBefore?: Date;
}

export interface FeedbackSearchResults extends Serializable {
    results: Page<FeedbackWithTicketMessageAndUserMessage>;
    stats: { [P in FeedbackType]?: number };
}

export interface InboxSearchRequest extends Serializable {
    s: string;
    statuses: InboxItemStatus[];
    severity: Severity[];
    type: InboxItemType[];
    createdAfter?: Date;
    createdBefore?: Date;
}

export interface PlaygroundTicketSearchRequest extends Serializable {
    search: string;
    surfaceFilter: Surface[];
    personaFilter: LlmPersona[];
    createdAfter?: Date;
    createdBefore?: Date;
}

export interface PlaygroundTicketSearchResults extends Serializable {
    results: Page<TicketWithLastQAndAPairAndQuality>;
}

export interface TicketInsightsResults extends Serializable {
    dateStats: TicketDateStat[];
    sentimentBreakdown: TicketSentimentStat[];
    qualityBreakdown: TicketQualityStat[];
    qualityReasonCounts: { [P in QualityScoreReason]?: number };
    coverage: number;
    avgHandleTimeMs: number;
    avgPredictedNps: number;
}

export interface TicketSearchRequest extends Serializable {
    search: string;
    surfaceFilter: Surface[];
    sentimentFilter: Sentiment[];
    qualityFilter: Quality[];
    qualityReasonFilter: QualityScoreReason[];
    clusterIds: string[];
    feedbackFilter: FeedbackType[];
    languagesFilter: string[];
    tags: string[];
    humanAgents: string[];
    createdAfter?: Date;
    createdBefore?: Date;
}

export interface TicketSearchResults extends Serializable {
    results: Page<TicketWithAnalysis>;
    qualityStats: TicketQualityStat[];
    coverage: number;
    avgHandleTimeMs: number;
    avgPredictedNps: number;
}

export interface UserSearchRequest extends Serializable {
    search: string;
    createdAfter?: Date;
    createdBefore?: Date;
}

export interface AgentStats {
    agent: Agent;
    enabledWebhooks: string;
    ticketCount: number;
    ticketCoverage: number;
}

export interface TicketCategoryStat {
    name: string;
    count: number;
    coverage: number;
    avgFirstResponseMs: number;
    avgHandleTimeMs: number;
    avgUserInteractions: number;
    insertCount: number;
    bailoutCount: number;
    avgPredictedNps: number;
    avgFirstResponseDisplay?: string;
    avgHandleTimeDisplay: string;
}

export interface PlaygroundRunRequest extends Serializable {
    surfaces: Surface[];
    personas: LlmPersona[];
    userQuestionText: string;
    subject?: string;
    additionalPromptText?: string;
    userContext: TicketUserContext;
    knowledgeSpec?: KnowledgeSpec;
}

export interface PlaygroundRunResponse extends Serializable {
    playgroundRunId: string;
    ticketIds: string[];
}

export interface Trigger extends AuditedEntity, Serializable {
    id?: string;
    externalId: string;
    mavenAppId: string;
    agentId: string;
    description: string;
    type: TriggerType;
    registered: boolean;
}

export interface AgentUserDto {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    appProfiles: AppProfileDto[];
}

export interface AppProfileDto {
    id: string;
    agentId: string;
    agentUserId: string;
    mavenAppId: string;
    externalId: string;
    createdAt: Date;
    updatedAt: Date;
    phones: string[];
    emails: string[];
    metadata: { [index: string]: string };
}

export interface InboxItemDto {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: InboxItemType;
    status: InboxItemStatus;
    severity: Severity;
    involvedObjects: InvolvedObjectDto[];
    exampleTicketIds: string[];
}

export interface InboxItemFixDto {
    id: string;
    type: FixType;
    suggestedText?: string;
    recommendedFix: boolean;
    object?: InvolvedObjectDto;
}

export interface OrgInsightsResponseDto {
    companyName: string;
    friendlyId: string;
    logoUrl: string;
    popularQuestions: string[];
    helpCenterLocations: HelpCenterLocationDto[];
}

export interface QuickOrgCreateDto {
    name: string;
    friendlyId: string;
    popularQuestions: string[];
    kbs: QuickKbCreateDto[];
}

export interface OrgGetPutDto {
    id: string;
    name: string;
    friendlyId: string;
    defaultAgentId?: string;
    defaultLanguage?: LanguageCode;
}

export interface OrgPostDto {
    name: string;
    friendlyId: string;
    defaultLanguage?: LanguageCode;
}

export interface Sort extends Streamable<Order>, Serializable {
    sorted: boolean;
    unsorted: boolean;
}

export interface Pageable {
    offset: number;
    sort: Sort;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
    pageNumber: number;
}

export interface Violation {
    fieldName: string;
    message: string;
}

export interface AuditUser extends Serializable {
    id?: string;
    name?: string;
}

export interface AuditedEntity extends Serializable {
    createdAt: Date;
    updatedAt: Date;
    createdBy?: AuditUser;
    updatedBy?: AuditUser;
}

export interface Serializable {
}

export interface InputSpec extends Serializable {
    ingestionWorkflowId: string;
    startUrls: string[];
    exclusionPatterns: string[];
    htmlTransformer: HtmlTransformer;
    removeElementsCssSelector: string;
    maxCrawlDepth: number;
    maxCrawlPages: number;
    initialConcurrency: number;
    maxConcurrency: number;
    timeoutSeconds: number;
    saveHtml: boolean;
    saveMarkdown: boolean;
    useSitemaps: boolean;
}

export interface Progress extends Serializable {
    total: number;
    handled: number;
    modifiedAt: Date;
}

export interface LanguageCode {
    code?: string;
    detected: boolean;
}

export interface TicketUserContext extends Serializable {
    userName?: string;
    userEmail?: string;
    additionalContext?: { [index: string]: string };
    additionalPrompt?: string;
    additionalResponse?: string;
    contextualTicketId?: string;
}

export interface KnowledgeSpec extends Serializable {
    agentKnowledgeCorpusIds: string[];
    additionalCorpusIds: string[];
}

export interface PlaygroundContext {
    playgroundRunId: string;
    playgroundSurface: Surface;
    playgroundLlmPersona: LlmPersona;
}

export interface ExternallyIngestible {
}

export interface BotContext extends Serializable {
    actionId?: string;
    actionParameterSuggestions: ActionParameterSuggestion[];
    followUpQuestions: string[];
    sources: Source[];
    documents: ContextDocument[];
    consideredActions: ContextAction[];
    score?: number;
}

export interface ActionParameter extends Serializable {
    id?: string;
    label?: string;
    description?: string;
    validationType: ValidationType;
    required: boolean;
}

export interface Config extends Serializable {
    promptTemplateConfig: PromptTemplateConfig;
}

export interface AgentIntegrationConfig {
}

export interface ReferenceQuestion extends Serializable {
    question: string;
    expectedAnswer?: string;
}

export interface TicketDateStat {
    dateStart: string;
    dateStartMsSinceEpoch: number;
    count: number;
    coverage: number;
    avgHandleTimeMs: number;
    avgPredictedNps: number;
    userInteractionsCount: { [index: string]: number };
    surfaceCounts: { [P in Surface]?: number };
    sentimentCounts: { [P in Sentiment]?: number };
    qualityCounts: { [P in Quality]?: number };
    feedbackCounts: { [P in FeedbackType]?: number };
    firstResponseTimeMsPercentiles: { [index: string]: number };
}

export interface TicketSentimentStat {
    sentiment: Sentiment;
    count: number;
}

export interface TicketQualityStat {
    quality: Quality;
    count: number;
}

export interface TicketWithAnalysis extends Serializable {
    ticket: Ticket;
    humanAgentNames: string[];
    insertHumanAgentNames: string[];
    humanAgentResponseDelayMs?: number;
    handleTimeMs?: number;
    insertCount?: number;
    thumbsUpCount?: number;
    thumbsDownCount?: number;
    bailoutCount?: number;
    predictedNps?: number;
    sentiment?: Sentiment;
    quality: Quality;
    qualityScoreReason?: QualityScoreReason;
    humanAgentResponseDelayDisplay?: string;
    handleTimeDisplay?: string;
}

export interface InvolvedObjectDto {
    id: string;
    title: string;
    type: ObjectType;
    corpusId?: string;
}

export interface HelpCenterLocationDto {
    name: string;
    url: string;
}

export interface QuickKbCreateDto {
    name: string;
    url: string;
}

export interface Slice<T> extends Streamable<T> {
    size: number;
    content: T[];
    number: number;
    sort: Sort;
    first: boolean;
    pageable: Pageable;
    last: boolean;
    numberOfElements: number;
}

export interface ActionParameterSuggestion extends Serializable {
    fieldName: string;
    value?: string;
}

export interface Source extends Serializable {
    url: string;
    title?: string;
}

export interface ContextDocument extends Serializable {
    url?: string;
    title?: string;
    snippet: string;
    corpusId: string;
    documentId: string;
}

export interface ContextAction extends Serializable {
    id: string;
    externalId: string;
    searchStatus: ActionSearchStatus;
    name: string;
    description: string;
}

export interface PromptTemplateConfig extends Serializable {
    perUsageContextMap: { [P in LlmUsageContext]?: PerUsageContext };
}

export interface Streamable<T> extends Iterable<T>, Supplier<Stream<T>> {
    empty: boolean;
}

export interface Order extends Serializable {
    direction: Direction;
    property: string;
    ignoreCase: boolean;
    nullHandling: NullHandling;
    ascending: boolean;
    descending: boolean;
}

export interface PerUsageContext extends Serializable {
    perPersonaMap: { [P in LlmPersona]?: ModelAndPromptVersion };
}

export interface ModelAndPromptVersion extends Serializable {
    model: LlmModel;
    promptVersion: number;
}

export interface Iterable<T> {
}

export interface Supplier<T> {
}

export interface Stream<T> extends BaseStream<T, Stream<T>> {
}

export interface BaseStream<T, S> extends AutoCloseable {
    parallel: boolean;
}

export interface AutoCloseable {
}

export enum Permission {
    SUPER_USER = "SUPER_USER",
    ASK_AGENT = "ASK_AGENT",
    CREATE_AGENT = "CREATE_AGENT",
    CREATE_DOCUMENTS = "CREATE_DOCUMENTS",
    CREATE_MEMBERS = "CREATE_MEMBERS",
    CREATE_ORGANIZATION = "CREATE_ORGANIZATION",
    DELETE_AGENTS = "DELETE_AGENTS",
    DELETE_CONVERSATIONS = "DELETE_CONVERSATIONS",
    DELETE_DOCUMENTS = "DELETE_DOCUMENTS",
    DELETE_MEMBERS = "DELETE_MEMBERS",
    DELETE_ORGANIZATION = "DELETE_ORGANIZATION",
    EDIT_AGENTS = "EDIT_AGENTS",
    EDIT_CONVERSATIONS = "EDIT_CONVERSATIONS",
    EDIT_DOCUMENTS = "EDIT_DOCUMENTS",
    EDIT_MEMBERS = "EDIT_MEMBERS",
    EDIT_ORGANIZATION = "EDIT_ORGANIZATION",
    READ_AGENTS = "READ_AGENTS",
    READ_CONVERSATIONS = "READ_CONVERSATIONS",
    READ_DOCUMENTS = "READ_DOCUMENTS",
    READ_MEMBERS = "READ_MEMBERS",
    READ_ORGANIZATION = "READ_ORGANIZATION",
    READ_ALL_SLACK_AGENTS = "READ_ALL_SLACK_AGENTS",
}

export enum KnowledgeStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    PROCESSING = "PROCESSING",
    FAILED = "FAILED",
}

export enum LlmPersona {
    ANY = "ANY",
    CASUAL_BUDDY = "CASUAL_BUDDY",
    EMPATHETIC_SUPPORTER = "EMPATHETIC_SUPPORTER",
    FORMAL_PROFESSIONAL = "FORMAL_PROFESSIONAL",
    CONCISE_EXPERT = "CONCISE_EXPERT",
    ENTHUSIASTIC_HELPER = "ENTHUSIASTIC_HELPER",
    PATIENT_EDUCATOR = "PATIENT_EDUCATOR",
    PIRATE = "PIRATE",
}

export enum BailoutType {
    INTEGRATION = "INTEGRATION",
    TEXT = "TEXT",
}

export enum Integration {
    SALESFORCE = "SALESFORCE",
    ZENDESK = "ZENDESK",
    FRESHDESK = "FRESHDESK",
    SLACK_QA_BOT = "SLACK_QA_BOT",
    TWILIO = "TWILIO",
}

export enum SalesStatus {
    LIVE = "LIVE",
    ONBOARDING = "ONBOARDING",
    PROSPECT = "PROSPECT",
    TESTING = "TESTING",
    Z_INACTIVE = "Z_INACTIVE",
}

export enum AgentFields {
    LOGO = "logo",
    CHAT_ICON = "chatIcon",
}

export enum LlmUsageContext {
    SUMMARIZATION = "SUMMARIZATION",
    QUALITY_ANALYSIS = "QUALITY_ANALYSIS",
    TEXT_CATEGORIZATION = "TEXT_CATEGORIZATION",
    QA_SMS = "QA_SMS",
    QA_COPILOT = "QA_COPILOT",
    QA_CHAT = "QA_CHAT",
    QA_SEARCH = "QA_SEARCH",
}

export enum LlmModel {
    AZURE_GPT_4_TURBO_DEDICATED_0125_PREVIEW = "AZURE_GPT_4_TURBO_DEDICATED_0125_PREVIEW",
    AZURE_GPT_4_TURBO_DEDICATED_1106_PREVIEW = "AZURE_GPT_4_TURBO_DEDICATED_1106_PREVIEW",
    AZURE_GPT_4_TURBO_128K_1106_PREVIEW = "AZURE_GPT_4_TURBO_128K_1106_PREVIEW",
    AZURE_GPT_4_O = "AZURE_GPT_4_O",
    AZURE_GPT_4_32K_0613 = "AZURE_GPT_4_32K_0613",
    AZURE_GPT_35_TURBO_16K_0613 = "AZURE_GPT_35_TURBO_16K_0613",
    OPENAI_GPT_4_TURBO_128K_1106_PREVIEW = "OPENAI_GPT_4_TURBO_128K_1106_PREVIEW",
    OPENAI_GPT_4_32K_0613 = "OPENAI_GPT_4_32K_0613",
    OPENAI_GPT_35_TURBO_16K_0613 = "OPENAI_GPT_35_TURBO_16K_0613",
}

export enum SupportedLanguages {
    ENGLISH = "en",
    SPANISH = "es",
    FRENCH = "fr",
    GERMAN = "de",
    ITALIAN = "it",
    JAPANESE = "ja",
    CANTONESE = "yue",
    SIMPLIFIED_CHINESE = "zh-hans",
    TRADITIONAL_CHINESE = "zh-hant",
    PORTUGUESE = "pt",
    ARABIC = "ar",
    RUSSIAN = "ru",
    TURKISH = "tr",
    HINDI = "hi",
}

export enum TicketInsightsCategory {
    CATEGORY = "CATEGORY",
    TAG = "TAG",
    HUMAN_AGENT = "HUMAN_AGENT",
}

export enum Type {
    URL = "URL",
    MANUAL = "MANUAL",
    FILE_UPLOAD = "FILE_UPLOAD",
    EXTERNAL_INTEGRATION = "EXTERNAL_INTEGRATION",
    MAVEN_API = "MAVEN_API",
    RSS = "RSS",
    FRESHDESK_KB = "FRESHDESK_KB",
    ZENDESK_KB = "ZENDESK_KB",
    CSV = "CSV",
    UNKNOWN = "UNKNOWN",
}

export enum CorpusStatus {
    PROCESSING = "PROCESSING",
    READY = "READY",
    FAILED = "FAILED",
}

export enum RefreshFrequency {
    NONE = "NONE",
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
}

export enum HtmlTransformer {
    NONE = "NONE",
    EXTRACTUS = "EXTRACTUS",
    READABLE_TEXT = "READABLE_TEXT",
    READABLE_TEXT_IF_POSSIBLE = "READABLE_TEXT_IF_POSSIBLE",
}

export enum Status {
    CREATING = "CREATING",
    READY = "READY",
    RUNNING = "RUNNING",
    TIMING_OUT = "TIMING_OUT",
    ABORTING = "ABORTING",
    SUCCEEDED = "SUCCEEDED",
    FAILED = "FAILED",
    TIMED_OUT = "TIMED_OUT",
    ABORTED = "ABORTED",
    UNKNOWN = "UNKNOWN",
}

export enum CorpusPolicy {
    INCLUDE = "INCLUDE",
    EXCLUDE_ALWAYS = "EXCLUDE_ALWAYS",
}

export enum ChunkingStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
}

export enum FeedbackType {
    THUMBS_UP = "THUMBS_UP",
    THUMBS_DOWN = "THUMBS_DOWN",
    INSERT = "INSERT",
    HANDOFF = "HANDOFF",
}

export enum Surface {
    WEB = "WEB",
    CHATBOT = "CHATBOT",
    SMS = "SMS",
    WHATSAPP = "WHATSAPP",
    SLACK = "SLACK",
    COPILOT = "COPILOT",
    COPILOT_CHAT = "COPILOT_CHAT",
    INSTANT_ANSWER = "INSTANT_ANSWER",
    PLAYGROUND = "PLAYGROUND",
    INTERNAL = "INTERNAL",
}

export enum Sentiment {
    POSITIVE = "POSITIVE",
    NEGATIVE = "NEGATIVE",
    NEUTRAL = "NEUTRAL",
    MIXED = "MIXED",
    UNKNOWN = "UNKNOWN",
}

export enum MessageType {
    USER = "USER",
    BOT_RESPONSE = "BOT_RESPONSE",
    BOT_SUGGESTION = "BOT_SUGGESTION",
    HUMAN_AGENT = "HUMAN_AGENT",
    EXTERNAL_SYSTEM = "EXTERNAL_SYSTEM",
    ACTION_RESPONSE = "ACTION_RESPONSE",
}

export enum TicketMessageStatus {
    QUEUED = "QUEUED",
    SENDING = "SENDING",
    SENT = "SENT",
    FAILED = "FAILED",
    DELIVERED = "DELIVERED",
    UNDELIVERED = "UNDELIVERED",
    RECEIVING = "RECEIVING",
    RECEIVED = "RECEIVED",
    ACCEPTED = "ACCEPTED",
    SCHEDULED = "SCHEDULED",
    READ = "READ",
    PARTIALLY_DELIVERED = "PARTIALLY_DELIVERED",
    CANCELED = "CANCELED",
    REJECTED = "REJECTED",
    UNKNOWN = "UNKNOWN",
}

export enum TicketMessageStatusReason {
    UNKNOWN = "UNKNOWN",
    CONTENT_SAFETY_ISSUE = "CONTENT_SAFETY_ISSUE",
}

export enum Quality {
    GOOD = "GOOD",
    PERFECT = "PERFECT",
    GREAT = "GREAT",
    OK = "OK",
    POOR = "POOR",
    UNKNOWN = "UNKNOWN",
}

export enum QualityScoreReason {
    MISSING_GENERAL_KNOWLEDGE = "MISSING_GENERAL_KNOWLEDGE",
    MISSING_USER_CONTEXT = "MISSING_USER_CONTEXT",
    CANT_TAKE_ACTION = "CANT_TAKE_ACTION",
    NEEDS_USER_CLARIFICATION = "NEEDS_USER_CLARIFICATION",
    UNSUPPORTED_QUESTION_FORMAT = "UNSUPPORTED_QUESTION_FORMAT",
    GREAT_ANSWER = "GREAT_ANSWER",
    UNRESOLVED = "UNRESOLVED",
    UNSUPPORTED_USER_BEHAVIOR = "UNSUPPORTED_USER_BEHAVIOR",
    UNKNOWN = "UNKNOWN",
}

export enum ActionSearchStatus {
    INCLUDE = "INCLUDE",
    EXCLUDE = "EXCLUDE",
    PIN = "PIN",
}

export enum UserIdentifierType {
    PHONE_NUMBER = "PHONE_NUMBER",
    EMAIL = "EMAIL",
}

export enum Role {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    READER = "READER",
}

export enum EvalStatus {
    PROCESSING = "PROCESSING",
    READY = "READY",
    FAILED = "FAILED",
}

export enum ReferenceSetType {
    MANUAL = "MANUAL",
    CSV = "CSV",
}

export enum InboxItemStatus {
    OPEN = "OPEN",
    USER_RESOLVED = "USER_RESOLVED",
    SYSTEM_RESOLVED = "SYSTEM_RESOLVED",
    REGRESSED = "REGRESSED",
    IGNORED = "IGNORED",
    PENDING = "PENDING",
}

export enum Severity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
}

export enum InboxItemType {
    DUPLICATE_DOCUMENT = "DUPLICATE_DOCUMENT",
    DUPLICATE_CORPUS = "DUPLICATE_CORPUS",
    BAD_DOCUMENT = "BAD_DOCUMENT",
    MISSING_KNOWLEDGE = "MISSING_KNOWLEDGE",
}

export enum TriggerType {
    CONVERSATION_CREATED = "CONVERSATION_CREATED",
    FEEDBACK_CREATED = "FEEDBACK_CREATED",
}

export enum FixType {
    REMOVE_DOCUMENT = "REMOVE_DOCUMENT",
    DEACTIVATE_CORPUS = "DEACTIVATE_CORPUS",
    EDIT_DOCUMENT = "EDIT_DOCUMENT",
    ADD_DOCUMENT = "ADD_DOCUMENT",
}

export enum ValidationType {
    STRING = "STRING",
    BOOLEAN = "BOOLEAN",
    NUMBER = "NUMBER",
}

export enum ObjectType {
    CORPUS = "CORPUS",
    DOCUMENT = "DOCUMENT",
}

export enum Direction {
    ASC = "ASC",
    DESC = "DESC",
}

export enum NullHandling {
    NATIVE = "NATIVE",
    NULLS_FIRST = "NULLS_FIRST",
    NULLS_LAST = "NULLS_LAST",
}
