/**
 * ✏️  Edit this file to personalise the site.
 * Everything here is placeholder copy: your name, bio, social links and the
 * content of the portfolio pages (Academia, Photography, Paints, Side Hustles).
 * Blog posts and blog categories are managed from the /admin dashboard instead.
 */

export const site = {
  name: 'Ucopedia',
  owner: 'Umang',
  title: "Umang's Ucopedia",
  tagline: 'Making new mindspace',
  description:
    'The personal encyclopedia of Umang: essays on politics, science, books, cinema and philosophy, plus academia, photography and paintings.',
  email: 'soni1.umang333@gmail.com',
  location: 'India',
  academic_portfolio_url: 'https://umangsoni.faculty.bio/',
  academic_portfolio_label: 'Full Academic Profile',
}

export type SocialKey =
  | 'instagram'
  | 'youtube'
  | 'whatsapp'
  | 'linkedin'
  | 'github'
  | 'twitter'

/** Replace the placeholder URLs with your own profiles. */
export const socials: { key: SocialKey; label: string; href: string }[] = [
  { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/flowing._wind/' },
  { key: 'youtube', label: 'YouTube', href: 'https://youtube.com/@your-channel' },
  // WhatsApp: use your number in international format without "+" or spaces.
  { key: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/917880847995' },
  { key: 'linkedin', label: 'LinkedIn', href: 'www.linkedin.com/in/umang-soni420' },
  { key: 'github', label: 'GitHub', href: 'https://github.com/soni1umang' },
  { key: 'twitter', label: 'X / Twitter', href: 'https://x.com/SoniUmang333' },
]

export const about = {
  headline: 'Hi, I’m Umang. I collect questions.',
  intro:
    'This is placeholder text for your introduction. Tell visitors who you are, what you study or do, and why this corner of the internet exists. Ucopedia is my personal encyclopedia: a place where half-formed thoughts get to grow up.',
  paragraphs: [
    'Write a few sentences about your background here: where you grew up, what you studied, and the moments that made you curious.',
    'Then talk about what you care about now. Maybe it’s the politics of everyday life, the physics of black holes, a Hindi novel that changed you, or the film you’ve rewatched eleven times.',
    'Finish with what you’re working toward, and invite people to say hello.',
  ],
  facts: [
    { label: 'Based in', value: 'Your city, India' },
    { label: 'Studying', value: 'Your field of study' },
    { label: 'Currently reading', value: 'A book title' },
    { label: 'Languages', value: 'Hindi, English' },
  ],
  interests: ['Politics', 'Science', 'Books', 'Cinema', 'Philosophy', 'Photography', 'Painting'],
}

export const academia = {
  intro:
    'Placeholder: a short summary of your academic journey, research interests and what you’re learning right now.',
  education: [
    {
      school: 'Your University',
      degree: 'Degree, Major',
      period: '2022 — Present',
      note: 'Relevant coursework, honours, or a thesis topic.',
    },
    {
      school: 'Your School',
      degree: 'Higher Secondary (Science)',
      period: '2020 — 2022',
      note: 'A highlight from your school years.',
    },
  ],
  interests: ['Research interest one', 'Research interest two', 'Research interest three'],
}

export const portfolio = [
  {
    title: 'Project or paper title',
    kind: 'Research',
    year: '2025',
    description: 'One or two lines on what you did, what you found and why it matters.',
    link: '',
  },
  {
    title: 'Another project',
    kind: 'Coursework',
    year: '2024',
    description: 'Describe the problem, your approach and the result.',
    link: '',
  },
  {
    title: 'Presentation or talk',
    kind: 'Talk',
    year: '2024',
    description: 'Where you presented and what it was about.',
    link: '',
  },
  {
    title: 'Certificate or award',
    kind: 'Award',
    year: '2023',
    description: 'What it recognised.',
    link: '',
  },
]

export type Photo = { src: string; caption: string }

/** Photo albums. Add images to /public/img and list them here. */
export const albums: {
  slug: string
  title: string
  summary: string
  cover: string
  photos: Photo[]
}[] = [
  {
    slug: 'kerala',
    title: 'Kerala',
    summary: 'Backwaters, misty tea hills and the colour of Kathakali: God’s own country through my lens.',
    cover: '/img/kerala-1.jpg',
    photos: [
      { src: '/img/kerala-1.jpg', caption: 'Houseboat on the Alleppey backwaters at golden hour' },
      { src: '/img/kerala-2.jpg', caption: 'Morning mist over the tea estates of Munnar' },
      { src: '/img/kerala-3.jpg', caption: 'Chinese fishing nets at sunset, Fort Kochi' },
      { src: '/img/kerala-4.jpg', caption: 'A Kathakali performer before the show' },
    ],
  },
]

export const paintings: (Photo & { title: string; medium: string; year: string })[] = [
  { src: '/img/paint-1.jpg', title: 'The Last Tree', medium: 'Acrylic on canvas', year: '2025', caption: 'A lone tree under a burning sky.' },
  { src: '/img/paint-2.jpg', title: 'Village Lane', medium: 'Watercolour on paper', year: '2024', caption: 'Bicycles and bougainvillea on a quiet afternoon.' },
  { src: '/img/paint-3.jpg', title: 'Tides of Thought', medium: 'Gouache', year: '2024', caption: 'An abstract study in circles and waves.' },
]

export const ucopediaHistory: import('@/lib/content').WebsiteAttempt[] = [
  {
    title: 'The first Ucopedia',
    platform: 'Blogger',
    era: '≈ 2016',
    url: 'https://ucopedia.blogspot.com/',
    description: 'One of the earliest places where I tried to make the internet feel like mine — a blog, an identity, a little universe of ideas.',
    lesson: 'The first lesson was simply that I wanted a place to collect everything that caught my attention.',
  },
  {
    title: 'A WordPress attempt',
    platform: 'WordPress',
    era: 'Later',
    url: '',
    description: 'Another attempt at turning scattered thoughts into a proper personal website.',
    lesson: 'I kept changing the container because I was still figuring out what belonged inside it.',
  },
  {
    title: 'A Wix attempt',
    platform: 'Wix',
    era: 'Later',
    url: '',
    description: 'A more visual experiment — another try at designing a home on the web.',
    lesson: 'The more I experimented with presentation, the more I realised the real problem was deciding what I wanted to say.',
  },
]

export const publications: import('@/lib/content').PublicationItem[] = []

export const now: import('@/lib/content').NowItem[] = [
  { label: 'BUILDING', title: 'RF reflectometry for mesoscopic charge sensing', detail: 'Designing a high-Q readout chain and learning what the device is trying to tell me.', status: 'Active' },
  { label: 'INVESTIGATING', title: 'Ge/SiGe devices', detail: 'Chasing mobility, contacts, interfaces and the small details that decide whether a beautiful device actually behaves.', status: 'Active' },
  { label: 'MAKING', title: 'Small machines after hours', detail: 'Electronics, automation and the occasional idea that starts with “how hard could it be?”', status: 'Experiment' },
  { label: 'LEARNING', title: 'Violin from first principles', detail: 'Learning to hear pitch, rhythm and music theory instead of merely moving my fingers.', status: 'Learning' },
]

export const workbench: import('@/lib/content').WorkbenchItem[] = [
  { title: 'Room automation', kind: 'Electronics', status: 'Active', goal: 'Make a room quietly intelligent.', description: 'Arduino, relays, sensors and the little systems that make everyday life easier.', learning: 'Designing things for humans is harder than making them switch on.', next: 'Build the first reliable control panel.', link: '', images: [], featured: true, show_on_now: true },
  { title: 'RF readout bench', kind: 'Research', status: 'Active', goal: 'Turn tiny charge changes into a clean electrical signal.', description: 'Lumped resonators, matching networks, QPCs and a lot of careful debugging.', learning: 'The measurement chain is part of the experiment.', next: 'Tighten the matching and noise budget.', link: '', images: [], featured: true, show_on_now: true },
]

export const questions: import('@/lib/content').QuestionItem[] = [
  { question: 'What makes a measurement non-invasive?', note: 'A question that sits somewhere between device physics, instrumentation and philosophy.', tags: ['measurement', 'quantum'] },
  { question: 'Why do imperfect materials become interesting?', note: 'Defects, disorder and interfaces often decide what a device can actually do.', tags: ['materials', 'devices'] },
  { question: 'Can a machine make us more curious?', note: 'A running question behind many of my side projects and technological rabbit holes.', tags: ['technology', 'mind'] },
]

export const sideHustles = [
  {
    title: 'Side project one',
    status: 'Active',
    description: 'Placeholder: a small business, freelance gig, channel or maker project you run on the side.',
    link: '',
  },
  {
    title: 'Side project two',
    status: 'Idea',
    description: 'Something you’re experimenting with. Share what it is and what you’re learning.',
    link: '',
  },
  {
    title: 'Side project three',
    status: 'Paused',
    description: 'A past venture and what it taught you.',
    link: '',
  },
]
