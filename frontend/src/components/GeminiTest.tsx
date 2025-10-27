import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';

const GeminiTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async () => {
    setIsLoading(true);
    setTestResult('Testing...');
    
    try {
      // Test with a simple request
      const result = await geminiService.summarizeBlog(
        'This is a test blog post about React development.',
        'Test Blog Post'
      );
      setTestResult(`✅ API Working! Result: ${result.summary}`);
    } catch (error) {
      setTestResult(`❌ API Failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAPIKey = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      setTestResult(`✅ API Key found: ${apiKey.substring(0, 10)}...`);
    } else {
      setTestResult('❌ No API Key found in environment variables');
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-4">Gemini API Diagnostics</h3>
      
      <div className="space-y-4">
        <button
          onClick={checkAPIKey}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Check API Key
        </button>
        
        <button
          onClick={testAPI}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test API'}
        </button>
      </div>
      
      {testResult && (
        <div className="mt-4 p-3 bg-white border rounded">
          <pre className="text-sm">{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default GeminiTest;