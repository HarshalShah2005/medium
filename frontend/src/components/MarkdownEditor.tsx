import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism } from '../utils/prismConfig';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

// Custom code component for syntax highlighting
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
            <pre className={`language-${language} rounded-lg overflow-x-auto bg-gray-900 p-4 my-4`}>
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

export const MarkdownEditor = ({ value, onChange, placeholder, className }: MarkdownEditorProps) => {
    const [isPreview, setIsPreview] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertMarkdown = (before: string, after: string = '') => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        
        const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
        onChange(newText);

        // Restore cursor position
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length + selectedText.length + after.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const insertList = (type: 'bullet' | 'number') => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        // Find the start of the current line
        const beforeCursor = value.substring(0, start);
        const lineStart = beforeCursor.lastIndexOf('\n') + 1;
        const currentLine = value.substring(lineStart, end);
        
        const prefix = type === 'bullet' ? '- ' : '1. ';
        const newText = value.substring(0, lineStart) + prefix + currentLine + value.substring(end);
        onChange(newText);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + prefix.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const insertCodeBlock = () => {
        insertMarkdown('\n```javascript\n', '\n```\n');
    };

    const insertHeading = (level: number) => {
        const hashes = '#'.repeat(level);
        insertMarkdown(`${hashes} `, '');
    };

    const toolbarButtons = [
        {
            title: 'Bold',
            icon: 'B',
            action: () => insertMarkdown('**', '**'),
            style: 'font-bold'
        },
        {
            title: 'Italic',
            icon: 'I',
            action: () => insertMarkdown('*', '*'),
            style: 'italic'
        },
        {
            title: 'Underline',
            icon: 'U',
            action: () => insertMarkdown('<u>', '</u>'),
            style: 'underline'
        },
        {
            title: 'Heading 1',
            icon: 'H1',
            action: () => insertHeading(1),
            style: 'text-xl font-bold'
        },
        {
            title: 'Heading 2',
            icon: 'H2',
            action: () => insertHeading(2),
            style: 'text-lg font-bold'
        },
        {
            title: 'Heading 3',
            icon: 'H3',
            action: () => insertHeading(3),
            style: 'text-base font-bold'
        },
        {
            title: 'Bullet List',
            icon: '•',
            action: () => insertList('bullet'),
            style: 'text-xl'
        },
        {
            title: 'Numbered List',
            icon: '1.',
            action: () => insertList('number'),
            style: 'text-sm'
        },
        {
            title: 'Code Block',
            icon: '</>', 
            action: insertCodeBlock,
            style: 'font-mono'
        },
        {
            title: 'Link',
            icon: '🔗',
            action: () => insertMarkdown('[', '](url)'),
            style: ''
        }
    ];

    return (
        <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-1">
                    {toolbarButtons.map((button, index) => (
                        <button
                            key={index}
                            onClick={button.action}
                            title={button.title}
                            className={`px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors ${button.style}`}
                        >
                            {button.icon}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsPreview(!isPreview)}
                        className={`px-3 py-1 text-sm border rounded transition-colors ${
                            isPreview 
                                ? 'bg-blue-500 text-white border-blue-500' 
                                : 'border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                        {isPreview ? 'Edit' : 'Preview'}
                    </button>
                </div>
            </div>

            {/* Editor/Preview Area */}
            <div className="min-h-[400px]">
                {isPreview ? (
                    <div className="p-4 prose prose-sm max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code: CodeBlock,
                                h1: ({ children }) => <h1 className="text-3xl font-bold mb-4">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-2xl font-bold mb-3">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-xl font-bold mb-2">{children}</h3>,
                                h4: ({ children }) => <h4 className="text-lg font-bold mb-2">{children}</h4>,
                                p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                                ul: ({ children }) => <ul className="mb-4 pl-6 list-disc">{children}</ul>,
                                ol: ({ children }) => <ol className="mb-4 pl-6 list-decimal">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4">
                                        {children}
                                    </blockquote>
                                ),
                                a: ({ children, href }) => (
                                    <a href={href} className="text-blue-600 hover:text-blue-800 underline">
                                        {children}
                                    </a>
                                ),
                                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                            }}
                        >
                            {value || 'Nothing to preview yet...'}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full h-[400px] p-4 border-none outline-none resize-none font-mono text-sm leading-relaxed"
                        style={{ minHeight: '400px' }}
                    />
                )}
            </div>

            {/* Help text */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                <div className="flex justify-between">
                    <span>
                        Tip: Use ** for bold, * for italic, # for headings, ``` for code blocks
                    </span>
                    <span>
                        {value.length} characters
                    </span>
                </div>
            </div>
        </div>
    );
};