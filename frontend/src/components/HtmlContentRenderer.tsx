import React from 'react';

interface HtmlContentRendererProps {
  content: string;
  className?: string;
}

const HtmlContentRenderer: React.FC<HtmlContentRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  return (
    <div 
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        // Custom styles to match TipTap editor styles
        lineHeight: '1.6',
      }}
    />
  );
};

export default HtmlContentRenderer;