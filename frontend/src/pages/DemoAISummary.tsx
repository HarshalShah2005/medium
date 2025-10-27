import HtmlContentRenderer from '../components/HtmlContentRenderer';
import BlogAISummary from '../components/BlogAISummary';
import GeminiTest from '../components/GeminiTest';
import { Appbar } from '../components/Appbar';

const DemoAISummary = () => {
  const demoBlogTitle = "The Future of Artificial Intelligence in Web Development";
  const demoBlogContent = `
    <h1>The Future of Artificial Intelligence in Web Development</h1>
    
    <p>Artificial Intelligence (AI) is revolutionizing the way we approach web development. From automated code generation to intelligent user interfaces, AI is becoming an integral part of the modern developer's toolkit.</p>
    
    <h2>AI-Powered Development Tools</h2>
    <p>Modern development environments now include AI assistants that can:</p>
    <ul>
      <li>Generate code snippets based on natural language descriptions</li>
      <li>Automatically detect and fix bugs</li>
      <li>Suggest optimal code patterns and best practices</li>
      <li>Provide real-time code reviews and optimization suggestions</li>
    </ul>
    
    <h2>Machine Learning in User Experience</h2>
    <p>Machine learning algorithms are being used to create more personalized and intuitive user experiences:</p>
    <ul>
      <li><strong>Personalized Content:</strong> AI analyzes user behavior to deliver customized content</li>
      <li><strong>Smart Search:</strong> Natural language processing improves search functionality</li>
      <li><strong>Predictive Interfaces:</strong> AI anticipates user needs and actions</li>
    </ul>
    
    <h3>Code Example: AI-Powered Search</h3>
    <pre><code>
// AI-enhanced search function
function smartSearch(query, context) {
  const aiModel = new AISearchModel();
  const enhancedQuery = aiModel.processNaturalLanguage(query);
  return searchDatabase(enhancedQuery, context);
}
    </code></pre>
    
    <h2>Challenges and Considerations</h2>
    <p>While AI brings many benefits, developers should be aware of potential challenges:</p>
    <ol>
      <li><strong>Data Privacy:</strong> Ensuring user data is protected when using AI services</li>
      <li><strong>Performance:</strong> Balancing AI features with application performance</li>
      <li><strong>Accuracy:</strong> Understanding the limitations of AI predictions</li>
      <li><strong>Ethical Considerations:</strong> Implementing AI responsibly and fairly</li>
    </ol>
    
    <h2>Getting Started with AI in Your Projects</h2>
    <p>To begin incorporating AI into your web development projects:</p>
    <ul>
      <li>Start with pre-built AI APIs like Google's Gemini or OpenAI's GPT</li>
      <li>Experiment with AI-powered development tools like GitHub Copilot</li>
      <li>Learn about machine learning frameworks like TensorFlow.js</li>
      <li>Practice building AI-enhanced user interfaces</li>
    </ul>
    
    <h2>Conclusion</h2>
    <p>The integration of AI in web development is not just a trend—it's the future. As AI technologies continue to evolve, developers who embrace these tools will be better positioned to create innovative, efficient, and user-friendly applications. The key is to start experimenting with AI tools today and gradually incorporate them into your development workflow.</p>
    
    <p>Remember that AI is meant to augment human creativity and problem-solving, not replace it. The most successful projects will be those that combine the best of human insight with the power of artificial intelligence.</p>
  `;

  return (
    <div>
      <Appbar />
      <div className="flex justify-center">
        <div className="grid grid-cols-12 px-10 w-full pt-200 max-w-screen-xl pt-12">
          <div className="col-span-8">
            <div className="text-5xl font-extrabold">
              {demoBlogTitle}
            </div>
            <div className="text-slate-500 pt-2">
              Demo Post - AI Summary Showcase
            </div>
            <div className="pt-4">
              <HtmlContentRenderer content={demoBlogContent} />
            </div>
          </div>
          <div className="col-span-4">
            {/* Gemini API Test */}
            <GeminiTest />
            
            {/* AI Summary Demo */}
            <BlogAISummary 
              blogTitle={demoBlogTitle}
              blogContent={demoBlogContent}
            />
            
            <div className="text-slate-600 text-lg mt-6">
              About This Demo
            </div>
            <div className="bg-gray-50 border rounded-lg p-4 mt-2">
              <p className="text-sm text-gray-700">
                This is a demonstration of the AI Blog Summarizer feature. 
                The AI analyzes the blog content and generates:
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• SEO-optimized meta description</li>
                <li>• Main topic extraction</li>
                <li>• Detailed subtopic breakdown</li>
                <li>• Key insights and takeaways</li>
              </ul>
              <p className="text-xs text-blue-600 mt-3">
                ✨ Powered by Google Gemini AI
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoAISummary;