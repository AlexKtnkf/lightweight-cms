import type { Block } from '../../../domain/content/types';
import { HtmlEditorField } from './HtmlEditorField';

interface RichTextBlockProps {
  block: Block;
  onChange: (data: Record<string, any>) => void;
}

export function RichTextBlock({ block, onChange }: RichTextBlockProps) {
  const value = block.block_data?.richText || '';

  return (
    <HtmlEditorField
      label="Contenu"
      value={value}
      onChange={(content) => onChange({ richText: content })}
      height={300}
    />
  );
}
