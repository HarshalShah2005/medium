import React, { useState, useCallback } from 'react';
import { aiWritingService } from '../services/aiWritingService';

interface TitleSuggestionsProps {
  content: string;
  currentTitle: string;
  onTitleSelect: (title: string) => void;
}

const TitleSuggestions: React.FC<TitleSuggestionsProps> = ({
  content,
  currentTitle,
  onTitleSelect,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const generateTitles = useCallback(async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      // Extract plain text from HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      
      const titles = await aiWritingService.getTitleSuggestions(plainText);
      setSuggestions(titles);
      setIsOpen(true);
    } catch (error) {
      console.error('Title generation failed:', error);
    } finally {
      setLoading(false);
    }
  }, [content]);

  return (
    <div className="relative">
      <button
        onClick={generateTitles}
        disabled={loading || !content.trim()}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        title="Generate title suggestions based on content"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {loading ? 'Generating...' : 'Suggest Titles'}
      </button>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-w-md">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">Title Suggestions</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {suggestions.map((title, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onTitleSelect(title);
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-purple-50 rounded-md border border-gray-200 hover:border-purple-200 transition-colors"
                >
                  {title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TitleSuggestions;