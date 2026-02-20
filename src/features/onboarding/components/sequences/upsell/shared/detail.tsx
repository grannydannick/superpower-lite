import { IconSparkle } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconSparkle';
import { IconStar } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconStar';
import { IconTag } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconTag';
import { ChevronLeft } from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';

import {
  Tabs as RadixTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { H2, H3 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';

import { useSequence } from '../../../../hooks/use-screen-sequence';
import { Sequence } from '../../../sequence';

import { BackButton } from './back-button';

/**
 * Detail.Header - Back button + centered "Recommended for you" title (mobile)
 * On desktop: just back button, left aligned
 */
const Header = ({ className }: { className?: string }) => {
  const { back } = useSequence();

  return (
    <Sequence.StepHeader
      className={cn('flex items-center justify-between md:hidden', className)}
    >
      <button
        type="button"
        onClick={back}
        className="flex size-9 items-center justify-center text-zinc-500"
        aria-label="Go back"
      >
        <ChevronLeft className="size-6" />
      </button>
      <span className="text-sm font-medium text-zinc-900">
        Recommended for you
      </span>
      <div className="size-9" />
    </Sequence.StepHeader>
  );
};

/**
 * Detail.Subheader - Label badge + optional pretext + H1 headline
 */
type SubheaderProps = PropsWithChildren<{
  label?: string;
  labelClassName?: string;
  pretext?: string;
  className?: string;
}>;

const Subheader = ({
  label,
  labelClassName,
  pretext,
  children,
  className,
}: SubheaderProps) => (
  <div className={cn('shrink-0 space-y-4 px-6', className)}>
    {label && (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full bg-vermillion-900/10 px-2.5 py-2',
          labelClassName,
        )}
      >
        <IconSparkle className="size-3.5 text-vermillion-900" />
        <span className="text-sm text-vermillion-900">{label}</span>
      </div>
    )}
    <div className="space-y-2">
      {pretext && <p className="text-base text-zinc-500">{pretext}</p>}
      <H2>{children}</H2>
    </div>
  </div>
);

/**
 * Detail.Content - Scrollable content area
 */
const Content = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div className={cn('mt-6 flex-1 overflow-y-auto px-6 py-4', className)}>
    {children}
  </div>
);

/**
 * Detail.Footer - Space-y-3 wrapper inside Sequence.StepFooter with fade gradient
 */
const Footer = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <Sequence.StepFooter className="md:hidden">
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 -mt-8 w-full space-y-3 bg-zinc-50 px-6 py-4 pt-6',
        className,
      )}
      style={{
        maskImage: 'linear-gradient(to top, black 90%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to top, black 90%, transparent 100%)',
      }}
    >
      {children}
    </div>
  </Sequence.StepFooter>
);

/**
 * Detail.Tabs - Tab navigation for mobile view (Overview / What we test)
 * Hidden on desktop (md:hidden)
 */
type TabsProps = PropsWithChildren<{
  defaultValue?: string;
  className?: string;
}>;

const Tabs = ({
  defaultValue = 'overview',
  children,
  className,
}: TabsProps) => (
  <RadixTabs defaultValue={defaultValue} className={cn('md:hidden', className)}>
    {children}
  </RadixTabs>
);

const TabList = ({ className }: { className?: string }) => (
  <TabsList
    showUnderline
    className={cn('w-full justify-start gap-4 px-5 pt-4', className)}
  >
    <TabsTrigger value="overview" className="py-1 text-base">
      Overview
    </TabsTrigger>
    <TabsTrigger value="biomarkers" className="py-1 text-base">
      What we test
    </TabsTrigger>
  </TabsList>
);

const TabPanel = ({
  value,
  children,
  className,
}: PropsWithChildren<{ value: string; className?: string }>) => (
  <TabsContent value={value} className={cn('pb-72', className)}>
    {children}
  </TabsContent>
);

/**
 * Detail.Section - Content section with heading and body
 */
type SectionProps = PropsWithChildren<{
  title: string;
  className?: string;
}>;

const Section = ({ title, children, className }: SectionProps) => (
  <div className={cn('space-y-2', className)}>
    <H3 className="text-lg md:text-xl">{title}</H3>
    <div className="text-base text-zinc-500">{children}</div>
  </div>
);

/**
 * Detail.BulletPoint - Icon + text row for feature lists
 */
type BulletPointProps = PropsWithChildren<{
  icon: ReactNode;
  className?: string;
}>;

const BulletPoint = ({ icon, children, className }: BulletPointProps) => (
  <div className={cn('flex gap-3', className)}>
    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-vermillion-900/10">
      {icon}
    </div>
    <div className="flex-1 pt-0.5 text-base text-zinc-500">{children}</div>
  </div>
);

/**
 * Detail.ServiceCard - Product card with image, title, pricing
 * Shown on mobile above CTAs
 */
type ServiceCardProps = {
  title: string;
  subtitle?: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  image?: string;
  className?: string;
};

const ServiceCard = ({
  title,
  subtitle = 'One-time upgrade',
  originalPrice,
  salePrice,
  discountPercent,
  image,
  className,
}: ServiceCardProps) => (
  <div
    className={cn(
      'flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:hidden',
      className,
    )}
  >
    {image && (
      <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
        <img src={image} alt="" className="size-full object-cover" />
      </div>
    )}
    <div className="flex-1">
      <p className="text-base font-medium text-zinc-900">{title}</p>
      <p className="text-xs text-zinc-500">{subtitle}</p>
    </div>
    <div className="text-right">
      <p className="text-sm">
        <span className="text-zinc-400 line-through">
          {formatMoney(originalPrice)}
        </span>{' '}
        <span className="text-zinc-900">{formatMoney(salePrice)}</span>
      </p>
      <div className="flex items-center justify-end gap-1 text-xs text-vermillion-900">
        <IconTag className="size-3" />
        <span>{discountPercent}% OFF</span>
      </div>
    </div>
  </div>
);

/**
 * Detail.ResponsiveLayout - Two-column layout for desktop, single column for mobile
 */
type ResponsiveLayoutProps = PropsWithChildren<{
  leftContent?: ReactNode;
  className?: string;
}>;

const ResponsiveLayout = ({
  leftContent,
  children,
  className,
}: ResponsiveLayoutProps) => (
  <div
    className={cn(
      'flex flex-1 flex-col md:mx-auto md:w-full md:max-w-screen-2xl',
      className,
    )}
  >
    <BackButton className="hidden p-8 pb-0 md:flex" />

    <div className="flex flex-1 flex-col md:flex-row">
      {leftContent && (
        <div className="hidden md:block md:w-1/2 md:p-8">
          <div className="sticky top-16 space-y-4">{leftContent}</div>
        </div>
      )}
      <div className="flex flex-1 flex-col md:w-1/2 md:p-8">{children}</div>
    </div>
  </div>
);

/**
 * Detail.ProductImage - Large product image for desktop left column
 */
type ProductImageProps = {
  src: string;
  alt?: string;
  className?: string;
};

const ProductImage = ({ src, alt = '', className }: ProductImageProps) => (
  <div
    className={cn(
      'aspect-square w-full overflow-hidden rounded-3xl border border-zinc-200 bg-white',
      className,
    )}
  >
    <img src={src} alt={alt} className="size-full object-contain" />
  </div>
);

/**
 * Detail.Pricing - Inline pricing display for desktop
 */
type PricingProps = {
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  className?: string;
};

const Pricing = ({
  originalPrice,
  salePrice,
  discountPercent,
  className,
}: PricingProps) => (
  <div className={cn('hidden items-center gap-4 md:flex', className)}>
    <p className="text-xl tracking-tight">
      <span className="text-zinc-400 line-through">
        {formatMoney(originalPrice)}
      </span>
      {'  '}
      <span className="text-zinc-900">{formatMoney(salePrice)}</span>
    </p>
    <div className="flex items-center gap-1 text-sm text-vermillion-900">
      <IconTag className="size-3.5" />
      <span>{discountPercent}% OFF</span>
    </div>
  </div>
);

/**
 * Detail.CTAGroup - CTA buttons that work in both mobile footer and desktop inline
 */
type CTAGroupProps = PropsWithChildren<{
  className?: string;
}>;

const CTAGroup = ({ children, className }: CTAGroupProps) => (
  <div className={cn('flex w-full flex-col gap-2', className)}>{children}</div>
);

/**
 * Detail.BiomarkerItem - Biomarker list item with title and description
 */
type BiomarkerItemProps = {
  title: string;
  description: string;
  className?: string;
};

const BiomarkerItem = ({
  title,
  description,
  className,
}: BiomarkerItemProps) => (
  <div className={cn('flex gap-3 pl-3', className)}>
    <div className="mt-[9px] size-[5px] shrink-0 rounded-full bg-vermillion-900" />
    <div className="flex-1 space-y-1">
      <p className="text-base leading-[22px] text-zinc-900">{title}</p>
      <p className="text-base text-zinc-500">{description}</p>
    </div>
  </div>
);

/**
 * Detail.CuratedByResearchTeam - Self-contained curated by badge
 * with Superpower's Research Team avatars and text
 */
const RESEARCH_TEAM_AVATARS = [
  '/onboarding/shared/avatars/avatar-1.webp',
  '/onboarding/shared/avatars/avatar-2.webp',
  '/onboarding/shared/avatars/avatar-3.webp',
];

const CuratedByResearchTeam = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'flex items-center gap-4 rounded-2xl bg-zinc-100 p-4',
      className,
    )}
  >
    <div className="flex items-center pr-1.5">
      {RESEARCH_TEAM_AVATARS.map((src, index) => (
        <div
          key={src}
          className="relative -mr-1.5 size-5 shrink-0 rounded-full border border-zinc-100 shadow-md"
          style={{ zIndex: 3 - index }}
        >
          <img
            src={src}
            alt=""
            className="absolute inset-0 size-full rounded-full object-cover"
          />
        </div>
      ))}
    </div>
    <p className="text-sm text-zinc-500">
      Curated by Superpower&apos;s Research Team
    </p>
  </div>
);

/**
 * Detail.PoweredByBadge - "Powered by" badge with logo
 * Compose logo img as children
 */
const PoweredByBadge = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div className={cn('flex items-center gap-1', className)}>
    <p className="text-xs text-zinc-500">Powered by</p>
    {children}
  </div>
);

/**
 * Detail.ReviewCard - Individual review container
 * Compose review content as children
 */
const ReviewCard = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div className={cn('flex flex-col gap-2', className)}>{children}</div>
);

/**
 * Detail.ReviewsGrid - 2-column grid for reviews
 * Compose ReviewCard children
 */
const ReviewsGrid = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div className={cn('grid grid-cols-1 gap-6 md:grid-cols-2', className)}>
    {children}
  </div>
);

/**
 * Detail.ReviewsHeader - Header for reviews section
 * Compose title, stars, rating as children
 */
const ReviewsHeader = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div className={cn('flex flex-col gap-2', className)}>{children}</div>
);

/**
 * Detail.ReviewsSection - Full reviews section (desktop only)
 * Compose ReviewsHeader, description, ReviewsGrid as children
 */
const ReviewsSection = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div className={cn('hidden flex-col gap-4 md:flex', className)}>
    {children}
  </div>
);

/**
 * Detail.Label - Badge with sparkle icon for "Based on your goals"
 * Backward compatibility component for existing detail panels
 */
const Label = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'inline-flex items-center gap-2 rounded-full bg-zinc-100 px-2.5 py-2',
      className,
    )}
  >
    <IconSparkle className="size-3.5 text-vermillion-900" />
    <span className="text-sm text-secondary">Based on your goals</span>
  </div>
);

/**
 * Detail.BiomarkerCard - Card container for biomarker list (desktop style from Figma)
 * White card with border, contains BiomarkerCardItem children with dividers
 */
const BiomarkerCard = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <div
    className={cn(
      'flex flex-col gap-1 rounded-2xl border border-zinc-200 bg-white py-1 shadow-[0px_0px_2px_0px_rgba(0,0,0,0.04),0px_2px_2px_0px_rgba(0,0,0,0.02)]',
      className,
    )}
  >
    {children}
  </div>
);

/**
 * Detail.BiomarkerCardDivider - Horizontal divider between biomarker items
 */
const BiomarkerCardDivider = () => (
  <div className="px-4">
    <div className="h-px w-full bg-zinc-100" />
  </div>
);

/**
 * MiniChart - Simple decorative chart with dashed line and endpoint dot
 */
const MiniChart = () => (
  <div className="relative h-[76px] w-[74px] shrink-0">
    {/* Y-Indicator bars (rightmost, full height) */}
    <div className="absolute inset-y-2 right-0 flex w-[2px] flex-col gap-[2px]">
      <div className="flex-1 rounded-full bg-[#11c182]" />
      <div className="flex-1 rounded-full bg-[#d7db0e]" />
      <div className="flex-1 rounded-full bg-[#ff68de]" />
    </div>
    {/* Green background band - aligned with top indicator */}
    <div className="absolute left-0 right-[6px] top-2 h-[20px] rounded-sm bg-[#e9f9f3]" />
    {/* Dashed line - vertically centered in green band */}
    <div className="absolute left-0 right-[10px] top-[18px] border-t-2 border-dashed border-[#11c182]" />
    {/* Endpoint dot */}
    <div className="absolute right-[6px] top-[13px] size-[10px] rounded-full border-2 border-white bg-[#11c182] shadow-sm" />
    {/* Left fade gradient */}
    <div className="absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white to-transparent" />
  </div>
);

/**
 * Detail.BiomarkerCardItem - Individual biomarker row inside BiomarkerCard
 * Shows title and optional description with mini chart
 */
type BiomarkerCardItemProps = {
  title: string;
  description?: string;
  className?: string;
};

const BiomarkerCardItem = ({
  title,
  description,
  className,
}: BiomarkerCardItemProps) => (
  <div className={cn('flex h-[76px] items-center gap-3 px-3', className)}>
    <div className="flex flex-1 flex-col justify-center gap-0.5 py-4">
      <p className="text-base leading-[22px] tracking-[-0.16px] text-zinc-900">
        {title}
      </p>
      {description && (
        <p className="text-xs leading-[15px] tracking-[0.06px] text-zinc-500">
          {description}
        </p>
      )}
    </div>
    <MiniChart />
  </div>
);

type Biomarker = {
  title: string;
  description?: string;
};

type BiomarkerListProps = {
  biomarkers: Biomarker[];
  className?: string;
};

const BiomarkerList = ({ biomarkers, className }: BiomarkerListProps) => (
  <BiomarkerCard className={className}>
    {biomarkers.map((biomarker, index) => (
      <div key={biomarker.title}>
        <BiomarkerCardItem
          title={biomarker.title}
          description={biomarker.description}
        />
        {index < biomarkers.length - 1 && <BiomarkerCardDivider />}
      </div>
    ))}
  </BiomarkerCard>
);

type TestimonialData = {
  name: string;
  rating: number;
  text: string;
};

const StarRating = ({ rating, max = 5 }: { rating: number; max?: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <IconStar
        key={i}
        className={cn(
          'size-3.5',
          i < rating ? 'text-vermillion-900' : 'text-zinc-300',
        )}
      />
    ))}
  </div>
);

const Testimonial = ({
  name,
  rating,
  text,
  className,
}: TestimonialData & { className?: string }) => (
  <div className={cn('space-y-2', className)}>
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-zinc-900">{name}</span>
      <StarRating rating={rating} />
    </div>
    <p className="text-sm leading-relaxed text-zinc-500">{text}</p>
  </div>
);

type TestimonialListProps = {
  testimonials: TestimonialData[];
  className?: string;
};

const TestimonialList = ({ testimonials, className }: TestimonialListProps) => (
  <div className={cn('space-y-6', className)}>
    {testimonials.map((testimonial) => (
      <Testimonial key={testimonial.name} {...testimonial} />
    ))}
  </div>
);

export const Detail = {
  Header,
  Subheader,
  Content,
  Footer,
  Tabs,
  TabList,
  TabPanel,
  Section,
  BulletPoint,
  ServiceCard,
  ResponsiveLayout,
  ProductImage,
  Pricing,
  CTAGroup,
  BiomarkerItem,
  BiomarkerCard,
  BiomarkerCardItem,
  BiomarkerCardDivider,
  BiomarkerList,
  CuratedByResearchTeam,
  PoweredByBadge,
  ReviewCard,
  ReviewsGrid,
  ReviewsHeader,
  ReviewsSection,
  Label,
  StarRating,
  Testimonial,
  TestimonialList,
};
