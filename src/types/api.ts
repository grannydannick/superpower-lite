import { CarePlan, Goal } from '@medplum/fhirtypes';

import { RxQuestionnaireName } from '@/const/questionnaire';

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
  gender: string;
  isDeleted: boolean;
  deletedAt: string | null;
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
  identityUpdatedTime?: string;
  identityVerificationStatus?: IdentityVerificationStatus;
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
export type QuestionnaireName = RxQuestionnaireName;

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
  | 'onboarding-identity'
  | 'onboarding-gift';

/* HEALTHCARE SERVICE */
export type ServiceGroup =
  | 'test-kit' // everything that is not phlebotomy
  | 'phlebotomy-kit' // cancer test
  | 'phlebotomy'
  | 'advisory-call';

export type HealthcareService = Entity<{
  name: string;
  description: string | undefined;
  price: number;
  active: boolean;
  additionalClassification: string[];
  supportsLabOrder: boolean;
  bloodTubeCount: number;
  group?: ServiceGroup;
}>;

export type Coupon = {
  amount_off: number | null;
  percent_off: number | null;
  metadata?: Record<string, string>;
};

/* LABS */
export type Lab = 'quest' | 'labcorp' | 'bioref' | 'custom'; // custom is e.g. for hardcoded markers like BiologicalAge

export type LabRanges = Record<Lab, Range[]>;

/* CATEGORIES */
export type CategoryValue = 'A' | 'B' | 'C' | '-';

export interface Category {
  category: string;
  value: CategoryValue;
  relatedBiomarkers?: string[];
}

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
  ranges: LabRanges;
  value: BiomarkerResult[];
  metadata: BiomarkerMetadata;
  recommendedTests: BiomarkerRecommendedTests;
  familyRisk?: BiomarkerFamilyRisk;
}>;

export interface BiomarkerFamilyRisk {
  insight: string;
  sms: string;
}

export interface BiomarkerRecommendedTests {
  rx: { id: string; explanation: string }[];
  services: { id: string; explanation: string }[];
}

export type BiomarkerComponent = {
  category?: string;
  title: string;
  value: string;
  relatedObservations: string[];
};

export type BiomarkerResult = Entity<{
  quantity: Quantity;
  timestamp: string;
  orderIds: string[];
  status?: BiomarkerStatus;
  source?: Lab;
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
  | 'PENDING'
  | 'RECOMMENDED';

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
  name: 'membership' | null;
  latest_invoice?: string;
  payment_intent?: string | null;
  total: number | null;
};

export type AvailableSubscription = {
  coupon: Coupon;
  description: string;
  total: number;
  subtotal: number;
  name: string;
  meta: MembershipPriceMeta[];
};

export type MembershipPriceMeta = {
  title: string;
  amount: string;
};

/* ORDERS */

export enum OrderStatus {
  draft = 'draft',
  active = 'active',
  revoked = 'revoked',
  completed = 'completed',
  enteredInError = 'entered-in-error',
  unknown = 'unknown',
  onHold = 'on-hold',
}
export type AppointmentType = 'SCHEDULED' | 'UNSCHEDULED';

export enum ServiceTypeEnum {
  Baseline = 'v2-baseline',
  Advanced = 'v2-advanced',
}
export type ServiceType = ServiceTypeEnum;

export enum ServiceLabTypeEnum {
  Labcorp = 'labcorp',
  Quest = 'quest',
  Bioref = 'bioref',
}
export type ServiceLabType = ServiceLabTypeEnum;

export type CollectionMethodType = 'AT_HOME' | 'IN_LAB' | 'PHLEBOTOMY_KIT';

export type Order = Entity<{
  serviceName: string;
  serviceId: string;
  collectionMethod?: CollectionMethodType;
  status: OrderStatus;
  address?: Address;
  startTimestamp?: string;
  endTimestamp?: string;
  timezone?: string;
  createdAt?: string;
  appointmentType?: AppointmentType;
  extendedStatus?: string;
  extendedStatusDate?: string;
}>;

export type RequestGroup = Entity<{
  id: string;
  status: OrderStatus;
  extendedStatus?: string;
  orders: Order[];
  collectionMethod?: CollectionMethodType;
  startTimestamp?: string;
  endTimestamp?: string;
  address?: Address;
  timezone?: string;
  createdAt?: string;
  appointmentType?: AppointmentType;
}>;

export type CreditType = 'default' | 'rx';

export type Credit = Entity<{
  serviceId: string;
  serviceName: string;
  collectionMethod?: CollectionMethodType;
}>;

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
  address: Address;
  distance?: number;
  phone?: string;
  capabilities: LabCapability[];
  hours?: LabHours;
  slots: Slot[];
  lat?: number;
  lng?: number;
};

export type LabCapability = 'APPOINTMENT_SCHEDULING' | 'WALK_IN';

export type LabHours = {
  Mon: string | null;
  Tue: string | null;
  Wed: string | null;
  Thu: string | null;
  Fri: string | null;
  Sat: string | null;
  Sun: string | null;
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

export type PaymentProvider = 'stripe' | 'flex';

export type PaymentMethod = {
  stripePaymentMethodId: string;
  stripeCustomerId: string;
  billing_details: {
    postal_code: string | null;
  } | null;
  type?: 'card' | 'klarna' | 'link';
  card?: {
    brand: string;
    country: string | null;
    exp_month: number;
    exp_year: number;
    last4: string;
  };
  klarna?: Record<string, never>;
  link?: Record<string, never>;
  created: number;
  default: boolean;
  paymentProvider: PaymentProvider;
  externalPaymentMethodId: string;
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
  lastViewed?: string;
};

/* PRODUCTS */

export type Product = {
  id: string;
  productId?: string;
  name: string;
  image?: string;
  price: number;
  url: string;
  discount: number;
  type?: string;
  inventoryQuantity?: number;
  additionalClassification?: string[];
  vendor?: string;
};

/* RX */

export type Rx = {
  id: string;
  url?: string | null;
  type?: string | null;
  name: string;
  description?: string | null;
  price?: number | null;
  active?: boolean | null;
  source?: string | null;
  additionalClassification?: string[] | null;
};

/* MARKETPLACE */

export type Marketplace = {
  id: string;
  productId?: string | null;
  name: string;
  image?: string | null;
  price?: number | null;
  url?: string | null;
  discount?: number | null;
  type?: string | null;
  vendor?: string | null;
  inventoryQuantity?: number | null;
  source?: string | null;
  active?: boolean | null;
  description?: string | null;
  additionalClassification?: string[] | null;
  group?: ServiceGroup;
  supportsLabOrder?: boolean | null;
  bloodTubeCount?: number | null;
};

export type MarketplaceResponse<
  TSupplements = Marketplace,
  TPrescriptions = Marketplace,
  TServices = Marketplace,
> = {
  supplements: TSupplements[];
  prescriptions: TPrescriptions[];
  services: TServices[];
};

export type MarketplaceApiResponse = MarketplaceResponse;

export type MarketplaceData = MarketplaceResponse<
  Product,
  Rx,
  HealthcareService
>;

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
  contentType: FileContentType | 'test';
  uploadedAt: string;
  status: string;
  processingStatus: FileProcessingStatus;
  category?: FileCategory;
  source?: FileSource;
  orderIds?: string[];
  deletable: boolean;
  presignedUrl?: string;
  image?: string;
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
  mediaType: string;
  type: 'file';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'system' | 'assistant';
  parts: (ChatMessagePart | ChatMessageAttachment)[]; // JSON
  createdAt: Date;
}

export interface VerifyEmailOTPResponse {
  success: boolean;
  user: User;
  authTokens: {
    accessToken: string;
    refreshToken: string;
  };
  redirectTo?: string;
  origin?: string;
}

/* CONSENT */
export const ConsentType = {
  MEMBERSHIP_AGREEMENT: 'platform-tos',
  PHI_MARKETING: 'phi-marketing',
} as const;

export type ConsentType = (typeof ConsentType)[keyof typeof ConsentType];

export interface Consent {
  exists: boolean;
  accepted?: boolean;
}

export const SuperpowerCategory = {
  HEART_AND_VASCULAR: 'Heart & Vascular Health',
  LIVER: 'Liver Health',
  KIDNEY: 'Kidney Health',
  METABOLIC: 'Metabolic Health',
  INFLAMMATION: 'Inflammation',
  NUTRIENTS: 'Nutrients',
  ENERGY: 'Energy',
  IMMUNE_SYSTEM: 'Immune System',
  DNA_HEALTH: 'DNA Health',
  BRAIN_HEALTH: 'Brain Health',
  THYROID_HEALTH: 'Thyroid Health',
  SEX_HORMONES: 'Sex Hormones',
  GUT_HEALTH: 'Gut Health',
  TOXIN_EXPOSURE: 'Toxin Exposure',
  SKIN_AND_HAIR: 'Skin & Hair Health',
  SLEEP: 'Sleep Health',
  BODY_COMPOSITION: 'Body Composition',
} as const;

export type SuperpowerCategory =
  (typeof SuperpowerCategory)[keyof typeof SuperpowerCategory];

export interface QuestionnaireInsights {
  title: string;
  description: string;
  sms: string;
  recommendations: string[];
}

export interface RxService {
  id: string;
  url: string;
  type: string;
  source: string;
  name: string;
  description: string;
  price: string;
  active: boolean;
  tags: string[];
}

export interface RxSubscription {
  contract: RxContract;
  medicationRequest: RxMedicationRequest;
  serviceRequest: RxServiceRequest;
}

export interface RxContract {
  id: string;
  status: string;
  billingCycleStatus: string;
  anchorDate: string; // consider Date if you parse it
  stripeSubscriptionId: string;
  totalFills: number;
  fillsRemaining: number;
  daysSupply: number;
}

export interface RxMedicationRequest {
  id: string;
  status: string;
  medicationDisplay: string;
  rxCode: string;
  serviceRequestId: string;
}

export interface RxServiceRequest {
  id: string;
  status: string;
  rxCode: string;
}

export interface SummaryResult {
  hasCompletedCarePlan: boolean;
  hasPartialResults: boolean;
  completedCarePlans: number;
  partialDiagnosticReports: number;
}
