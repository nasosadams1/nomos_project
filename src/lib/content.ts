export const LAST_UPDATED_LABEL = 'April 8, 2026';

export const CONTACT_DETAILS = {
  generalEmail: 'hello@nomos.gr',
  privacyEmail: 'privacy@nomos.gr',
  securityEmail: 'security@nomos.gr',
  accessibilityEmail: 'accessibility@nomos.gr',
  salesEmail: 'sales@nomos.gr',
  legalEmail: 'legal@nomos.gr',
};

export const ISSUE_TYPES = [
  'Divorce',
  'Employment',
  'Property',
  'Immigration',
  'Inheritance',
  'Business Contract',
  'Car Accident',
  'Criminal Defense',
  'Tax Law',
  'Intellectual Property',
  'Other',
] as const;

export const ISSUE_KEYWORDS: Record<string, string[]> = {
  Divorce: ['divorce', 'family', 'custody', 'marriage'],
  Employment: ['employment', 'labor', 'workplace', 'dismissal'],
  Property: ['property', 'real estate', 'lease', 'landlord', 'tenant'],
  Immigration: ['immigration', 'residency', 'visa', 'permit'],
  Inheritance: ['inheritance', 'estate', 'probate', 'succession'],
  'Business Contract': ['business', 'contract', 'commercial', 'company'],
  'Car Accident': ['car accident', 'traffic', 'injury', 'insurance'],
  'Criminal Defense': ['criminal', 'defense', 'offence', 'arrest'],
  'Tax Law': ['tax', 'revenue', 'vat'],
  'Intellectual Property': ['intellectual property', 'trademark', 'copyright', 'patent'],
  Other: [],
};

export const CITY_OPTIONS = [
  'Athens',
  'Thessaloniki',
  'Patras',
  'Heraklion',
  'Larissa',
  'Volos',
  'Ioannina',
  'Chania',
  'Other',
] as const;

export const LANGUAGE_OPTIONS = [
  'Greek',
  'English',
  'German',
  'French',
  'Italian',
  'Spanish',
] as const;

export const CONSULTATION_FORMATS = [
  {
    value: 'online',
    label: 'Online consultation',
    description: 'Video or phone call from anywhere.',
  },
  {
    value: 'in-person',
    label: 'In-person meeting',
    description: "Meet at the lawyer's office.",
  },
  {
    value: 'either',
    label: 'Either option',
    description: 'Keep both online and in-person open.',
  },
] as const;

export const URGENCY_LEVELS = [
  { value: 'urgent', label: 'Urgent', description: 'Need help within days.' },
  { value: 'soon', label: 'Soon', description: 'Need help within one to two weeks.' },
  { value: 'flexible', label: 'Flexible', description: 'No immediate deadline.' },
] as const;

export const BUDGET_OPTIONS = [
  'Free initial consultation',
  'Up to EUR 100',
  'EUR 100 - EUR 200',
  'EUR 200+',
  'Not sure yet',
] as const;

export const PRICING_PLANS = [
  {
    name: 'Starter',
    price: 'EUR 99',
    summary: 'For solo practitioners validating demand.',
    featured: false,
    features: [
      'Verified public profile',
      'Structured intake referrals',
      'Consultation request inbox',
      'Basic availability controls',
      'Email support',
    ],
  },
  {
    name: 'Professional',
    price: 'EUR 199',
    summary: 'For firms that want better intake operations.',
    features: [
      'Everything in Starter',
      'Priority placement in the directory',
      'Deeper intake triage',
      'Client portal access controls',
      'Reporting and response-time insights',
    ],
    featured: true,
  },
  {
    name: 'Team',
    price: 'Custom',
    summary: 'For multi-lawyer teams with operational requirements.',
    featured: false,
    features: [
      'Multi-lawyer profile management',
      'Team workflows and routing',
      'Centralized intake operations',
      'Rollout support',
      'Custom commercial terms',
    ],
  },
] as const;
