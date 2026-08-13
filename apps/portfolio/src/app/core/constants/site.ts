export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export interface SkillGroup {
  readonly title: string;
  readonly items: readonly string[];
}

export interface ExperienceRole {
  readonly company: string;
  readonly title: string;
  readonly period: string;
  readonly highlights: readonly string[];
}

export interface SocialLink {
  readonly label: string;
  readonly href: string;
}

export const SITE = {
  name: 'Saleem Khan',
  title: 'Senior Software Engineer',
  domain: 'https://saleemkhan.dev',
  email: 'saleemkhan.dev@outlook.com',
  location: 'Bengaluru, India',
  tagline:
    'Building scalable software, exploring architecture, and documenting the journey from Senior Engineer to Staff Engineer and beyond.',
  shortBio:
    'Senior Software Engineer with over 10 years of experience designing and delivering scalable products across the stack.',
  biography:
    'Senior Software Engineer with over 10 years of experience designing and building software across frontend, backend, and cloud. I work end to end — from product interfaces and APIs to microservices, data platforms, and the systems that keep them reliable in production. This site is my public engineering home for architecture thinking, technical experiments, and the journey toward Staff Engineer and architectural leadership.',
  description:
    'Saleem Khan is a Senior Software Engineer in Bengaluru with 10+ years building scalable full-stack products, APIs, and cloud systems. Portfolio, experience, and CV at saleemkhan.dev.',
  pageTitle: 'Saleem Khan | Senior Software Engineer | Bengaluru',
  keywords: [
    'Saleem Khan',
    'Saleem Ulla Khan',
    'Senior Software Engineer',
    'Full Stack Engineer',
    'Bengaluru',
    'saleemkhan.dev',
    'software engineer portfolio',
  ] as const,
  resume: {
    href: '/resume/saleem-khan-resume.pdf',
    label: 'Download CV',
    fileName: 'Saleem-Khan-Resume.pdf',
  },
  portrait: {
    src: '/images/saleem-khan.png',
    alt: 'Portrait of Saleem Khan',
  },
  ogImage: {
    src: '/images/og-image.jpg',
    alt: 'Saleem Khan — Senior Software Engineer',
    width: 1200,
    height: 800,
  },
  rotatingRoles: [
    'Full-Stack Engineer',
    'Frontend Architect',
    'Software Architect',
  ] as const,
  navigation: [
    { label: 'Intro', href: '#intro' },
    { label: 'About', href: '#about' },
    { label: 'Experience', href: '#experience' },
    { label: 'Skills', href: '#skills' },
    // { label: 'Journey', href: '#journey' },
    { label: 'Contact', href: '#contact' },
    { label: 'Blog', href: '/blog' },
  ] as const satisfies readonly NavItem[],
  experience: [
    {
      company: 'Mimecast',
      title: 'Senior Software Engineer',
      period: 'Jul 2024 — Present',
      highlights: [
        'Contributing to a next-generation email security platform spanning multiple products, built with Angular micro frontends in an Nx monorepo.',
        'Owned features from UI components and state management through API consumption, error handling, and contract alignment with backend teams.',
        'Improved shared UI libraries and build tooling, contributing to platform quality and cross-team delivery.',
      ],
    },
    {
      company: 'Epsilon',
      title: 'Senior Software Engineer',
      period: 'Sep 2021 — Jul 2024',
      highlights: [
        'Led the migration of existing applications to a new internal framework, ensuring a seamless transition and improved performance.',
        'Integrated Changelog with Kafka and Elasticsearch, enhancing client module functionality and enabling real-time data processing.',
        'Participated in architectural discussions and decisions, contributing insights and best practices.',
      ],
    },
    {
      company: 'Ceridian (Dayforce)',
      title: 'Software Developer Sr',
      period: 'Mar 2020 — Sep 2021',
      highlights: [
        'Designed and built a leave application using Angular.',
        'Managed the end-to-end leave application cycle, from request submission to final approval.',
        'Contributed to major design discussions that improved architecture, usability, and overall user experience.',
      ],
    },
    {
      company: 'Appveen (Datanimbus)',
      title: 'Technical Engineer',
      period: 'Feb 2018 — Mar 2020',
      highlights: [
        'Developed frontend components and business logic with Angular.',
        'Implemented Angular routing and state management.',
        'Conducted code reviews.',
      ],
    },
    {
      company: 'Vxceed Software Solutions',
      title: 'UI Developer',
      period: 'Feb 2016 — Feb 2018',
      highlights: [
        'Collaborated with senior developers to design and modify HTML, CSS, and JavaScript for web pages.',
        'Implemented interactive features with JavaScript, including form validation and dynamic content.',
      ],
    },
  ] satisfies readonly ExperienceRole[],
  skillGroups: [
    {
      title: 'Frontend',
      items: [
        'Angular',
        'TypeScript',
        'JavaScript',
        'HTML5',
        'CSS3',
        'SCSS',
        'Material UI',
        'Responsive Design',
        'Accessibility',
        'Performance',
      ],
    },
    {
      title: 'Backend',
      items: ['Node.js', 'Express.js', 'Python', 'Web Services'],
    },
    {
      title: 'Architecture',
      items: [
        'Microservices',
        'Micro Frontend Architecture',
        'Distributed Systems',
        'Software Design',
      ],
    },
    {
      title: 'Data & Messaging',
      items: ['MongoDB', 'PostgreSQL', 'Kafka', 'Data Modeling'],
    },
    {
      title: 'Cloud & DevOps',
      items: [
        'Docker',
        'CI/CD',
        'Jenkins',
        'GitLab',
        'GCP',
        'Azure',
        'Cloud Security',
      ],
    },
    {
      title: 'Practices',
      items: [
        'Test Driven Development',
        'Root Cause Analysis',
        'Debugging',
        'Code Review',
        'UI Engineering Best Practices',
      ],
    },
  ] as const satisfies readonly SkillGroup[],
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

export function buildJsonLd(): Record<string, unknown> {
  const imageUrl = `${SITE.domain}${SITE.ogImage.src}`;
  const portraitUrl = `${SITE.domain}${SITE.portrait.src}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE.domain}/#website`,
        url: `${SITE.domain}/`,
        name: SITE.name,
        description: SITE.description,
        inLanguage: 'en',
        publisher: { '@id': `${SITE.domain}/#person` },
      },
      {
        '@type': 'Person',
        '@id': `${SITE.domain}/#person`,
        name: SITE.name,
        url: `${SITE.domain}/`,
        image: portraitUrl,
        email: SITE.email,
        jobTitle: SITE.title,
        description: SITE.shortBio,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Bengaluru',
          addressCountry: 'IN',
        },
        sameAs: SITE.social.map((link) => link.href),
        worksFor: {
          '@type': 'Organization',
          name: 'Mimecast',
        },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${SITE.domain}/#profilepage`,
        url: `${SITE.domain}/`,
        name: SITE.pageTitle,
        description: SITE.description,
        isPartOf: { '@id': `${SITE.domain}/#website` },
        about: { '@id': `${SITE.domain}/#person` },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: imageUrl,
          width: SITE.ogImage.width,
          height: SITE.ogImage.height,
        },
      },
    ],
  };
}
