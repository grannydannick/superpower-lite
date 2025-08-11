import { CarePlan, Goal } from '@medplum/fhirtypes';

import {
  INTAKE_QUESTIONNAIRE,
  ONBOARDING_SCREENING,
  RX_ASSESSMENT_GHK_CU,
} from '@/const/questionnaire';

export type BaseEntity = {
  id: string;
};

export type Entity<T> = {
  [K in keyof T]: T[K];
} & BaseEntity;

export type IdentityVerificationStatus = 'VERIFIED' | 'REQUIRES_INPUT';

/* USER */
export type UserIdentity = {
  sessionId: string;
  userId: string;
  reportId: string;
  status: IdentityVerificationStatus;
  verifiedAt: Date;
};

export type UserRole = 'MEMBER' | 'SUPER_ADMIN';

interface BaseUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

export interface AdminUser extends BaseUser {
  stripeCustomerId: string;
  _count: {
    observations: number;
    serviceRequests: number;
  };
  rdnUserAssignment?: RdnUserAssignment;
}

export interface User extends BaseUser {
  gender: string;
  subscribed: boolean;
  admin: boolean;
  carePlan?: string;
  authMethod: 'admin' | 'password';
  address: Address[];
  primaryAddress?: Address;
  adminActor?: AdminActor;
  userIdentity?: UserIdentity;
  role: UserRole[];
  rdn?: Rdn;
}

export type AdminActor = Entity<{
  firstName: string;
  lastName: string;
  email: string;
}>;

/* AUTH */
export type LoginAuthenticationResponse = {
  login: string;
  code?: string;
};

export type TokenResponse = {
  token_type: string;
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  profile: { userId: string };
};

/**
 /**
 * OAuth 2.0 Grant Type Identifiers
 * Standard identifiers defined here: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-07#name-grant-types
 * Token exchange extension defined here: https://datatracker.ietf.org/doc/html/rfc8693
 */
export enum OAuthGrantType {
  ClientCredentials = 'client_credentials',
  AuthorizationCode = 'authorization_code',
  RefreshToken = 'refresh_token',
  TokenExchange = 'urn:ietf:params:oauth:grant-type:token-exchange',
}

export type LoginState = {
  profile: { userId: string };
  accessToken: string;
  refreshToken: string;
};

/* API ERRORS */

export enum IssueSeverity {
  INFOROMATION = 'information',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal',
}

export type OperationOutcomeIssue = {
  severity: IssueSeverity;
  code?: string;
  details: {
    text: string;
  };
  expression?: string[];
};

export type OperationOutcome = {
  id?: string;
  resourceType?: string;
  issue: OperationOutcomeIssue[];
};

/* QUESTIONNAIRE */
export type QuestionnaireName =
  | typeof INTAKE_QUESTIONNAIRE
  | typeof ONBOARDING_SCREENING
  | typeof RX_ASSESSMENT_GHK_CU;

/* TASK */
export type Task = {
  id?: string;
  reason: string;
  name: TaskName;
  status:
    | 'draft'
    | 'requested'
    | 'received'
    | 'accepted'
    | 'rejected'
    | 'ready'
    | 'cancelled'
    | 'in-progress'
    | 'on-hold'
    | 'failed'
    | 'completed'
    | 'entered-in-error';
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';
  progress?: number;
};

export type TaskName =
  | 'onboarding-insurance'
  | 'onboarding'
  | 'onboarding-wearable'
  | 'onboarding-identity';

/* HEALTHCARE SERVICE */
export type HealthcareService = Entity<{
  name: string;
  description: string | undefined;
  method: 'at_home_phlebotomy' | 'testkit';
  price: number;
  active: boolean;
  phlebotomy: boolean;
  image?: string;
  items: ServiceItem[];
  sampleReportLink?: string;
}>;

export type Coupon = {
  amount_off: number | null;
  percent_off: number | null;
};

/* BIOMARKERS */
export type Biomarker = Entity<{
  id?: string;
  name: string;
  description: string;
  importance: string;
  status: BiomarkerStatus;
  category: string;
  unit: string;
  favorite: boolean;
  range: Range[];
  value: BiomarkerResult[];
  metadata: BiomarkerMetadata;
}>;

export type BiomarkerComponent = {
  category?: string;
  title: string;
  value: string;
};

export type BiomarkerResult = Entity<{
  quantity: Quantity;
  timestamp: string;
  status?: BiomarkerStatus;
  orderId?: string;
  component: BiomarkerComponent[];
}>;

export interface BiomarkerMetadata {
  source: MetadataSource[];
  content: MetadataContent[];
}

export interface MetadataSource {
  text: string;
  url: string;
}

export interface MetadataContent {
  title: string;
  text: string;
  status: BiomarkerStatus;
}

export type BiomarkerStatus =
  | 'LOW'
  | 'HIGH'
  | 'NORMAL'
  | 'OPTIMAL'
  | 'UNKNOWN'
  | 'PENDING';

export interface Range {
  low?: {
    value: number;
    unit?: string;
  };
  high?: {
    value: number;
    unit?: string;
  };
  status: BiomarkerStatus;
}

export interface Quantity {
  value: number;
  comparator: Comparator;
  unit?: string;
}

export type Comparator =
  | 'LESS_THAN'
  | 'LESS_THAN_EQUALS'
  | 'EQUALS'
  | 'GREATER_THAN_EQUALS'
  | 'GREATER_THAN';

export type Consult = Entity<{
  id: string;
  name: string;
  practitioner: string;
}>;

export type Message = Entity<{
  body: string;
}>;

export type VerifyOPT = {
  success: boolean;
};

/* SUBSCRIPTIONS */

export type SubscriptionName = 'membership';

export type SubscriptionStatus =
  | 'active'
  | 'all'
  | 'canceled'
  | 'ended'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid';

export type Subscription = {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  created: number;
  billing_cycle_anchor: number;
  current_period_end: number;
  current_period_start: number;
  status: SubscriptionStatus;
  canceled_at: number | null;
  name: SubscriptionName | null;
  type: SubscriptionType | null;
  latest_invoice?: string;
  payment_intent?: string | null;
};

export type SubscriptionType = 'baseline' | 'advanced' | 'essential';

export type AvailableSubscription = {
  coupon: Coupon;
  description: string;
  total: number;
  subtotal: number;
  type: SubscriptionType;
  meta: MembershipPriceMeta[];
};

export type MembershipPriceMeta = {
  title: string;
  amount: string;
};

/* ORDERS */

export enum OrderStatus {
  upcoming = 'UPCOMING',
  completed = 'COMPLETED',
  cancelled = 'CANCELLED',
  revoked = 'REVOKED',
  draft = 'DRAFT',
  pending = 'PENDING',
}

export type CollectionMethodType =
  | 'AT_HOME'
  | 'IN_LAB'
  | 'PHLEBOTOMY_KIT'
  | 'EVENT';

export interface InformedConsent {
  agreedAt: string;
}

export type Annotation = Entity<{
  serviceRequestId: string;
  text: string;
  authorId: string; // RDN's user ID
  time: string;
}>;

export type Order = Entity<{
  serviceId: string;
  serviceItemIds: string[];
  name: string;
  status: OrderStatus;
  location: Location;
  startTimestamp: string;
  endTimestamp: string;
  timezone: string;
  report: boolean;
  method: CollectionMethodType[];
  createdAt: string;
  externalId?: string;
  fileId?: string;
  amount: number;
  invoiceId?: string;
  consent?: InformedConsent;
  note: Annotation[];
}>;

export type ServiceItem = Entity<{
  name: string;
  description: string;
  price: number;
}>;

export type Location = {
  name?: string;
  isDefault?: boolean;
  address?: Address;
  webAddress?: WebAddressDTO;
};

export type AddressUseType = 'home' | 'work' | 'temp' | 'old' | 'billing';

export type Address = Entity<{
  line: string[];
  city: string;
  state: string;
  postalCode: string;
  use: AddressUseType;
}>;

export type WebAddressType = 'ZOOM';

export type WebAddressDTO = {
  url: string;
  type: WebAddressType;
};

export type PhlebotomyLocation = {
  name: string;
  distance: number;
  address: Address;
};

export type NotServiceableReason =
  | 'state-not-serviceable'
  | 'no-providers-in-range';

export type ServiceableResponse = {
  serviceable: boolean;
  providers: ('getlabs' | 'labcorp' | 'bioreference')[];
  reason?: NotServiceableReason;
};

export type Slot = {
  start: string;
  end: string;
};

export type MultiPlatformOrder = {
  occurredAt: string;
  name: string;
  price: number;
  type: MultiPlatformOrderType;
  image?: string;
  invoiceId?: string;
  invoiceUrl?: string;
};

export type MultiPlatformOrderType = 'service' | 'product' | 'membership';

export type UserIdentityVerificationSession = Entity<{
  clientSecret: string | null;
  created: number;
  url: string | null;
}>;

/* PAYMENTS */

export type PaymentMethod = {
  stripePaymentMethodId: string;
  stripeCustomerId: string;
  billing_details: {
    postal_code: string | null;
  } | null;
  card: {
    brand: string;
    country: string | null;
    exp_month: number;
    exp_year: number;
    last4: string;
  };
  created: number;
  default: boolean;
};

/* INVOICES */

export type Invoice = {
  amount_due: number;
  amount_paid: number;
  created: number;
  effective_at: number | null;
  currency: string;
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
  subscription_start: number | null;
  subscription_end: number | null;
  subtotal: number;
  tax: number | null;
  total: number;
  number: string | null;
  charged_card_last4: string | null;
  charged_card_brand: string | null;
  lines: InvoiceLine[];
};

export type InvoiceLine = {
  amount: number;
  description: string | null;
  price: number | null;
  quantity: number | null;
};

/* WEARABLES */

export type Wearable = {
  provider: string;
  logo: string;
  status: string;
};

/* ACTION PLAN */

export type FhirCarePlan = CarePlan & {
  goal?: Array<{ resource: Goal }>;
};

/* PRODUCTS */

export type Product = {
  id: string;
  name: string;
  image?: string;
  price: number;
  url: string;
  discount: number;
  type?: string;
  inventoryQuantity?: number;
};

export type PaginationInfo = {
  page: number;
  limit: number;
  hasNextPage: boolean;
};

export type PaginatedResponse<T> = {
  pagination: PaginationInfo;
  data: T[];
};

/* FILES */
/** Supported MIME types for file uploads */
export type FileContentType =
  | 'application/pdf'
  | 'text/csv'
  | 'image/jpeg'
  | 'image/png'
  | 'video/mp4';

/** Document type classification for uploaded files */
export type FileCategory = 'blood-panel' | 'unknown';

/** Source of the file - whether uploaded by user or generated internally */
export type FileSource =
  | 'user'
  | 'user-admin-actor'
  | 'internal-server'
  | 'unknown';

/** Current processing status of an uploaded file */
export type FileProcessingStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'unknown'
  | 'unsupported-file-type';

/** File entity with metadata and processing information */
export type File = {
  id: string;
  name: string;
  contentType: FileContentType;
  uploadedAt: string;
  status: string;
  processingStatus: FileProcessingStatus;
  category?: FileCategory;
  source?: FileSource;
  orderId?: string;
  deletable: boolean;
  presignedUrl?: string;
};

export type UploadFileFailedResult = {
  success: false;
  fileName: string;
  error: string;
};

export type UploadFileSuccessResult = {
  success: true;
  file: File;
};

export type UploadFileSummary = {
  total: number;
  successful: number;
  failed: number;
};

export type UploadFilesAPIResponse = {
  successful: File[];
  failed: UploadFileFailedResult[];
  summary: UploadFileSummary;
};

/* RDNS */
export type Rdn = Entity<{
  firstName?: string;
  lastName?: string;
  npi?: string;
  schedulingLink: string;
  licensed: string[];
}>;

export type RdnUserAssignment = {
  createdAt: string;
  updatedAt: string;
  rdn: Rdn;
};

/* TIMELINE */
export type TimelineItemType = 'PLAN' | 'ORDER' | 'ONBOARDING_TASK';
export type TimelineItemStatus =
  | 'DONE'
  | 'DISABLED'
  | 'CURRENT'
  | 'DEFAULT'
  | 'ACTION_REQUIRED';

export type TimelineItem = Entity<{
  type: TimelineItemType;
  name: string;
  description?: string;
  status: TimelineItemStatus;
  id: string;
  timestamp: Date;
}>;

/* BRIDGE INSURANCE */
export type BridgePayer = {
  id: string;
  code: string;
  name: string;
  memberId: boolean;
};

export type BridgePolicyStatus =
  | 'PENDING'
  | 'UNKNOWN'
  | 'CONFIRMED'
  | 'REVALIDATING'
  | 'INVALID';

export type BridgeRelationshipStatus =
  | 'SELF'
  | 'CHILD'
  | 'SPOUSE'
  | 'OTHER'
  | 'NONE';

export type BridgePerson = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  middleName?: string;
};

export type BridgeError = {
  code: string;
  message: string;
};

export type BridgeLatest = {
  id: string;
  plan: string;
  validatedAt: string;
  effectiveFrom?: string;
  effectiveTo?: string;
};

export type BridgePolicy = {
  id: string;
  payerId: string;
  payer: BridgePayer;
  status: BridgePolicyStatus;
  state: string;
  planName?: string;
  person?: BridgePerson;
  errors?: BridgeError[];
  memberId?: string;
  policyHolder?: BridgePerson;
  relationship?: BridgeRelationshipStatus;
  patientId?: string;
  latest?: BridgeLatest;
};

export type BridgeCoverage = {
  rank: number;
  policyId: string;
};

export type BridgeAddress = {
  state: string;
  line1?: string;
  line2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

export type BridgePatient = {
  id: string;
  createdAt: string;
  coverage: BridgeCoverage[];
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  patientToken?: string;
  externalId?: string;
  phone?: string;
  address?: BridgeAddress;
};

/* AI CHAT */
export type Visibility = 'public' | 'private';

export interface Chat {
  id: string; // UUID
  createdAt: Date;
  title: string;
  userId: string; // UUID, references User.id
  visibility: Visibility;
}

export interface ChatMessagePart {
  text: string;
  type: 'text';
}

export interface ChatMessageAttachment {
  url: string;
  name: string;
  contentType: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'data' | 'system' | 'assistant';
  parts: ChatMessagePart[]; // JSON
  experimental_attachments: ChatMessageAttachment[]; // JSON
  // Note: content will soon be deprecated in @ai-sdk/react
  content: string;
  createdAt: Date;
}
