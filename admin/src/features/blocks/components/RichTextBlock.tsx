import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import type { Block } from '../../../domain/content/types';

interface RichTextBlockProps {
  block: Block;
  onChange: (data: Record<string, any>) => void;
}

export function RichTextBlock({ block, onChange }: RichTextBlockProps) {
  const value = block.block_data?.richText || '';

  const handleLink = () => {
    const url = prompt('Lien :');
    if (url !== null) {
      const editor = quillRef.current?.getEditor();
      if (editor) {
        const range = editor.getSelection();
        if (range && range.length > 0) {
          editor.formatText(range.index, range.length, 'link', url);
        } else {
          const text = prompt('Texte du lien :') || url;
          editor.insertText(range?.index || 0, text, { link: url });
        }
      }
    }
  };

  const quillRef = React.useRef<any>(null);

  const modules = React.useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          ['link'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['clean'],
        ],
        handlers: {
          link: handleLink,
        },
      },
    }),
    []
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Contenu
      </label>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={(content) => onChange({ richText: content })}
        modules={modules}
        style={{ height: '300px', marginBottom: '50px' }}
      />
    </div>
  );
}
