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

export type User = {
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phone: string;
  createdAt: string;
  onboarding?: Questionnaire;
  initialResults?: Questionnaire;
  admin: boolean;
  dateOfBirth: string;
  carePlan?: string;
  authMethod: 'admin' | 'password';
  primaryAddress?: ActiveAddress;
  activeAddresses: ActiveAddress[];
  adminActor?: AdminActor;
  userIdentity?: UserIdentity;
};

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
  status: BiomarkerStatus;
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

export interface UserIdentityVerificationSession {
  id: string;
  clientSecret: string | null;
  created: number;
  url: string | null;
}

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
