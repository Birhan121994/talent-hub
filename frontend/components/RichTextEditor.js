'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/contexts/ThemeContext';
import 'react-quill/dist/quill.snow.css';

// Import ReactQuill with SSR disabled
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    return function Comp({ forwardedRef, ...props }) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded-t-lg"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-500 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-500 rounded w-3/4"></div>
        </div>
      </div>
    )
  }
);

const RichTextEditor = ({ value, onChange, placeholder, error }) => {
  const { isDarkMode } = useTheme();

  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ],
  }), []);

  // Quill formats configuration
  const formats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link'
  ], []);

  return (
    <div className="rich-text-editor">
      <ReactQuill
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        theme="snow"
        className="h-64"
      />
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
      <style jsx global>{`
        .rich-text-editor {
          margin-bottom: 1.5rem;
        }
        
        /* Light mode styles */
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          font-size: 0.875rem;
        }
        
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: #D1D5DB !important;
          background: white;
        }
        
        .rich-text-editor .ql-container {
          border-color: #D1D5DB !important;
          background: white;
        }
        
        .rich-text-editor .ql-toolbar.ql-snow {
          border-top: 1px solid #D1D5DB !important;
          border-left: 1px solid #D1D5DB !important;
          border-right: 1px solid #D1D5DB !important;
        }
        
        .rich-text-editor .ql-container.ql-snow {
          border-bottom: 1px solid #D1D5DB !important;
          border-left: 1px solid #D1D5DB !important;
          border-right: 1px solid #D1D5DB !important;
        }
        
        .rich-text-editor .ql-editor {
          min-height: 200px;
          color: #374151 !important; /* Gray-700 for text color */
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9CA3AF;
          font-style: normal;
        }
        
        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #4B5563;
        }
        
        .rich-text-editor .ql-toolbar .ql-fill {
          fill: #4B5563;
        }
        
        .rich-text-editor .ql-toolbar .ql-picker {
          color: #4B5563;
        }
        
        .rich-text-editor .ql-toolbar button:hover,
        .rich-text-editor .ql-toolbar button:focus,
        .rich-text-editor .ql-toolbar button.ql-active,
        .rich-text-editor .ql-toolbar .ql-picker-label:hover,
        .rich-text-editor .ql-toolbar .ql-picker-label.ql-active,
        .rich-text-editor .ql-toolbar .ql-picker-item:hover,
        .rich-text-editor .ql-toolbar .ql-picker-item.ql-selected {
          color: #1E40AF;
        }
        
        .rich-text-editor .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-toolbar button:focus .ql-stroke,
        .rich-text-editor .ql-toolbar button.ql-active .ql-stroke,
        .rich-text-editor .ql-toolbar .ql-picker-label:hover .ql-stroke,
        .rich-text-editor .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
        .rich-text-editor .ql-toolbar .ql-picker-item:hover .ql-stroke,
        .rich-text-editor .ql-toolbar .ql-picker-item.ql-selected .ql-stroke {
          stroke: #1E40AF;
        }
        
        .rich-text-editor .ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-toolbar button:focus .ql-fill,
        .rich-text-editor .ql-toolbar button.ql-active .ql-fill,
        .rich-text-editor .ql-toolbar .ql-picker-label:hover .ql-fill,
        .rich-text-editor .ql-toolbar .ql-picker-label.ql-active .ql-fill,
        .rich-text-editor .ql-toolbar .ql-picker-item:hover .ql-fill,
        .rich-text-editor .ql-toolbar .ql-picker-item.ql-selected .ql-fill {
          fill: #1E40AF;
        }

        /* Dark mode styles */
        .dark .rich-text-editor .ql-toolbar {
          border-color: #4B5563 !important;
          background: #374151;
        }
        
        .dark .rich-text-editor .ql-container {
          border-color: #4B5563 !important;
          background: #1F2937;
        }
        
        .dark .rich-text-editor .ql-toolbar.ql-snow {
          border-top: 1px solid #4B5563 !important;
          border-left: 1px solid #4B5563 !important;
          border-right: 1px solid #4B5563 !important;
        }
        
        .dark .rich-text-editor .ql-container.ql-snow {
          border-bottom: 1px solid #4B5563 !important;
          border-left: 1px solid #4B5563 !important;
          border-right: 1px solid #4B5563 !important;
        }
        
        .dark .rich-text-editor .ql-editor {
          color: #E5E7EB !important; /* Light gray for dark mode text */
        }
        
        .dark .rich-text-editor .ql-editor.ql-blank::before {
          color: #9CA3AF;
        }
        
        .dark .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #D1D5DB;
        }
        
        .dark .rich-text-editor .ql-toolbar .ql-fill {
          fill: #D1D5DB;
        }
        
        .dark .rich-text-editor .ql-toolbar .ql-picker {
          color: #D1D5DB;
        }
        
        .dark .rich-text-editor .ql-toolbar .ql-picker-label {
          color: #D1D5DB;
        }
        
        .dark .rich-text-editor .ql-toolbar .ql-picker-options {
          background: #374151;
          border: 1px solid #4B5563;
        }
        
        .dark .rich-text-editor .ql-toolbar .ql-picker-item {
          color: #D1D5DB;
        }
        
        .dark .rich-text-editor .ql-toolbar button:hover,
        .dark .rich-text-editor .ql-toolbar button:focus,
        .dark .rich-text-editor .ql-toolbar button.ql-active,
        .dark .rich-text-editor .ql-toolbar .ql-picker-label:hover,
        .dark .rich-text-editor .ql-toolbar .ql-picker-label.ql-active,
        .dark .rich-text-editor .ql-toolbar .ql-picker-item:hover,
        .dark .rich-text-editor .ql-toolbar .ql-picker-item.ql-selected {
          color: #60A5FA;
        }
        
        .dark .rich-text-editor .ql-toolbar button:hover .ql-stroke,
        .dark .rich-text-editor .ql-toolbar button:focus .ql-stroke,
        .dark .rich-text-editor .ql-toolbar button.ql-active .ql-stroke,
        .dark .rich-text-editor .ql-toolbar .ql-picker-label:hover .ql-stroke,
        .dark .rich-text-editor .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
        .dark .rich-text-editor .ql-toolbar .ql-picker-item:hover .ql-stroke,
        .dark .rich-text-editor .ql-toolbar .ql-picker-item.ql-selected .ql-stroke {
          stroke: #60A5FA;
        }
        
        .dark .rich-text-editor .ql-toolbar button:hover .ql-fill,
        .dark .rich-text-editor .ql-toolbar button:focus .ql-fill,
        .dark .rich-text-editor .ql-toolbar button.ql-active .ql-fill,
        .dark .rich-text-editor .ql-toolbar .ql-picker-label:hover .ql-fill,
        .dark .rich-text-editor .ql-toolbar .ql-picker-label.ql-active .ql-fill,
        .dark .rich-text-editor .ql-toolbar .ql-picker-item:hover .ql-fill,
        .dark .rich-text-editor .ql-toolbar .ql-picker-item.ql-selected .ql-fill {
          fill: #60A5FA;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;