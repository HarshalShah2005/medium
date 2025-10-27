import React, { useCallback, useState, useRef, useEffect } from 'react';

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({ 
  content, 
  onChange, 
  placeholder = "Start writing your blog post..." 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState({ characters: 0, words: 0 });

  // Initialize content
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
      updateWordCount();
    }
  }, [content]);

  // Update word count
  const updateWordCount = useCallback(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      const characters = text.length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount({ characters, words });
    }
  }, []);

  // Handle content changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      updateWordCount();
    }
  }, [onChange, updateWordCount]);

  // Execute command
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  }, [handleInput]);

  // Formatting functions - using native browser commands for speed
  const toggleBold = useCallback(() => execCommand('bold'), [execCommand]);
  const toggleItalic = useCallback(() => execCommand('italic'), [execCommand]);
  const toggleUnderline = useCallback(() => execCommand('underline'), [execCommand]);
  const toggleStrike = useCallback(() => execCommand('strikeThrough'), [execCommand]);
  
  const setHeading = useCallback((level: number) => {
    execCommand('formatBlock', `h${level}`);
  }, [execCommand]);
  
  const setParagraph = useCallback(() => execCommand('formatBlock', 'p'), [execCommand]);
  const toggleBulletList = useCallback(() => execCommand('insertUnorderedList'), [execCommand]);
  const toggleOrderedList = useCallback(() => execCommand('insertOrderedList'), [execCommand]);
  
  const setTextColor = useCallback((color: string) => {
    execCommand('foreColor', color);
  }, [execCommand]);

  const insertLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const insertCodeBlock = useCallback(() => {
    const code = window.prompt('Enter code:');
    if (code && editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const pre = document.createElement('pre');
        const codeEl = document.createElement('code');
        codeEl.textContent = code;
        codeEl.style.backgroundColor = '#f3f4f6';
        codeEl.style.padding = '1rem';
        codeEl.style.borderRadius = '0.5rem';
        codeEl.style.display = 'block';
        codeEl.style.fontFamily = 'monospace';
        pre.appendChild(codeEl);
        range.deleteContents();
        range.insertNode(pre);
        selection.removeAllRanges();
        handleInput();
      }
    }
  }, [handleInput]);

  // Check if command is active
  const isActive = useCallback((command: string, value?: string) => {
    try {
      if (value) {
        return document.queryCommandValue(command) === value;
      }
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  }, []);

  const buttonClass = "px-3 py-1.5 rounded text-sm font-medium transition-colors border";
  const activeClass = "bg-blue-600 text-white border-blue-600";
  const inactiveClass = "bg-white border-gray-300 text-gray-700 hover:bg-gray-100";

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-3">
        <div className="flex flex-wrap gap-2">
          {/* Text Formatting */}
          <div className="flex gap-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggleBold}
              className={`${buttonClass} ${isActive('bold') ? activeClass : inactiveClass}`}
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggleItalic}
              className={`${buttonClass} ${isActive('italic') ? activeClass : inactiveClass}`}
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </button>
            
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggleUnderline}
              className={`${buttonClass} ${isActive('underline') ? activeClass : inactiveClass}`}
              title="Underline (Ctrl+U)"
            >
              <u>U</u>
            </button>
            
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggleStrike}
              className={`${buttonClass} ${isActive('strikeThrough') ? activeClass : inactiveClass}`}
              title="Strikethrough"
            >
              <s>S</s>
            </button>
          </div>

          {/* Separator */}
          <div className="w-px h-8 bg-gray-300"></div>

          {/* Headings */}
          <div className="flex gap-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setHeading(1)}
              className={`${buttonClass} ${isActive('formatBlock', 'h1') ? activeClass : inactiveClass}`}
              title="Large Heading"
            >
              H1
            </button>
            
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setHeading(2)}
              className={`${buttonClass} ${isActive('formatBlock', 'h2') ? activeClass : inactiveClass}`}
              title="Medium Heading"
            >
              H2
            </button>
            
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setHeading(3)}
              className={`${buttonClass} ${isActive('formatBlock', 'h3') ? activeClass : inactiveClass}`}
              title="Small Heading"
            >
              H3
            </button>
            
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={setParagraph}
              className={`${buttonClass} ${isActive('formatBlock', 'p') ? activeClass : inactiveClass}`}
              title="Normal Text"
            >
              P
            </button>
          </div>

          {/* Separator */}
          <div className="w-px h-8 bg-gray-300"></div>

          {/* Lists */}
          <div className="flex gap-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggleBulletList}
              className={`${buttonClass} ${isActive('insertUnorderedList') ? activeClass : inactiveClass}`}
              title="Bullet Points"
            >
              • List
            </button>
            
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggleOrderedList}
              className={`${buttonClass} ${isActive('insertOrderedList') ? activeClass : inactiveClass}`}
              title="Numbered List"
            >
              1. List
            </button>
          </div>

          {/* Separator */}
          <div className="w-px h-8 bg-gray-300"></div>

          {/* Links & Code */}
          <div className="flex gap-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={insertLink}
              className={`${buttonClass} ${inactiveClass}`}
              title="Add Link"
            >
              🔗 Link
            </button>
            
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={insertCodeBlock}
              className={`${buttonClass} ${inactiveClass}`}
              title="Code Block"
            >
              &lt;/&gt; Code
            </button>
          </div>

          {/* Separator */}
          <div className="w-px h-8 bg-gray-300"></div>

          {/* Text Colors */}
          <div className="flex gap-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setTextColor('#000000')}
              className="w-8 h-8 rounded border border-gray-300 bg-black hover:ring-2 hover:ring-blue-500"
              title="Black Text"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setTextColor('#dc2626')}
              className="w-8 h-8 rounded border border-gray-300 bg-red-600 hover:ring-2 hover:ring-blue-500"
              title="Red Text"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setTextColor('#2563eb')}
              className="w-8 h-8 rounded border border-gray-300 bg-blue-600 hover:ring-2 hover:ring-blue-500"
              title="Blue Text"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setTextColor('#16a34a')}
              className="w-8 h-8 rounded border border-gray-300 bg-green-600 hover:ring-2 hover:ring-blue-500"
              title="Green Text"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setTextColor('#ca8a04')}
              className="w-8 h-8 rounded border border-gray-300 bg-yellow-600 hover:ring-2 hover:ring-blue-500"
              title="Yellow Text"
            />
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[400px] p-6 focus:outline-none overflow-y-auto wysiwyg-editor"
        style={{
          lineHeight: '1.6',
        }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      {/* Word Count */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 text-sm text-gray-600">
        {wordCount.characters} characters, {wordCount.words} words
      </div>
    </div>
  );
};

export default WysiwygEditor;