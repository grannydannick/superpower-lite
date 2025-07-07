/**
 * Type for service faqs used in modals, onboarding, and service details
 */
export interface ServiceFaq {
  question: string;
  answer: string;
}

/**
 * Type for service details which we use globally in different components
 */
export interface ServiceDetails {
  tag?: string;
  image?: string;
  faqs: ServiceFaq[];
}
