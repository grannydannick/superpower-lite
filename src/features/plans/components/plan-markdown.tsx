import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Body1, H1, H2, H3, H4 } from '@/components/ui/typography';

// safely render markdown with fallback to old plaintext
export const SafeMarkdown = ({ content }: { content: string }) => {
  try {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: (props) => (
            <Body1 className="mb-4 break-words text-zinc-500" {...props} />
          ),
          h1: (props) => <H1 className="mb-2 break-words" {...props} />,
          h2: (props) => <H2 className="mb-2 break-words" {...props} />,
          h3: (props) => <H3 className="mb-2 break-words" {...props} />,
          h4: (props) => <H4 className="mb-2 break-words" {...props} />,
          ul: (props) => (
            <ul className="mb-4 ml-5 list-disc text-zinc-500" {...props} />
          ),
          ol: (props) => (
            <ol className="mb-4 ml-5 list-decimal text-zinc-500" {...props} />
          ),
          li: (props) => <li className="mb-1 break-words" {...props} />,
          strong: (props) => (
            <strong
              className="break-words font-bold text-zinc-800"
              {...props}
            />
          ),
          a: (props) => (
            <a
              className="break-all text-vermillion-900 hover:underline"
              target="_blank"
              rel="noreferrer"
              {...props}
            >
              {props.children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  } catch (error) {
    return (
      <Body1 className="whitespace-pre-line break-words text-zinc-500">
        {content}
      </Body1>
    );
  }
};
