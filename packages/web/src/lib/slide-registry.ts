import type { ComponentType } from 'react';
import type { Slide, SlideType } from '@wrapp0r/shared';
import { TitleSlide } from '@/components/wrapped/slides/TitleSlide';
import { StatSlide } from '@/components/wrapped/slides/StatSlide';
import { ChartSlide } from '@/components/wrapped/slides/ChartSlide';
import { ListSlide } from '@/components/wrapped/slides/ListSlide';
import { ComparisonSlide } from '@/components/wrapped/slides/ComparisonSlide';
import { QuoteSlide } from '@/components/wrapped/slides/QuoteSlide';
import { SummarySlide } from '@/components/wrapped/slides/SummarySlide';

// Type-safe registry mapping slide types to their components
type SlideComponentProps<T extends Slide> = {
  slide: T;
};

type SlideComponentRegistry = {
  [K in SlideType]: ComponentType<SlideComponentProps<Extract<Slide, { type: K }>>>;
};

export const slideRegistry: SlideComponentRegistry = {
  title: TitleSlide,
  stat: StatSlide,
  chart: ChartSlide,
  list: ListSlide,
  comparison: ComparisonSlide,
  quote: QuoteSlide,
  summary: SummarySlide,
};

// Get the component for a specific slide type
export function getSlideComponent(type: SlideType): ComponentType<SlideComponentProps<Slide>> {
  const component = slideRegistry[type];
  if (!component) {
    throw new Error(`Unknown slide type: ${type}`);
  }
  // We need to cast here because TypeScript can't infer the correct type
  return component as ComponentType<SlideComponentProps<Slide>>;
}
