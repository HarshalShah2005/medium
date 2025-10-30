import React, { useState, useCallback } from 'react';
import { aiWritingService, GrammarSuggestion } from '../services/aiWritingService';

interface AIWritingAssistantProps {
  content: string;
  onContentChange: (content: string) => void;
  onInsertText: (text: string) => void;
}

const AIWritingAssistant: React.FC<AIWritingAssistantProps> = ({
  content,
  onContentChange,
  onInsertText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [grammarSuggestions, setGrammarSuggestions] = useState<GrammarSuggestion[]>([]);
  const [textSuggestions, setTextSuggestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'grammar' | 'complete' | 'improve'>('grammar');
  const [error, setError] = useState<string>('');

  // Check grammar
  const checkGrammar = useCallback(async () => {
    if (!content.trim()) {
      setError('Please enter some text to check.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // Extract plain text from HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      
      if (plainText.length > 1000) {
        setError('Text is too long. Please try with shorter content (max 1000 characters).');
        return;
      }
      
      const result = await aiWritingService.checkGrammar(plainText);
      setGrammarSuggestions(result.matches || []);
      
      if (result.matches && result.matches.length === 0) {
        setError('');
      }
    } catch (error) {
      console.error('Grammar check failed:', error);
      setError('Grammar check service is temporarily unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [content]);

  // Get text completion
  const getTextCompletion = useCallback(async (type: 'continue' | 'improve' | 'rephrase') => {
    if (!content.trim()) {
      setError('Please enter some text first.');
      return;
    }
    
    setLoading(true);
    setError('');
    setTextSuggestions([]); // Clear previous suggestions
    try {
      // Extract plain text from HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      
      if (plainText.length < 10) {
        setError('Please write more content (at least 10 characters) before using AI assistance.');
        return;
      }
      
      if (plainText.length > 1000) {
        setError('Text is too long. Please try with shorter content (max 1000 characters).');
        return;
      }
      
      const result = await aiWritingService.getTextCompletion({
        text: plainText,
        type: type
      });
      
      if (!result.completion || result.completion.trim().length === 0) {
        setError('AI service returned an empty response. Please try again.');
        return;
      }
      
      setTextSuggestions([result.completion, ...result.suggestions].filter(s => s && s.trim()));
      setError('');
    } catch (error) {
      console.error('Text completion failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate suggestions. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [content]);

  // Auto-correct text
  const autoCorrect = useCallback(async () => {
    if (!content.trim()) {
      setError('Please enter some text to auto-correct.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // Extract plain text from HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      
      if (plainText.length > 1000) {
        setError('Text is too long. Please try with shorter content (max 1000 characters).');
        return;
      }
      
      const correctedText = await aiWritingService.autoCorrect(plainText);
      
      if (correctedText === plainText) {
        setError('No corrections needed. Your text looks good!');
      } else {
        onContentChange(correctedText);
        setError('');
      }
    } catch (error) {
      console.error('Auto-correct failed:', error);
      setError('Auto-correct service is temporarily unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [content, onContentChange]);

  // Apply grammar suggestion
  const applyGrammarSuggestion = useCallback((suggestion: GrammarSuggestion, replacementIndex: number = 0) => {
    if (suggestion.replacements.length === 0) return;
    
    // Extract plain text from HTML for correction
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    const replacement = suggestion.replacements[replacementIndex].value;
    const correctedText = 
      plainText.substring(0, suggestion.offset) +
      replacement +
      plainText.substring(suggestion.offset + suggestion.length);
    
    onContentChange(correctedText);
    
    // Remove applied suggestion
    setGrammarSuggestions(prev => prev.filter(s => s !== suggestion));
  }, [content, onContentChange]);

  return (
    <div className="relative">
      {/* AI Assistant Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-200 transition-all duration-200"
        title="AI Writing Assistant"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        AI Assistant
        {grammarSuggestions.length > 0 && (
          <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
            {grammarSuggestions.length}
          </span>
        )}
      </button>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Writing Assistant</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-4">
              <button
                onClick={() => {
                  setActiveTab('grammar');
                  setError('');
                  setTextSuggestions([]);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'grammar'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grammar
                {grammarSuggestions.length > 0 && (
                  <span className="ml-1 text-xs bg-red-500 text-white px-1 rounded-full">
                    {grammarSuggestions.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab('complete');
                  setError('');
                  setTextSuggestions([]);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'complete'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Complete
              </button>
              <button
                onClick={() => {
                  setActiveTab('improve');
                  setError('');
                  setTextSuggestions([]);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'improve'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Improve
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3">
              {/* Grammar Tab */}
              {activeTab === 'grammar' && (
                <div>
                  <div className="flex space-x-2 mb-3">
                    <button
                      onClick={checkGrammar}
                      disabled={loading || !content.trim()}
                      className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Checking...' : 'Check Grammar'}
                    </button>
                    <button
                      onClick={autoCorrect}
                      disabled={loading || !content.trim()}
                      className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Fixing...' : 'Auto-Fix'}
                    </button>
                  </div>
                  
                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}
                  
                  {grammarSuggestions.length > 0 && (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {grammarSuggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-gray-800 mb-2">{suggestion.message}</p>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.replacements.slice(0, 3).map((replacement, repIndex) => (
                              <button
                                key={repIndex}
                                onClick={() => applyGrammarSuggestion(suggestion, repIndex)}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                              >
                                {replacement.value}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {grammarSuggestions.length === 0 && !loading && !error && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Click "Check Grammar" to analyze your text for grammar and spelling issues.
                    </p>
                  )}
                </div>
              )}

              {/* Complete Tab */}
              {activeTab === 'complete' && (
                <div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => getTextCompletion('continue')}
                      disabled={loading || !content.trim()}
                      className="px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Generating...' : 'Continue'}
                    </button>
                    <button
                      onClick={() => getTextCompletion('rephrase')}
                      disabled={loading || !content.trim()}
                      className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Rephrasing...' : 'Rephrase'}
                    </button>
                  </div>
                  
                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}
                  
                  {textSuggestions.length > 0 && (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {textSuggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                          <p className="text-sm text-gray-800 mb-2">{suggestion}</p>
                          <button
                            onClick={() => onInsertText(suggestion)}
                            className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                          >
                            Insert
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {textSuggestions.length === 0 && !loading && !error && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Click "Continue" to extend your text or "Rephrase" to rewrite it differently.
                    </p>
                  )}
                </div>
              )}

              {/* Improve Tab */}
              {activeTab === 'improve' && (
                <div>
                  <button
                    onClick={() => getTextCompletion('improve')}
                    disabled={loading || !content.trim()}
                    className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-3"
                  >
                    {loading ? 'Improving...' : 'Improve Writing'}
                  </button>
                  
                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}
                  
                  {textSuggestions.length > 0 && (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {textSuggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-gray-800 mb-2">{suggestion}</p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => onContentChange(suggestion)}
                              className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                            >
                              Replace All
                            </button>
                            <button
                              onClick={() => onInsertText(suggestion)}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                            >
                              Insert
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {textSuggestions.length === 0 && !loading && !error && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Click "Improve Writing" to get an enhanced version of your text with better clarity and engagement.
                    </p>
                  )}
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIWritingAssistant;