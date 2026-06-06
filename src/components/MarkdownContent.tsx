import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useEffect, useRef } from 'react';

interface Props {
  content: string;
}

export default function MarkdownContent({ content }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      import('prismjs').then((Prism) => {
        const PrismDefault = (Prism as any).default || Prism;
        ref.current?.querySelectorAll('pre code').forEach((block) => {
          PrismDefault.highlightElement(block);
        });
      });
    }
  }, [content]);

  return (
    <div ref={ref} className="prose prose-sm max-w-none text-text-primary
      prose-headings:text-text-primary
      prose-p:text-text-primary prose-p:leading-relaxed
      prose-strong:text-text-primary
      prose-code:bg-bubble prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
      prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-[#f5f2eb] prose-pre:border prose-pre:border-border prose-pre:rounded-lg
      prose-table:border prose-table:border-border
      prose-th:border prose-th:border-border prose-th:bg-bubble prose-th:px-3 prose-th:py-2
      prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2
      prose-li:text-text-primary
      prose-blockquote:border-l-brand prose-blockquote:text-text-secondary
      prose-blockquote:bg-card-bg prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r
    ">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
