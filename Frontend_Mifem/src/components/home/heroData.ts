export interface HeroSlide {
  id: string;
  title: string;
  description: string;
  bgColor: string;
  overlayFrom: string;
  overlayTo: string;
  bgImage?: string;
  primaryCta: { label: string; href: string };
  active: boolean;
  sortOrder?: number;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    title: 'Empowering Rwandan Women Through Skills: MIFEM Tofu & Home Essentials Training',
    description:
      'Rwandan mothers and young women come together in a collaborative learning environment under the MIFEM program, participating in hands-on training focused on tofu cooking and essential home economics skills. The atmosphere reflects empowerment, unity, and knowledge sharing — building stronger women, stronger families, and stronger communities.',
    bgColor: 'bg-sda-blue',
    overlayFrom: 'from-sda-blue/20',
    overlayTo: 'to-transparent',
    bgImage: '/hero/images/slide-2.webp',
    primaryCta: { label: 'Join Now', href: '/register' },
    active: true,
  },
  {
    id: 'slide-2',
    title: 'MIFEM Digital Skills Academy: Empowering Women Through Technology Training',
    description:
      'Rwandan women and girls actively participate in a modern technology training session under the MIFEM initiative. Dressed in matching blue MIFEM T-shirts, they engage in hands-on digital learning — computer skills, coding, electronics, and collaborative tech projects. This represents the MIFEM mission of transforming lives through education, technology, and leadership.',
    bgColor: 'bg-slate-900',
    overlayFrom: 'from-slate-900/30',
    overlayTo: 'to-transparent',
    bgImage: '/hero/images/slide-1.webp',
    primaryCta: { label: 'Get Started', href: '/login' },
    active: true,
  },
  {
    id: 'slide-3',
    title: 'MIFEM Sports Power: Strong Women, Strong Future Through Unity and Fitness',
    description:
      'A large group of MIFEM women actively participate in various sports activities, showcasing strength, unity, and empowerment. Dressed in matching blue MIFEM T-shirts, the women run, play basketball, volleyball, and engage in fitness exercises — symbolizing empowerment, confidence, and the collective growth of women building a stronger future.',
    bgColor: 'bg-slate-950',
    overlayFrom: 'from-slate-950/30',
    overlayTo: 'to-sda-blue/10',
    bgImage: '/hero/images/slide-3.webp',
    primaryCta: { label: 'Get Started', href: '/login' },
    active: true,
  },
];
