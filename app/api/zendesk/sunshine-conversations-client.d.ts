declare module 'sunshine-conversations-client' {
  export class ApiClient {
    static instance: ApiClient;
    basePath: string;
    authentications: {
      basicAuth: {
        username: string;
        password: string;
      };
    };
    UsersApi: typeof UsersApi;
    ConversationsApi: typeof ConversationsApi;
    MessagesApi: typeof MessagesApi;
    SwitchboardActionsApi: typeof SwitchboardActionsApi;
    UserCreateBody: typeof UserCreateBody;
    ConversationCreateBody: typeof ConversationCreateBody;
  }

  // Model classes
  export class AcceptControlBody {}
  export class Action {}
  export class Activity {}
  export class App {}
  export class AppKey {}
  export class Conversation {}
  export class Client {}
  export class Message {}
  export class User {}
  export class Webhook {}

  // API classes
  export class ActivitiesApi {
    constructor();
    postActivity(appId: string, conversationId: string, activityPost: any): Promise<any>;
  }

  export class AppsApi {
    constructor();
    createApp(appCreateBody: any): Promise<any>;
    deleteApp(appId: string): Promise<any>;
    getApp(appId: string): Promise<any>;
    listApps(page?: number, filter?: any): Promise<any>;
    updateApp(appId: string, appUpdateBody: any): Promise<any>;
  }

  export class ConversationsApi {
    constructor();
    createConversation(appId: string, conversationCreateBody: any): Promise<any>;
    deleteConversation(appId: string, conversationId: string): Promise<any>;
    getConversation(appId: string, conversationId: string): Promise<any>;
    listConversations(appId: string, filter?: any, options?: any): Promise<any>;
    updateConversation(appId: string, conversationId: string, conversationUpdateBody: any): Promise<any>;
  }

  export class MessagesApi {
    constructor();
    postMessage(appId: string, conversationId: string, messagePost: any): Promise<any>;
    listMessages(appId: string, conversationId: string, page?: number): Promise<any>;
  }

  export class UsersApi {
    constructor();
    createUser(appId: string, userCreateBody: any): Promise<any>;
    deleteUser(appId: string, userIdOrExternalId: string): Promise<any>;
    getUser(appId: string, userIdOrExternalId: string): Promise<any>;
    updateUser(appId: string, userIdOrExternalId: string, userUpdateBody: any): Promise<any>;
  }

  export class WebhooksApi {
    constructor();
    createWebhook(appId: string, webhookCreateBody: any): Promise<any>;
    deleteWebhook(appId: string, webhookId: string): Promise<any>;
    getWebhook(appId: string, webhookId: string): Promise<any>;
    listWebhooks(appId: string): Promise<any>;
    updateWebhook(appId: string, webhookId: string, webhookUpdateBody: any): Promise<any>;
  }

  class ConversationCreateBody {
    constructor(type: string);
    setParticipants(participants: any): void;
    setDisplayName(displayName: string): void;
    setDescription(description: string): void;
  }

  export class SwitchboardActionsApi {
    constructor();
    passControl(appId: string, conversationId: string, acceptControlBody: any): Promise<any>;
  }
}
