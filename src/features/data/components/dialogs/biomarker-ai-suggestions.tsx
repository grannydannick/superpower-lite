import { H3 } from '@/components/ui/typography';
import { AiSuggestions } from '@/features/messages/components/ai-suggestions';

export const BiomarkerAiSuggestions = ({ name }: { name: string }) => {
  const context = `I'm currently looking at my ${name} biomarker. Please give me some suggestions for questions.`;

  return (
    <div className="pb-8">
      <H3 className="mb-3">Ask Superpower AI</H3>
      <AiSuggestions
        context={context}
        limit={3}
        prefix={`${name}:`}
        eventName="clicked_biomarker_ai_suggestion"
        showAskOwn
      />
    </div>
  );
};
