import type { LucideIcon } from 'lucide-react';
import {
  MoreHorizontal,
  User,
  Users,
  Briefcase,
  HeartPulse,
  Mail,
  Tv,
} from 'lucide-react';
import { createElement } from 'react';

import {
  BingIcon,
  ChatGPTIcon,
  ClaudeIcon,
  FacebookIcon,
  GoogleIcon,
  InstagramIcon,
  LinkedInIcon,
  PerplexityIcon,
  RedditIcon,
  TikTokIcon,
  YouTubeIcon,
} from '@/components/icons/marketing';
import { SuperpowerIcon } from '@/components/icons/superpower-logo';
import { XIcon } from '@/components/icons/x-icon';

export type IconComponent =
  | LucideIcon
  | React.ComponentType<React.SVGProps<SVGSVGElement>>
  // this allows icon components that accept a size prop as we have such specific logo
  | React.ComponentType<{ size?: number }>
  | React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

const createImageIcon = (src: string) => {
  return (props: React.ComponentProps<'img'>) =>
    createElement('img', {
      src,
      alt: '',
      'aria-hidden': props['aria-hidden'],
      className:
        `${props.className ?? ''} rounded-sm object-contain w-7 h-4`.trim(),
    });
};

export interface HeardAboutUsOption {
  value: string;
  label: string;
  icon: IconComponent;
}

export type HeardAboutUsCategory = {
  id: string;
  title: string;
  options?: HeardAboutUsOption[];
};

export const HEARD_ABOUT_US_CATEGORIES: HeardAboutUsCategory[] = [
  {
    id: 'social-media',
    title: 'Social Media or Ad',
    options: [
      { value: 'tiktok', label: 'TikTok', icon: TikTokIcon },
      { value: 'instagram', label: 'Instagram', icon: InstagramIcon },
      { value: 'facebook', label: 'Facebook', icon: FacebookIcon },
      { value: 'youtube', label: 'YouTube', icon: YouTubeIcon },
      { value: 'reddit', label: 'Reddit', icon: RedditIcon },
      { value: 'linkedin', label: 'LinkedIn', icon: LinkedInIcon },
      { value: 'x', label: 'X', icon: XIcon },
      { value: 'tv', label: 'TV', icon: Tv },
      { value: 'other', label: 'Other', icon: MoreHorizontal },
    ],
  },
  {
    id: 'word-of-mouth',
    title: 'Word of Mouth',
    options: [
      { value: 'friend', label: 'Friend', icon: User },
      { value: 'family', label: 'Family', icon: Users },
      { value: 'colleague', label: 'Colleague', icon: Briefcase },
      { value: 'clinician', label: 'Clinician', icon: HeartPulse },
      { value: 'other', label: 'Other', icon: MoreHorizontal },
    ],
  },
  {
    id: 'podcast',
    title: 'Podcast',
  },
  {
    id: 'creator',
    title: 'Creator',
    options: [
      {
        value: 'giannis',
        label: 'Giannis',
        icon: createImageIcon('/onboarding/heard-about-us/giannis.webp'),
      },
      {
        value: 'steve-aoki',
        label: 'Steve Aoki',
        icon: createImageIcon('/onboarding/heard-about-us/steve-aoki.webp'),
      },
      {
        value: 'logan-paul',
        label: 'Logan Paul',
        icon: createImageIcon('/onboarding/heard-about-us/logan-paul.webp'),
      },
      { value: 'other', label: 'Other', icon: MoreHorizontal },
    ],
  },
  {
    id: 'clinician',
    title: 'Clinician',
    options: [
      {
        value: 'dr-amy-shah',
        label: 'Dr Amy Shah',
        icon: createImageIcon('/onboarding/heard-about-us/dr-amy-shah.webp'),
      },
      {
        value: 'dr-connealy',
        label: 'Dr Connealy',
        icon: createImageIcon('/onboarding/heard-about-us/dr-connealy.webp'),
      },
      { value: 'other', label: 'Other', icon: MoreHorizontal },
    ],
  },
  {
    id: 'web-search',
    title: 'Web Search',
    options: [
      { value: 'google', label: 'Google', icon: GoogleIcon },
      { value: 'bing', label: 'Bing', icon: BingIcon },
      { value: 'chatgpt', label: 'ChatGPT', icon: ChatGPTIcon },
      { value: 'perplexity', label: 'Perplexity', icon: PerplexityIcon },
      { value: 'claude', label: 'Claude', icon: ClaudeIcon },
      { value: 'other', label: 'Other', icon: MoreHorizontal },
    ],
  },
  {
    id: 'email',
    title: 'Email',
    options: [
      { value: 'newsletter', label: 'Newsletter', icon: Mail },
      {
        value: 'superpower-journal',
        label: 'Superpower Journal',
        // React.ComponentType<{ size?: number }> was added specifically for this icon
        icon: SuperpowerIcon,
      },
      { value: 'other', label: 'Other', icon: MoreHorizontal },
    ],
  },
];
