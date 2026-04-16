export interface paths {
  '/biomarkers/summary/{category}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['v1.biomarkers.getSummary'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/messages': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['v1.chat.getMessages'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/{chatId}/messages': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['v1.chat.getChatMessages'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/{chatId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['v1.chat.getChat'];
    put?: never;
    post: operations['v1.chat.updateChat'];
    delete: operations['v1.chat.deleteChat'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['v1.chat.generateResponse'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/followup': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['v1.chat.generateSuggestions'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/{chatId}/stream': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['v1.chat.resumeStream'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  v2: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['v1.chatV2.generateResponse'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  'v2/{chatId}/stream': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['v1.chatV2.resumeStream'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  'v2/stream': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['v1.chatV2.resumeStreamForUser'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/history': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['v1.history.getHistory'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/protocol-v2': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['v1.protocols.list'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/protocol-v2/latest': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['v1.protocols.latest'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/protocol-v2/{protocolId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['v1.protocols.getById'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/protocol-v2/{protocolId}/actions/{actionId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: operations['v1.protocols.updateAction'];
    trace?: never;
  };
  '/protocol-v2/generation-status/{diagnosticReportId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['v1.protocols.generationStatus'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/protocol-v2/reveal/latest': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['v1.protocolReveal.latest'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/protocol-v2/reveal/{protocolId}/phase/{phase}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['v1.protocolReveal.markPhaseComplete'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/protocol-v2/reveal/{protocolId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete: operations['v1.protocolReveal.reset'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/protocol-v2/reveal/{protocolId}/shopify': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['v1.protocolReveal.saveShopifyOrder'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: never;
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  'v1.biomarkers.getSummary': {
    parameters: {
      query?: never;
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path: {
        category: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            category: string;
            summary: string;
            /** Format: date-time */
            lastUpdatedAt: string;
            /** Format: date-time */
            generatedAt: string;
          };
        };
      };
      /** @description 400 */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'INVALID_CATEGORY';
                /** @constant */
                status: 400;
                /** @default Invalid biomarker category. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
      /** @description 401 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'UNAUTHORIZED';
                /** @constant */
                status: 401;
                /** @default Unauthorized. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
      /** @description 404 */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'NO_DATA';
                /** @constant */
                status: 404;
                /** @default No biomarker or memory data available for this patient. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.chat.getMessages': {
    parameters: {
      query?: {
        cursor?: {
          /** Format: uuid */
          id: string;
        };
        sort?: 'asc' | 'desc';
        limit?: number;
      };
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': unknown[];
        };
      };
      /** @description 401 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'UNAUTHORIZED';
                /** @constant */
                status: 401;
                /** @default Authentication required. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.chat.getChatMessages': {
    parameters: {
      query?: {
        cursor?: {
          /** Format: uuid */
          id: string;
        };
        sort?: 'asc' | 'desc';
        limit?: number;
      };
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path: {
        chatId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': unknown[];
        };
      };
      /** @description 404 */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'CHAT_NOT_FOUND';
                /** @constant */
                status: 404;
                /** @default Chat not found. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.chat.getChat': {
    parameters: {
      query?: never;
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path: {
        chatId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            createdAt: string;
            title: string;
            userId: string;
            /**
             * @default private
             * @enum {string}
             */
            visibility: 'public' | 'private';
          };
        };
      };
      /** @description 404 */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'CHAT_NOT_FOUND';
                /** @constant */
                status: 404;
                /** @default Chat not found. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.chat.updateChat': {
    parameters: {
      query?: never;
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path: {
        chatId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          title?: string;
          /** @enum {string} */
          visibility?: 'public' | 'private';
        };
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            createdAt: string;
            title: string;
            userId: string;
            /**
             * @default private
             * @enum {string}
             */
            visibility: 'public' | 'private';
          };
        };
      };
      /** @description 401 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'UNAUTHORIZED';
                /** @constant */
                status: 401;
                /** @default Unauthorized. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
      /** @description 404 */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'CHAT_NOT_FOUND';
                /** @constant */
                status: 404;
                /** @default Chat not found. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.chat.deleteChat': {
    parameters: {
      query?: never;
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path: {
        chatId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            createdAt: string;
            title: string;
            userId: string;
            /**
             * @default private
             * @enum {string}
             */
            visibility: 'public' | 'private';
          };
        };
      };
      /** @description 401 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'UNAUTHORIZED';
                /** @constant */
                status: 401;
                /** @default Unauthorized. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
      /** @description 404 */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'CHAT_NOT_FOUND';
                /** @constant */
                status: 404;
                /** @default Chat not found. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.chat.generateResponse': {
    parameters: {
      query?: never;
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          id?: string | null;
          /** @description The user message to append to the chat. */
          message: {
            id?: string;
            messageId?: string;
            /** @constant */
            role: 'user';
            parts?: (
              | string
              | ({
                  /** @constant */
                  type: 'text';
                  text?: string;
                  content?: string;
                  value?: string;
                  data?: string;
                } & {
                  [key: string]: unknown;
                })
              | ({
                  /** @constant */
                  type: 'file';
                  url?: string;
                  data?: string;
                  fileUrl?: string;
                  fileId?: string;
                  filename?: string;
                  fileName?: string;
                  name?: string;
                } & {
                  [key: string]: unknown;
                })
            )[];
            content?: string;
          } & {
            [key: string]: unknown;
          };
          /**
           * @description Whether to generate suggestions.
           * @default true
           */
          _followup?: boolean;
        };
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': unknown;
        };
      };
      /** @description 401 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'UNAUTHORIZED';
                /** @constant */
                status: 401;
                /** @default Unauthorized. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.chat.generateSuggestions': {
    parameters: {
      query?: never;
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          /** @description Additional context to generate suggestions against. */
          context?: string;
          /**
           * @description Number of suggestions to generate (1-3).
           * @default 3
           */
          count?: number;
        };
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': string[];
        };
      };
      /** @description 401 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'UNAUTHORIZED';
                /** @constant */
                status: 401;
                /** @default Unauthorized. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.chat.resumeStream': {
    parameters: {
      query?: never;
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path: {
        chatId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Active stream available */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': unknown;
        };
      };
      /** @description No active stream */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  'v1.chatV2.generateResponse': {
    parameters: {
      query?: never;
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          id?: string | null;
          /** @description The user message to append to the chat. */
          message: unknown;
        };
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': unknown;
        };
      };
      /** @description 400 */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'ASSISTANT_RESPONSE_IN_PROGRESS';
                /** @constant */
                status: 400;
                /** @default An assistant response is already being generated for this user. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'CHATLESS_NOT_AVAILABLE';
                /** @constant */
                status: 400;
                /** @default Chatless mode is not available in this environment. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
      /** @description 401 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'UNAUTHORIZED';
                /** @constant */
                status: 401;
                /** @default Unauthorized. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
      /** @description 409 */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'CHAT_ID_CONFLICT';
                /** @constant */
                status: 409;
                /** @default A chat with the same ID already exists. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'MESSAGE_ID_CONFLICT';
                /** @constant */
                status: 409;
                /** @default A message with the same ID already exists. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.chatV2.resumeStream': {
    parameters: {
      query?: never;
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path: {
        chatId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Active stream available */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': unknown;
        };
      };
      /** @description No active stream */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  'v1.chatV2.resumeStreamForUser': {
    parameters: {
      query?: {
        chatId?: string | null;
      };
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Active stream available */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': unknown;
        };
      };
      /** @description No active stream */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  'v1.history.getHistory': {
    parameters: {
      query?: {
        cursor?: {
          /** Format: uuid */
          id: string;
        };
        limit?: number;
      };
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': unknown | unknown;
        };
      };
      /** @description 401 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'UNAUTHORIZED';
                /** @constant */
                status: 401;
                /** @default Unauthorized. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.protocols.list': {
    parameters: {
      query?: {
        status?: 'draft' | 'active' | 'completed' | 'revoked' | 'superseded';
      };
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            protocols: {
              id: string;
              createdAt: string;
              updatedAt: string;
              /**
               * @default active
               * @enum {string}
               */
              status:
                | 'draft'
                | 'active'
                | 'completed'
                | 'revoked'
                | 'superseded';
              userId: string;
              serviceRequestId?: string;
              requestGroupId?: string;
              diagnosticReportId?: string;
              carePlanId?: string;
              /** @default true */
              shouldReveal: boolean;
              metadata: {
                generatedAt: string;
                /** @enum {string} */
                generationReason: 'new-results' | 'regeneration' | 'manual';
                /** @default v1.0 */
                promptVersion: string;
                pipelineVersion?: string;
                communicationPreferences: {
                  technicalLevelNumber: number;
                  /**
                   * @default moderate
                   * @enum {string}
                   */
                  technicalLevel: 'layman' | 'moderate' | 'very-technical';
                };
                modelsUsed?: {
                  [key: string]: string;
                };
                totalLatencyMs?: number;
                estimatedCostUsd?: number;
              };
              goals: {
                id: string;
                number: number;
                /** @default custom */
                templateId: string;
                modifications?: string;
                title: string;
                subtitle?: string;
                description: string;
                possibleSymptoms: string[];
                biomarkers: string[];
                impactContent: string;
                titleCopyVariations: {
                  keyActionTitle?: string;
                  additionalActionTitle?: string;
                };
                recoveryTime?: string;
                primaryAction: {
                  id: string;
                  accepted: boolean | null;
                  acceptedAt?: string;
                  title: string;
                  description: string;
                  additionalContent?: string;
                  citations?: {
                    title: string;
                    journal?: string;
                    year?: number;
                    authors?: string;
                    doi?: string;
                    url?: string;
                  }[];
                  content:
                    | {
                        /** @constant */
                        type: 'supplement';
                        productId?: string;
                        todoTitle?: string;
                        why: string;
                        lookOutFor: string;
                      }
                    | {
                        /** @constant */
                        type: 'prescription';
                        rxId?: string;
                      }
                    | {
                        /** @constant */
                        type: 'testing';
                        testPanelId?: string;
                      }
                    | {
                        /** @constant */
                        type: 'lifestyle';
                        /** @enum {string} */
                        category: 'exercise' | 'nutrition' | 'general';
                        todoTitle?: string;
                      }
                    | {
                        /** @constant */
                        type: 'consultation';
                      };
                };
                additionalActions?: {
                  id: string;
                  accepted: boolean | null;
                  acceptedAt?: string;
                  title: string;
                  description: string;
                  additionalContent?: string;
                  citations?: {
                    title: string;
                    journal?: string;
                    year?: number;
                    authors?: string;
                    doi?: string;
                    url?: string;
                  }[];
                  content:
                    | {
                        /** @constant */
                        type: 'supplement';
                        productId?: string;
                        todoTitle?: string;
                        why: string;
                        lookOutFor: string;
                      }
                    | {
                        /** @constant */
                        type: 'prescription';
                        rxId?: string;
                      }
                    | {
                        /** @constant */
                        type: 'testing';
                        testPanelId?: string;
                      }
                    | {
                        /** @constant */
                        type: 'lifestyle';
                        /** @enum {string} */
                        category: 'exercise' | 'nutrition' | 'general';
                        todoTitle?: string;
                      }
                    | {
                        /** @constant */
                        type: 'consultation';
                      };
                }[];
              }[];
            }[];
          };
        };
      };
      /** @description 401 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'UNAUTHORIZED';
                /** @constant */
                status: 401;
                /** @default Unauthorized. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.protocols.latest': {
    parameters: {
      query?: never;
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            protocol: {
              id: string;
              createdAt: string;
              updatedAt: string;
              /**
               * @default active
               * @enum {string}
               */
              status:
                | 'draft'
                | 'active'
                | 'completed'
                | 'revoked'
                | 'superseded';
              userId: string;
              serviceRequestId?: string;
              requestGroupId?: string;
              diagnosticReportId?: string;
              carePlanId?: string;
              /** @default true */
              shouldReveal: boolean;
              metadata: {
                generatedAt: string;
                /** @enum {string} */
                generationReason: 'new-results' | 'regeneration' | 'manual';
                /** @default v1.0 */
                promptVersion: string;
                pipelineVersion?: string;
                communicationPreferences: {
                  technicalLevelNumber: number;
                  /**
                   * @default moderate
                   * @enum {string}
                   */
                  technicalLevel: 'layman' | 'moderate' | 'very-technical';
                };
                modelsUsed?: {
                  [key: string]: string;
                };
                totalLatencyMs?: number;
                estimatedCostUsd?: number;
              };
              goals: {
                id: string;
                number: number;
                /** @default custom */
                templateId: string;
                modifications?: string;
                title: string;
                subtitle?: string;
                description: string;
                possibleSymptoms: string[];
                biomarkers: string[];
                impactContent: string;
                titleCopyVariations: {
                  keyActionTitle?: string;
                  additionalActionTitle?: string;
                };
                recoveryTime?: string;
                primaryAction: {
                  id: string;
                  accepted: boolean | null;
                  acceptedAt?: string;
                  title: string;
                  description: string;
                  additionalContent?: string;
                  citations?: {
                    title: string;
                    journal?: string;
                    year?: number;
                    authors?: string;
                    doi?: string;
                    url?: string;
                  }[];
                  content:
                    | {
                        /** @constant */
                        type: 'supplement';
                        productId?: string;
                        todoTitle?: string;
                        why: string;
                        lookOutFor: string;
                      }
                    | {
                        /** @constant */
                        type: 'prescription';
                        rxId?: string;
                      }
                    | {
                        /** @constant */
                        type: 'testing';
                        testPanelId?: string;
                      }
                    | {
                        /** @constant */
                        type: 'lifestyle';
                        /** @enum {string} */
                        category: 'exercise' | 'nutrition' | 'general';
                        todoTitle?: string;
                      }
                    | {
                        /** @constant */
                        type: 'consultation';
                      };
                };
                additionalActions?: {
                  id: string;
                  accepted: boolean | null;
                  acceptedAt?: string;
                  title: string;
                  description: string;
                  additionalContent?: string;
                  citations?: {
                    title: string;
                    journal?: string;
                    year?: number;
                    authors?: string;
                    doi?: string;
                    url?: string;
                  }[];
                  content:
                    | {
                        /** @constant */
                        type: 'supplement';
                        productId?: string;
                        todoTitle?: string;
                        why: string;
                        lookOutFor: string;
                      }
                    | {
                        /** @constant */
                        type: 'prescription';
                        rxId?: string;
                      }
                    | {
                        /** @constant */
                        type: 'testing';
                        testPanelId?: string;
                      }
                    | {
                        /** @constant */
                        type: 'lifestyle';
                        /** @enum {string} */
                        category: 'exercise' | 'nutrition' | 'general';
                        todoTitle?: string;
                      }
                    | {
                        /** @constant */
                        type: 'consultation';
                      };
                }[];
              }[];
            } | null;
          };
        };
      };
      /** @description 401 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'UNAUTHORIZED';
                /** @constant */
                status: 401;
                /** @default Unauthorized. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.protocols.getById': {
    parameters: {
      query?: never;
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path: {
        protocolId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            protocol: {
              id: string;
              createdAt: string;
              updatedAt: string;
              /**
               * @default active
               * @enum {string}
               */
              status:
                | 'draft'
                | 'active'
                | 'completed'
                | 'revoked'
                | 'superseded';
              userId: string;
              serviceRequestId?: string;
              requestGroupId?: string;
              diagnosticReportId?: string;
              carePlanId?: string;
              /** @default true */
              shouldReveal: boolean;
              metadata: {
                generatedAt: string;
                /** @enum {string} */
                generationReason: 'new-results' | 'regeneration' | 'manual';
                /** @default v1.0 */
                promptVersion: string;
                pipelineVersion?: string;
                communicationPreferences: {
                  technicalLevelNumber: number;
                  /**
                   * @default moderate
                   * @enum {string}
                   */
                  technicalLevel: 'layman' | 'moderate' | 'very-technical';
                };
                modelsUsed?: {
                  [key: string]: string;
                };
                totalLatencyMs?: number;
                estimatedCostUsd?: number;
              };
              goals: {
                id: string;
                number: number;
                /** @default custom */
                templateId: string;
                modifications?: string;
                title: string;
                subtitle?: string;
                description: string;
                possibleSymptoms: string[];
                biomarkers: string[];
                impactContent: string;
                titleCopyVariations: {
                  keyActionTitle?: string;
                  additionalActionTitle?: string;
                };
                recoveryTime?: string;
                primaryAction: {
                  id: string;
                  accepted: boolean | null;
                  acceptedAt?: string;
                  title: string;
                  description: string;
                  additionalContent?: string;
                  citations?: {
                    title: string;
                    journal?: string;
                    year?: number;
                    authors?: string;
                    doi?: string;
                    url?: string;
                  }[];
                  content:
                    | {
                        /** @constant */
                        type: 'supplement';
                        productId?: string;
                        todoTitle?: string;
                        why: string;
                        lookOutFor: string;
                      }
                    | {
                        /** @constant */
                        type: 'prescription';
                        rxId?: string;
                      }
                    | {
                        /** @constant */
                        type: 'testing';
                        testPanelId?: string;
                      }
                    | {
                        /** @constant */
                        type: 'lifestyle';
                        /** @enum {string} */
                        category: 'exercise' | 'nutrition' | 'general';
                        todoTitle?: string;
                      }
                    | {
                        /** @constant */
                        type: 'consultation';
                      };
                };
                additionalActions?: {
                  id: string;
                  accepted: boolean | null;
                  acceptedAt?: string;
                  title: string;
                  description: string;
                  additionalContent?: string;
                  citations?: {
                    title: string;
                    journal?: string;
                    year?: number;
                    authors?: string;
                    doi?: string;
                    url?: string;
                  }[];
                  content:
                    | {
                        /** @constant */
                        type: 'supplement';
                        productId?: string;
                        todoTitle?: string;
                        why: string;
                        lookOutFor: string;
                      }
                    | {
                        /** @constant */
                        type: 'prescription';
                        rxId?: string;
                      }
                    | {
                        /** @constant */
                        type: 'testing';
                        testPanelId?: string;
                      }
                    | {
                        /** @constant */
                        type: 'lifestyle';
                        /** @enum {string} */
                        category: 'exercise' | 'nutrition' | 'general';
                        todoTitle?: string;
                      }
                    | {
                        /** @constant */
                        type: 'consultation';
                      };
                }[];
              }[];
            };
          };
        };
      };
      /** @description 401 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'UNAUTHORIZED';
                /** @constant */
                status: 401;
                /** @default Unauthorized. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
      /** @description 404 */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'NOT_FOUND';
                /** @constant */
                status: 404;
                /** @default Protocol not found. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.protocols.updateAction': {
    parameters: {
      query?: never;
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path: {
        protocolId: string;
        actionId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          accepted: boolean;
        };
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            accepted: boolean;
            acceptedAt: string | null;
          };
        };
      };
      /** @description 401 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'UNAUTHORIZED';
                /** @constant */
                status: 401;
                /** @default Unauthorized. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
      /** @description 404 */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'NOT_FOUND';
                /** @constant */
                status: 404;
                /** @default Action not found. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.protocols.generationStatus': {
    parameters: {
      query?: never;
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path: {
        diagnosticReportId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            pipelineRun: {
              id: string;
              status: string;
              createdAt: string;
              completedAt: string | null;
              durationMs: number | null;
              protocolId: string | null;
              error: string | null;
              generationReason: string;
            } | null;
          };
        };
      };
      /** @description 401 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'UNAUTHORIZED';
                /** @constant */
                status: 401;
                /** @default Unauthorized. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.protocolReveal.latest': {
    parameters: {
      query?: never;
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            shouldShow: boolean;
            protocolId: string | null;
            reveal: {
              id: string;
              protocolId: string;
              introCompletedAt: string | null;
              overviewCompletedAt: string | null;
              educationCompletedAt: string | null;
              goalsCompletedAt: string | null;
              completedAt: string | null;
              shopifyDraftOrderId: string | null;
              shopifyInvoiceUrl: string | null;
              createdAt: string;
              updatedAt: string;
            } | null;
            lastCompletedPhase:
              | ('intro' | 'overview' | 'education' | 'goals' | 'completed')
              | 'not_started';
          };
        };
      };
      /** @description 401 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'UNAUTHORIZED';
                /** @constant */
                status: 401;
                /** @default Unauthorized. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.protocolReveal.markPhaseComplete': {
    parameters: {
      query?: never;
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path: {
        protocolId: string;
        phase: 'intro' | 'overview' | 'education' | 'goals' | 'completed';
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            reveal: {
              id: string;
              protocolId: string;
              introCompletedAt: string | null;
              overviewCompletedAt: string | null;
              educationCompletedAt: string | null;
              goalsCompletedAt: string | null;
              completedAt: string | null;
              shopifyDraftOrderId: string | null;
              shopifyInvoiceUrl: string | null;
              createdAt: string;
              updatedAt: string;
            };
          };
        };
      };
      /** @description 400 */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'BAD_REQUEST';
                /** @constant */
                status: 400;
                /** @default Invalid phase. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
      /** @description 401 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'UNAUTHORIZED';
                /** @constant */
                status: 401;
                /** @default Unauthorized. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
      /** @description 404 */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'NOT_FOUND';
                /** @constant */
                status: 404;
                /** @default Protocol reveal not found. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.protocolReveal.reset': {
    parameters: {
      query?: never;
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path: {
        protocolId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            ok: boolean;
          };
        };
      };
      /** @description 401 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'UNAUTHORIZED';
                /** @constant */
                status: 401;
                /** @default Unauthorized. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
      /** @description 403 */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'FORBIDDEN';
                /** @constant */
                status: 403;
                /** @default Not available in this environment. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
      /** @description 404 */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'NOT_FOUND';
                /** @constant */
                status: 404;
                /** @default Protocol reveal not found. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
  'v1.protocolReveal.saveShopifyOrder': {
    parameters: {
      query?: never;
      header?: {
        authorization?: string;
        'x-user-id'?: string;
      };
      path: {
        protocolId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': {
          draftOrderId: string;
          /** Format: uri */
          invoiceUrl: string;
        };
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            reveal: {
              id: string;
              protocolId: string;
              introCompletedAt: string | null;
              overviewCompletedAt: string | null;
              educationCompletedAt: string | null;
              goalsCompletedAt: string | null;
              completedAt: string | null;
              shopifyDraftOrderId: string | null;
              shopifyInvoiceUrl: string | null;
              createdAt: string;
              updatedAt: string;
            };
          };
        };
      };
      /** @description 401 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'UNAUTHORIZED';
                /** @constant */
                status: 401;
                /** @default Unauthorized. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
      /** @description 404 */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | {
                /** @constant */
                defined: true;
                /** @constant */
                code: 'NOT_FOUND';
                /** @constant */
                status: 404;
                /** @default Protocol reveal not found. */
                message: string;
                data?: unknown;
              }
            | {
                /** @constant */
                defined: false;
                code: string;
                status: number;
                message: string;
                data?: unknown;
              };
        };
      };
    };
  };
}
