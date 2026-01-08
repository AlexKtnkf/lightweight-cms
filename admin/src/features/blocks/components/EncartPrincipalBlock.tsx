import type { Block } from '../../../domains/content/types';

interface EncartPrincipalBlockProps {
  block: Block;
  onChange: (data: Record<string, any>) => void;
}

export function EncartPrincipalBlock({ block, onChange }: EncartPrincipalBlockProps) {
  const data = block.block_data || {};

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={data.titre || ''}
          onChange={(e) => onChange({ ...data, titre: e.target.value })}
          placeholder="Title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texte
        </label>
        <textarea
          value={data.texte || ''}
          onChange={(e) => onChange({ ...data, texte: e.target.value })}
          placeholder="Text content"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image Media ID
        </label>
        <input
          type="number"
          value={data.image_id || ''}
          onChange={(e) => onChange({ ...data, image_id: e.target.value ? parseInt(e.target.value) : null })}
          placeholder="Media ID"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lien (text)
        </label>
        <input
          type="text"
          value={data.lien || ''}
          onChange={(e) => onChange({ ...data, lien: e.target.value })}
          placeholder="Link text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL
        </label>
        <input
          type="text"
          value={data.url || ''}
          onChange={(e) => onChange({ ...data, url: e.target.value })}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );
}
