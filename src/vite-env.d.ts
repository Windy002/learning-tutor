/// <reference types="vite/client" />

declare module 'prismjs' {
  const Prism: {
    highlightElement(element: Element): void;
    highlight(text: string, grammar: any, language: string): string;
    languages: Record<string, any>;
  };
  export default Prism;
}
