/*
 * fellow devs: please define constant linkIDs below for any ones that need special branching / rendering logic.
 */

// Used for RX questionnaires to auto-submit the form when the consent payment question is answered.
export const RX_CONSENT_PAYMENT_LINKID = 'consent-payment.payment';

// Used for Rx questionnaires to render the current address card.
export const RX_SAFETY_ADDRESS_LINKID = 'safety.address';

// Used for Rx questionnaires to render the RX intro image.
export const RX_SAFETY_INTRO_LINKID = 'safety.intro';

// Used for Rx questionnaires to render the identity verification button before the payment screen.
export const RX_IDENTITY_VERIFICATION_LINKID = 'consent-payment.verification';

// Used for Rx questionnaires to skip the gender question.
// Also a common linkId to conditionally enable male/female specific questions.
export const RX_SEX_ASSIGNED_AT_BIRTH_LINKID = 'sex-assigned-at-birth';
