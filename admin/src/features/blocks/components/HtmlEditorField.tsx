import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface HtmlEditorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  height?: number;
}

export function HtmlEditorField({
  label,
  value,
  onChange,
  height = 220,
}: HtmlEditorFieldProps) {
  const quillRef = React.useRef<any>(null);

  const handleLink = React.useCallback(() => {
    const url = prompt('Lien :');
    if (url === null) {
      return;
    }

    const editor = quillRef.current?.getEditor();
    if (!editor) {
      return;
    }

    const range = editor.getSelection();
    if (range && range.length > 0) {
      editor.formatText(range.index, range.length, 'link', url);
      return;
    }

    const text = prompt('Texte du lien :') || url;
    editor.insertText(range?.index || 0, text, { link: url });
  }, []);

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
    [handleLink]
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        style={{ height: `${height}px`, marginBottom: '50px' }}
      />
    </div>
  );
}
