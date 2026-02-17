import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import type { Block } from '../../../domain/content/types';

interface RichTextBlockProps {
  block: Block;
  onChange: (data: Record<string, any>) => void;
}

export function RichTextBlock({ block, onChange }: RichTextBlockProps) {
  const value = block.block_data?.richText || '';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Contenu
      </label>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={(content) => onChange({ richText: content })}
        style={{ height: '300px', marginBottom: '50px' }}
      />
    </div>
  );
}
