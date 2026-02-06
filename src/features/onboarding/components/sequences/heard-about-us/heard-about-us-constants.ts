import type { LucideIcon } from 'lucide-react';
import {
  MoreHorizontal,
  User,
  Users,
  Briefcase,
  HeartPulse,
  Mail,
} from 'lucide-react';

import {
  BingIcon,
  ChatGPTIcon,
  ClaudeIcon,
  FacebookIcon,
  GoogleIcon,
  InstagramIcon,
  LinkedInIcon,
  PerplexityIcon,
  TikTokIcon,
  YouTubeIcon,
} from '@/components/icons/marketing';
import { SuperpowerIcon } from '@/components/icons/superpower-logo';

export type IconComponent =
  | LucideIcon
  | React.ComponentType<React.SVGProps<SVGSVGElement>>
  // this allows icon components that accept a size prop as we have such specific logo
  | React.ComponentType<{ size?: number }>;

export type HeardAboutUsOption = {
  value: string;
  label: string;
  icon: IconComponent;
};

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
      { value: 'linkedin', label: 'LinkedIn', icon: LinkedInIcon },
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
