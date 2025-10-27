import { Appbar } from "../components/Appbar"
import WysiwygEditor from "../components/WysiwygEditor"
import AIWritingAssistant from "../components/AIWritingAssistant"
import TitleSuggestions from "../components/TitleSuggestions"
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const Publish = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublishing, setIsPublishing] = useState(false);
    const navigate = useNavigate();

    const handlePublish = async () => {
        if (!title.trim() || !description.trim()) {
            alert("Please fill in both title and content");
            return;
        }

        setIsPublishing(true);
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/blog`, {
                title,
                content: description
            }, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });
            navigate(`/blog/${response.data.id}`)
        } catch (error) {
            console.error("Error publishing blog:", error);
            alert("Failed to publish blog. Please try again.");
        } finally {
            setIsPublishing(false);
        }
    };

    // Handle text insertion from AI assistant
    const handleInsertText = (text: string) => {
        // Append the AI-generated text to the current content
        setDescription(prev => prev + ' ' + text);
    };

    return <div>
        <Appbar />
        <div className="flex justify-center w-full pt-8 px-4"> 
            <div className="max-w-4xl w-full">
                {/* AI Features Introduction */}
                <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">✨ AI-Powered Writing Assistant</h2>
                    <p className="text-gray-700 mb-3">
                        Get help with your blog writing using our AI assistant features:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center">
                            <span className="text-green-600 mr-2">📝</span>
                            <span>Grammar & Spelling Check</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-blue-600 mr-2">🤖</span>
                            <span>Auto Text Completion</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-purple-600 mr-2">💡</span>
                            <span>Title Suggestions</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-orange-600 mr-2">✨</span>
                            <span>Writing Improvement</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-red-600 mr-2">🔧</span>
                            <span>Auto-Correction</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-indigo-600 mr-2">🔄</span>
                            <span>Text Rephrasing</span>
                        </div>
                    </div>
                </div>
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Blog Title</label>
                        <TitleSuggestions 
                            content={description}
                            currentTitle={title}
                            onTitleSelect={setTitle}
                        />
                    </div>
                    <input 
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                        type="text" 
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-4" 
                        placeholder="Enter your blog title..." 
                    />
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Blog Content</label>
                        <AIWritingAssistant
                            content={description}
                            onContentChange={setDescription}
                            onInsertText={handleInsertText}
                        />
                    </div>
                    <WysiwygEditor
                        content={description}
                        onChange={setDescription}
                        placeholder="Start writing your blog post..."
                    />
                </div>

                <div className="flex justify-end">
                    <button 
                        onClick={handlePublish}
                        disabled={isPublishing || !title.trim() || !description.trim()}
                        className={`inline-flex items-center px-6 py-3 text-sm font-medium text-center text-white rounded-lg focus:ring-4 focus:ring-blue-200 ${
                            isPublishing || !title.trim() || !description.trim()
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-700 hover:bg-blue-800'
                        }`}
                    >
                        {isPublishing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Publishing...
                            </>
                        ) : (
                            'Publish post'
                        )}
                    </button>
                </div>
            </div>
        </div>
    </div>
}