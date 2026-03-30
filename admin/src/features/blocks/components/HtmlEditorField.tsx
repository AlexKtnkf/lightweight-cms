import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { ImagePickerModal } from '../../../shared/components/ImagePickerModal';

interface HtmlEditorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  height?: number;
  enableImages?: boolean;
}

export function HtmlEditorField({
  label,
  value,
  onChange,
  height = 220,
  enableImages = false,
}: HtmlEditorFieldProps) {
  const quillRef = React.useRef<any>(null);
  const [isImagePickerOpen, setIsImagePickerOpen] = React.useState(false);

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

  const handleImage = React.useCallback(() => {
    setIsImagePickerOpen(true);
  }, []);

  const insertSelectedImage = React.useCallback((mediaId: number | null) => {
    if (!mediaId) {
      return;
    }

    const editor = quillRef.current?.getEditor();
    if (!editor) {
      return;
    }

    const range = editor.getSelection(true);
    const insertIndex = range?.index ?? editor.getLength();
    const imageUrl = `/api/media/${mediaId}`;

    // Keep images as standalone block elements between paragraphs.
    editor.insertText(insertIndex, '\n', 'user');
    editor.insertEmbed(insertIndex + 1, 'image', imageUrl, 'user');
    editor.insertText(insertIndex + 2, '\n', 'user');
    editor.setSelection(insertIndex + 3, 0, 'user');
  }, []);

  const toolbarContainer = React.useMemo(() => {
    const baseToolbar = [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      ['link'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ];

    if (enableImages) {
      baseToolbar[2] = ['link', 'image'];
    }

    return baseToolbar;
  }, [enableImages]);

  const modules = React.useMemo(
    () => ({
      toolbar: {
        container: toolbarContainer,
        handlers: {
          link: handleLink,
          ...(enableImages ? { image: handleImage } : {}),
        },
      },
    }),
    [enableImages, handleImage, handleLink, toolbarContainer]
  );

  return (
    <>
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

      {enableImages && (
        <ImagePickerModal
          isOpen={isImagePickerOpen}
          onClose={() => setIsImagePickerOpen(false)}
          onSelect={insertSelectedImage}
          selectedId={null}
        />
      )}
    </>
  );
}
