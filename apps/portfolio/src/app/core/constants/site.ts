export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export interface FocusArea {
  readonly title: string;
  readonly description: string;
}

export interface SocialLink {
  readonly label: string;
  readonly href: string;
}

export const SITE = {
  name: 'Saleem Khan',
  title: 'Senior Software Engineer',
  domain: 'https://saleemkhan.dev',
  email: 'hello@saleemkhan.dev',
  tagline:
    'Building scalable software, exploring architecture, and documenting the journey from Senior Engineer to Staff Engineer and beyond.',
  shortBio:
    'Senior Software Engineer focused on Angular, TypeScript, and frontend architecture. Available for thoughtful engineering conversations.',
  biography:
    'I am a Senior Software Engineer with roughly a decade of experience building software, with particular depth in frontend engineering. This site is my public engineering home — a place to share architecture thinking, technical experiments, and the journey toward Staff Engineer and architectural leadership.',
  description:
    'Personal engineering portfolio and laboratory of Saleem Khan — Senior Software Engineer focused on Angular, TypeScript, frontend architecture, and systems thinking.',
  portrait: {
    src: '/images/saleem-khan.png',
    alt: 'Portrait of Saleem Khan',
  },
  rotatingRoles: [
    'Angular Specialist',
    'Frontend Architect',
    'Full-Stack Engineer',
  ] as const,
  navigation: [
    { label: 'Intro', href: '#intro' },
    { label: 'About', href: '#about' },
    { label: 'Focus', href: '#focus' },
    { label: 'Journey', href: '#journey' },
  ] as const satisfies readonly NavItem[],
  focusAreas: [
    {
      title: 'Angular',
      description:
        'Modern Angular architecture with standalone components, Signals, and maintainable application structure.',
    },
    {
      title: 'TypeScript',
      description:
        'Strict typing, clear domain models, and APIs that make intent obvious to the next engineer.',
    },
    {
      title: 'Frontend Architecture',
      description:
        'Boundaries, composition, and design systems that scale across products and teams.',
    },
    {
      title: 'Full-Stack Engineering',
      description:
        'End-to-end delivery across interfaces, services, and the operational concerns between them.',
    },
    {
      title: 'Cloud',
      description:
        'Cloud-aware application design with pragmatic deployment and reliability trade-offs.',
    },
    {
      title: 'System Design',
      description:
        'Clear models, durable interfaces, and decisions that hold under real product pressure.',
    },
    {
      title: 'Developer Experience',
      description:
        'Tooling, conventions, and feedback loops that help engineers ship with confidence.',
    },
  ] as const satisfies readonly FocusArea[],
  social: [
    {
      label: 'GitHub',
      href: 'https://github.com/saleemkhandev',
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/saleemkhan17',
    },
  ] as const satisfies readonly SocialLink[],
} as const;
