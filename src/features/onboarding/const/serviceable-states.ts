// Note: This list is the serviceable states that we allow
// for net new members currently.
export const SERVICEABLE_STATES = [
  'CA', // California
  'CO', // Colorado
  'FL', // Florida
  'NV', // Nevada
  'TX', // Texas
];

// Note: For Staging / Development: We use an Arizona
// address because GetLabs Sandbox only retrieves from
// 85003 (AZ ZIP Code)
if (import.meta.env.DEV) {
  SERVICEABLE_STATES.push('AZ');
}
