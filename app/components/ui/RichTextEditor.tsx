import { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';

interface RichTextEditorProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  id?: string;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  label,
  error,
  helperText,
  required,
  value,
  defaultValue,
  onChange,
  name,
  id,
  placeholder,
  className = '',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const isControlled = value !== undefined;

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && defaultValue) {
      editorRef.current.innerHTML = defaultValue;
    }
  }, [defaultValue]);

  // Sync controlled value
  useEffect(() => {
    if (isControlled && editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value, isControlled]);

  const handleInput = () => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      if (isControlled && onChange) {
        onChange(htmlContent);
      } else {
        setInternalValue(htmlContent);
      }
    }
  };

  // Focus editor and get current selection
  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      return document.getSelection();
    }
    return null;
  };

  const applyFormatting = (tag: string, attributes?: Record<string, string>) => {
    const selection = focusEditor();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const selectedContent = range.extractContents();
    const element = document.createElement(tag);

    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }

    element.appendChild(selectedContent);
    range.insertNode(element);

    handleInput();
  };

  const formatHeading = (level: 'h1' | 'h2' | 'h3') => {
    applyFormatting(level);
  };

  const formatBold = () => {
    applyFormatting('b');
  };

  const formatItalic = () => {
    applyFormatting('i');
  };

  const formatUnderline = () => {
    applyFormatting('u');
  };

  const formatList = (ordered: boolean) => {
    const tag = ordered ? 'ol' : 'ul';
    const selection = focusEditor();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText) return;

    const list = document.createElement(tag);
    const listItem = document.createElement('li');
    listItem.textContent = selectedText;
    list.appendChild(listItem);
    range.deleteContents();
    range.insertNode(list);

    handleInput();
  };

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      applyFormatting('a', { href: url });
    }
  };

  const formatQuote = () => {
    applyFormatting('blockquote');
  };

  const formatCode = () => {
    applyFormatting('pre');
  };

  const ToolbarButton = ({
    onClick,
    icon: Icon,
    title
  }: {
    onClick: () => void;
    icon: any;
    title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-2 hover:bg-neutral-100 rounded transition-colors text-neutral-700 hover:text-neutral-900"
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const currentValue = isControlled ? value : internalValue;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`border rounded-lg overflow-hidden transition-shadow ${isFocused ? 'ring-2 ring-neutral-900 border-transparent' : 'border-neutral-300'
          } ${className}`}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 border-b border-neutral-200 bg-neutral-50">
          <ToolbarButton
            onClick={() => formatHeading('h1')}
            icon={Heading1}
            title="Heading 1"
          />
          <ToolbarButton
            onClick={() => formatHeading('h2')}
            icon={Heading2}
            title="Heading 2"
          />
          <ToolbarButton
            onClick={() => formatHeading('h3')}
            icon={Heading3}
            title="Heading 3"
          />

          <div className="w-px h-6 bg-neutral-300 mx-1" />

          <ToolbarButton
            onClick={formatBold}
            icon={Bold}
            title="Bold"
          />
          <ToolbarButton
            onClick={formatItalic}
            icon={Italic}
            title="Italic"
          />
          <ToolbarButton
            onClick={formatUnderline}
            icon={Underline}
            title="Underline"
          />

          <div className="w-px h-6 bg-neutral-300 mx-1" />

          <ToolbarButton
            onClick={() => formatList(false)}
            icon={List}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => formatList(true)}
            icon={ListOrdered}
            title="Numbered List"
          />

          <div className="w-px h-6 bg-neutral-300 mx-1" />

          <ToolbarButton
            onClick={addLink}
            icon={Link}
            title="Insert Link"
          />
          <ToolbarButton
            onClick={formatQuote}
            icon={Quote}
            title="Quote"
          />
          <ToolbarButton
            onClick={formatCode}
            icon={Code}
            title="Code Block"
          />
        </div>

        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full px-4 py-3 min-h-[200px] text-sm focus:outline-none prose prose-sm max-w-none"
          data-placeholder={placeholder}
          style={{
            whiteSpace: 'pre-wrap',
          }}
        />

        {name && (
          <input
            type="hidden"
            name={name}
            value={currentValue || ''}
          />
        )}
      </div>

      {helperText && <p className="text-xs text-neutral-500 mt-1">{helperText}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #a3a3a3;
          pointer-events: none;
        }
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] blockquote {
          border-left: 4px solid #d4d4d4;
          padding-left: 1em;
          margin: 1em 0;
          color: #525252;
        }
        [contenteditable] pre {
          background: #f5f5f5;
          padding: 1em;
          border-radius: 0.375rem;
          overflow-x: auto;
          font-family: monospace;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5em 0;
          padding-left: 2em;
        }
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}