import { useState } from 'react';
import { BACKEND_URL } from '../config';

interface SaveButtonProps {
  blogId: number;
  initialSaved?: boolean;
  onSaveChange?: (saved: boolean) => void;
}

export function SaveButton({ blogId, initialSaved = false, onSaveChange }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const toggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking save button on cards
    e.preventDefault();
    
    setLoading(true);
    try {
      const method = saved ? 'DELETE' : 'POST';
      const response = await fetch(`${BACKEND_URL}/api/v1/blog/${blogId}/save`, {
        method,
        headers: {
          'Authorization': localStorage.getItem('token') || '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const newSavedState = !saved;
        setSaved(newSavedState);
        onSaveChange?.(newSavedState);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleSave}
      disabled={loading}
      className={`p-2 rounded-full transition-colors ${
        saved 
          ? 'text-blue-600 hover:bg-blue-50' 
          : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={saved ? 'Remove from saved' : 'Save post'}
    >
      <svg
        className="w-5 h-5"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
}