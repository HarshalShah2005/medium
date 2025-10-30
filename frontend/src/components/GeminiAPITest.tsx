import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { aiWritingService } from '../services/aiWritingService';

const GeminiAPITest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const testConnection = async () => {
    setLoading(true);
    setError('');
    setTestResult('');
    
    try {
      const isConnected = await geminiService.testConnection();
      if (isConnected) {
        setTestResult('✅ Gemini API is working correctly!');
      } else {
        setError('❌ Failed to connect to Gemini API. Please check your API key.');
      }
    } catch (err: any) {
      setError(`❌ Error: ${err.message || 'Connection failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const testTitleSuggestion = async () => {
    setLoading(true);
    setError('');
    setTestResult('');
    
    try {
      const sampleContent = 'This is a blog post about the benefits of regular exercise and maintaining a healthy lifestyle.';
      const titles = await aiWritingService.getTitleSuggestions(sampleContent);
      
      if (titles.length > 0) {
        setTestResult(`✅ Title Suggestions Working!\n\nSuggested titles:\n${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`);
      } else {
        setError('❌ No titles generated. There might be an issue with the API.');
      }
    } catch (err: any) {
      setError(`❌ Error: ${err.message || 'Failed to generate titles'}`);
    } finally {
      setLoading(false);
    }
  };

  const testTextCompletion = async () => {
    setLoading(true);
    setError('');
    setTestResult('');
    
    try {
      const sampleText = 'Artificial Intelligence is transforming the way we';
      const result = await aiWritingService.getTextCompletion({
        text: sampleText,
        type: 'continue'
      });
      
      if (result.completion) {
        setTestResult(`✅ Text Completion Working!\n\nOriginal: "${sampleText}"\n\nCompletion: "${result.completion}"`);
      } else {
        setError('❌ No completion generated. There might be an issue with the API.');
      }
    } catch (err: any) {
      setError(`❌ Error: ${err.message || 'Failed to complete text'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Gemini API Test Suite</h2>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testConnection}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test API Connection'}
        </button>
        
        <button
          onClick={testTitleSuggestion}
          disabled={loading}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test Title Suggestions'}
        </button>
        
        <button
          onClick={testTextCompletion}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test Text Completion'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {testResult && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800 whitespace-pre-wrap">{error}</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="font-semibold text-gray-900 mb-2">API Key Status:</h3>
        <p className="text-sm text-gray-700">
          {import.meta.env.VITE_GEMINI_API_KEY 
            ? `✅ API key found (${import.meta.env.VITE_GEMINI_API_KEY.substring(0, 10)}...)`
            : '❌ No API key found in environment variables'}
        </p>
      </div>
    </div>
  );
};

export default GeminiAPITest;
