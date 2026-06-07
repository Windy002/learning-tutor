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
      prose-headings:text-text-primary prose-headings:font-semibold prose-headings:tracking-tight
      prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
      prose-h1:mt-6 prose-h1:mb-3 prose-h2:mt-5 prose-h2:mb-2 prose-h3:mt-4 prose-h3:mb-2
      prose-p:text-text-primary prose-p:leading-7 prose-p:my-2
      prose-strong:text-text-primary prose-strong:font-semibold
      prose-li:text-text-primary prose-li:leading-7 prose-li:my-0.5
      prose-ul:my-2 prose-ol:my-2 prose-li:marker:text-text-muted
      prose-a:text-brand prose-a:no-underline hover:prose-a:underline
      prose-code:bg-[#f0ede6] prose-code:text-[#3d3929] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-code:font-normal
      prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-[#f5f2eb] prose-pre:border prose-pre:border-[#e8e3dc] prose-pre:rounded-lg prose-pre:shadow-sm prose-pre:text-[13px] prose-pre:leading-relaxed
      prose-table:border prose-table:border-border prose-table:rounded-lg
      prose-th:border prose-th:border-border prose-th:bg-bubble prose-th:px-3 prose-th:py-2 prose-th:text-xs prose-th:font-semibold
      prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2 prose-td:text-sm
      prose-blockquote:border-l-[3px] prose-blockquote:border-l-brand prose-blockquote:text-text-secondary prose-blockquote:not-italic
      prose-blockquote:bg-card-bg prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r prose-blockquote:my-3
      prose-hr:border-border prose-hr:my-4
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
