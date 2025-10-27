import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism } from '../utils/prismConfig';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

// Custom code component with syntax highlighting
const CodeBlock = ({ className, children, ...props }: any) => {
    const codeRef = useRef<HTMLElement>(null);
    
    useEffect(() => {
        if (codeRef.current) {
            try {
                Prism.highlightElement(codeRef.current);
            } catch (error) {
                console.warn('Failed to highlight code block:', error);
            }
        }
    }, [children]);

    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    // Check if language is supported
    const isLanguageSupported = language && Prism.languages[language];

    if (language && isLanguageSupported) {
        return (
            <pre className={`language-${language} rounded-lg overflow-x-auto bg-gray-900 p-4 my-6 shadow-lg`}>
                <code ref={codeRef} className={`language-${language}`} {...props}>
                    {children}
                </code>
            </pre>
        );
    }

    // Fallback for unsupported languages or inline code
    return (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800 border" {...props}>
            {children}
        </code>
    );
};

export const MarkdownRenderer = ({ content, className }: MarkdownRendererProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Highlight all code blocks after component renders
        if (containerRef.current) {
            try {
                Prism.highlightAllUnder(containerRef.current);
            } catch (error) {
                console.warn('Failed to highlight code blocks:', error);
            }
        }
    }, [content]);

    return (
        <div ref={containerRef} className={`prose prose-lg max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Code blocks with syntax highlighting
                    code: CodeBlock,
                    
                    // Custom heading styles
                    h1: ({ children }) => (
                        <h1 className="text-4xl font-bold text-gray-900 mb-6 mt-8 border-b border-gray-200 pb-3">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-3xl font-bold text-gray-900 mb-4 mt-6">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-5">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-xl font-semibold text-gray-900 mb-2 mt-4">
                            {children}
                        </h4>
                    ),
                    h5: ({ children }) => (
                        <h5 className="text-lg font-medium text-gray-900 mb-2 mt-3">
                            {children}
                        </h5>
                    ),
                    h6: ({ children }) => (
                        <h6 className="text-base font-medium text-gray-900 mb-2 mt-2">
                            {children}
                        </h6>
                    ),
                    
                    // Paragraph styling
                    p: ({ children }) => (
                        <p className="mb-4 leading-relaxed text-gray-700 text-lg">
                            {children}
                        </p>
                    ),
                    
                    // List styling
                    ul: ({ children }) => (
                        <ul className="mb-6 pl-6 space-y-2">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="mb-6 pl-6 space-y-2 list-decimal">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="text-gray-700 leading-relaxed">
                            {children}
                        </li>
                    ),
                    
                    // Blockquote styling
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-6 py-2 my-6 bg-blue-50 rounded-r-lg">
                            <div className="text-gray-700 italic">
                                {children}
                            </div>
                        </blockquote>
                    ),
                    
                    // Link styling
                    a: ({ children, href }) => (
                        <a 
                            href={href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2 hover:decoration-blue-800 transition-colors"
                        >
                            {children}
                        </a>
                    ),
                    
                    // Text formatting
                    strong: ({ children }) => (
                        <strong className="font-bold text-gray-900">
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-gray-800">
                            {children}
                        </em>
                    ),
                    
                    // Tables
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-6">
                            <table className="min-w-full border border-gray-300">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-gray-50">
                            {children}
                        </thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-gray-200">
                            {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-gray-50">
                            {children}
                        </tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-300">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-3 text-sm text-gray-700 border border-gray-300">
                            {children}
                        </td>
                    ),
                    
                    // Horizontal rule
                    hr: () => (
                        <hr className="my-8 border-t-2 border-gray-200" />
                    ),
                    
                    // Images
                    img: ({ src, alt }) => (
                        <img 
                            src={src} 
                            alt={alt} 
                            className="max-w-full h-auto rounded-lg shadow-md my-6 mx-auto block"
                        />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};