import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

import { StyledMarkdown } from '@/components/shared/styled-markdown';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { H3 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { Biomarker, MetadataContent } from '@/types/api';
import { capitalize } from '@/utils/format';

import { pluralizeIs } from '../../utils/pluralize';

import { BiomarkerAiSuggestions } from './biomarker-ai-suggestions';
import { BiomarkerFamilyRiskSuggestions } from './biomarker-family-risk-suggestions';

export function BiomarkerContentTabs({ biomarker }: { biomarker: Biomarker }) {
  let tabs = [
    {
      component: <ExplanationTab biomarker={biomarker} />,
      value: 'explanation',
    },
  ];

  return (
    <Tabs defaultValue="explanation">
      {tabs.length > 1 && (
        <TabsList className="flex h-auto flex-wrap items-center justify-start">
          {tabs.map((t) => (
            <TabsTrigger
              value={t.value}
              className="text-base lg:text-base"
              key={t.value}
            >
              {capitalize(t.value)}
            </TabsTrigger>
          ))}
        </TabsList>
      )}
      {tabs.map((t) => (
        <TabsContent value={t.value} className="mt-10" key={t.value}>
          {t.component}
        </TabsContent>
      ))}
    </Tabs>
  );
}

const ExplanationTab = ({ biomarker }: { biomarker: Biomarker }) => {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);

  const {
    name,
    description,
    importance,
    metadata: biomarkerMetadata,
  } = biomarker;
  const content = biomarkerMetadata.content;
  const sources = biomarkerMetadata.source;

  const metadata = [...content];

  const isTextType = biomarker.dataType === 'text';
  const isQualitativeType = biomarker.dataType === 'codedValue';

  if (!isTextType && importance.length > 0) {
    metadata.unshift({
      title: `Why ${pluralizeIs(name)} ${name} important?`,
      text: importance,
      status: 'UNKNOWN',
    } as MetadataContent);
  }

  if (!isTextType) {
    const questionTitle = isQualitativeType
      ? `What does ${name} mean?`
      : `What ${pluralizeIs(name)} ${name}?`;

    metadata.unshift({
      title: questionTitle,
      text: description,
      status: 'UNKNOWN',
    } as MetadataContent);
  }

  return (
    <div className="flex flex-col gap-6">
      <BiomarkerFamilyRiskSuggestions biomarker={biomarker} />
      {biomarker.status !== 'RECOMMENDED' ? (
        <BiomarkerAiSuggestions name={name} />
      ) : null}
      {metadata.map((item) => (
        <div key={item.title} className="flex flex-col gap-2">
          <H3>{item.title}</H3>
          <StyledMarkdown className="space-y-4 text-secondary" variant="small">
            {typeof item.text === 'string'
              ? item.text.replace(/([^\n])\n([^\n])/g, '$1  \n$2')
              : item.text}
          </StyledMarkdown>
        </div>
      ))}
      {sources.length > 0 && (
        <div className="mt-4">
          <Accordion
            type="single"
            collapsible
            value={isSourcesOpen ? 'sources' : ''}
            onValueChange={(value) => setIsSourcesOpen(value === 'sources')}
          >
            <AccordionItem
              value="sources"
              className="flex flex-col items-start justify-start border-b-0"
            >
              <AccordionTrigger className="rounded-xl p-0 [&>svg]:hidden">
                <Button
                  variant="outline"
                  className="group h-10 gap-2 rounded-xl"
                >
                  Sources
                  <ArrowUpRight
                    className={cn(
                      'size-4 text-zinc-400 transition-all duration-200 group-hover:rotate-45',
                      isSourcesOpen && 'rotate-90',
                    )}
                  />
                </Button>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <ul className="mt-4 flex flex-col gap-2 px-2">
                  {sources.map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        rel="noreferrer"
                        target="_blank"
                        className="group text-sm hover:underline"
                      >
                        {source.text}
                        <ArrowUpRight className="mb-0.5 ml-1.5 inline-block size-3.5 text-zinc-400 transition-all group-hover:mb-1 group-hover:ml-2" />
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
};
