import React, { useState, useEffect } from 'react';
import { geminiService, BlogSummary } from '../services/geminiService';

interface BlogAISummaryProps {
  blogTitle: string;
  blogContent: string;
}

const BlogAISummary: React.FC<BlogAISummaryProps> = ({ blogTitle, blogContent }) => {
  const [summary, setSummary] = useState<BlogSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSummary = async () => {
      if (!blogContent || !blogTitle) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await geminiService.summarizeBlog(blogContent, blogTitle);
        setSummary(result);
      } catch (err) {
        setError('Failed to generate AI summary');
        console.error('Summary generation error:', err);
      } finally {
        setLoading(false);
      }
    };

    generateSummary();
  }, [blogTitle, blogContent]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <h3 className="text-lg font-semibold text-blue-800">🤖 AI Summary</h3>
        </div>
        <div className="text-blue-600">Generating intelligent summary...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex items-center mb-2">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800">AI Summary Unavailable</h3>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center mb-4">
        <div className="bg-blue-600 rounded-full p-2 mr-3">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-blue-800">🤖 AI Summary</h3>
        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          Powered by Gemini
        </span>
      </div>

      {/* Summary Paragraph */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm leading-relaxed bg-white/60 p-4 rounded-md border">
          {summary.summary}
        </p>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-blue-200">
        <p className="text-xs text-blue-600 text-center">
          ✨ AI-generated summary to help you understand the content quickly
        </p>
      </div>
    </div>
  );
};

export default BlogAISummary;