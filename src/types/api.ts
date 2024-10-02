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

interface BaseUser {
  firstName: string;
  lastName: string;
  createdAt: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  primaryAddress?: ActiveAddress;
}

export interface AdminUser extends BaseUser {
  id: string;
  stripeCustomerId: string;
  _count: {
    observations: number;
    serviceRequests: number;
  };
  rdnId: string;
}

export interface User extends BaseUser {
  gender: string;
  onboarding?: Questionnaire;
  initialResults?: Questionnaire;
  admin: boolean;
  carePlan?: string;
  authMethod: 'admin' | 'password';
  activeAddresses: ActiveAddress[];
  adminActor?: AdminActor;
  userIdentity?: UserIdentity;
}

export type ActiveAddress = Entity<{
  address: Address;
}>;

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
  profile: User;
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
  profile: User;
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

export type QuestionnaireStatus = 'INCOMPLETE' | 'COMPLETE';

export type Questionnaire = Entity<{
  readonly name: string;
  readonly status: QuestionnaireStatus;
  readonly progress: number;
}>;

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

export interface BiomarkerResult {
  quantity: Quantity;
  timestamp: string;
  status?: BiomarkerStatus;
  biomarkerId?: string;
}

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
  low?: Quantity;
  high?: Quantity;
  status: BiomarkerStatus;
  comparator?: string;
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
  latest_invoice?: string;
  payment_intent?: string | null;
};

export type SubscriptionPrice = {
  // prices: Stripe.Price[];
  total: number;
  coupon?: Coupon;
};

/* ORDERS */

export enum OrderStatus {
  upcoming = 'UPCOMING',
  completed = 'COMPLETED',
  cancelled = 'CANCELLED',
  revoked = 'REVOKED',
  draft = 'DRAFT',
}

export type CollectionMethodType = 'AT_HOME' | 'IN_LAB' | 'PHLEBOTOMY_KIT';

export interface InformedConsent {
  agreedAt: string;
}

export type Order = Entity<{
  serviceId: string;
  serviceItemIds: string[];
  name: string;
  status: OrderStatus;
  location: Location;
  timestamp: string;
  timezone: string;
  report: boolean;
  method: CollectionMethodType[];
  advisorCall?: string;
  createdAt: string;
  externalId?: string;
  fileId?: string;
  amount: number;
  invoiceId?: string;
  consent?: InformedConsent;
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

export type Address = {
  line: string[];
  city: string;
  state: string;
  postalCode: string;
};

export type WebAddressType = 'ZOOM';

export type WebAddressDTO = {
  url: string;
  type: WebAddressType;
};

export type PhlebotomyLocation = Entity<{
  name: string;
  distance: number;
  address: Address;
}>;

export type Serviceable = {
  serviceable: boolean;
  providers: ('getlabs' | 'labcorp')[];
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

export type ConciergeNotificationType = 'concierge' | 'service' | 'plan';

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

export type Plan = Entity<{
  orderId: string;
  timestamp: string;
  title: string;
  type: ActionPlanType;
  description: string;
  published: boolean;
  goals: PlanGoal[];
  videoFileId?: string;
  annualReport?: AnnualReport;
  updatedAt: string;
}>;

export type PlanGoal = Entity<{
  title: string;
  type: PlanGoalType;
  description: string;
  goalItems: PlanGoalItem[];
  to: string;
  from: string;
}>;

export type PlanGoalItem = Entity<{
  itemId: string;
  itemType: PlanGoalItemType;
  description?: string;
  timestamp?: string;
}>;

export type PlanDate = {
  timestamp: string;
  orderId: string;
  actionPlanId?: string;
};

export type PlanGoalItemType = 'SERVICE' | 'BIOMARKER' | 'PRODUCT';

export type ActionPlanType = 'DEFAULT' | 'ANNUAL_REPORT';

export type PlanGoalType =
  | 'DEFAULT'
  | 'ANNUAL_REPORT_PRIMARY'
  | 'ANNUAL_REPORT_SECONDARY'
  | 'ANNUAL_REPORT_PROTOCOLS';

export type AnnualReportBlockType =
  | 'PREVENTION'
  | 'ENVIRONMENTAL'
  | 'NUTRITION'
  | 'LOOK_AND_FEEL';

export type AnnualReportBlockGroupItemType = 'BIOMARKER' | 'SELF_EVALUATION';

export type AnnualReportBlockGroupItemRefType = 'TEXT_LINK' | 'BUTTON_LINK';
export type AnnualReportBlockGroupItemStatusType =
  | 'OPTIMAL'
  | 'NORMAL'
  | 'OUT_OF_RANGE';

export type BlockGroupItemRef = Entity<{
  type: AnnualReportBlockGroupItemRefType;
  text: string;
  value: string;
}>;

export type BlockGroupItem = Entity<{
  type: AnnualReportBlockGroupItemType;
  biomarkerId: string | null;
  selfEvalId: string | null;
  name: string;
  range: string | null;
  status: AnnualReportBlockGroupItemStatusType | null;
  value: string | null;
  ref: BlockGroupItemRef[];
}>;

export type BlockGroup = Entity<{
  name: string;
  description: string;
  hover: string;
  score: string;
  scoreCustom: string;
  scoreCustomSetBy: string;
  scoreCustomSetAt: string;
  blockGroupItem: BlockGroupItem[];
}>;

export type Block = Entity<{
  type: AnnualReportBlockType;
  title: string;
  subtitle: string;
  subtitleValue: string;
  blockGroup: BlockGroup[];
}>;

export type AnnualReport = Entity<{
  title: string;
  description: string;
  block: Block[];
}>;

/* PRODUCTS */

export type Product = {
  id: string;
  name: string;
  image?: string;
  price: string;
  url: string;
};

export type ProductOrder = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  price: string;
  createdAt: Date;
};

export type ProductOrderLineItem = {
  name: string;
  price: string;
  imageUrl: string;
};

export type CheckoutLineItem = {
  productVariantId: string;
  quantity: number;
};

/* FILES */
export type FileContentType =
  | 'application/pdf'
  | 'application/zip'
  | 'text/csv'
  | 'image/jpeg'
  | 'image/png'
  | 'video/mp4'
  | 'video/mov'
  | 'application/vnd.md-excel'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export type File = {
  id: string;
  name: string;
  contentType: FileContentType;
  uploadedAt: string;
  status: string;
  orderId?: string;
  deletable: boolean;
  presignedUrl?: string;
};

/* RDNS */
export type Rdn = Entity<{
  firstName: string;
  lastName: string;
  npi?: string;
  schedulingLink: string;
  licensed: string[];
}>;
