import type { Block } from '../../../domain/content/types';

interface LeadMagnetBlockProps {
  block: Block;
  onChange: (data: Record<string, any>) => void;
}

export function LeadMagnetBlock({ block, onChange }: LeadMagnetBlockProps) {
  const data = block.block_data || {};

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Icône
        </label>
        <input
          type="text"
          value={data.icon || ''}
          onChange={(e) => onChange({ ...data, icon: e.target.value })}
          placeholder="Nom ou classe de l'icône"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Titre"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texte du bouton
        </label>
        <input
          type="text"
          value={data.button_text || ''}
          onChange={(e) => onChange({ ...data, button_text: e.target.value })}
          placeholder="Texte du bouton"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL d'action
        </label>
        <input
          type="text"
          value={data.action_url || ''}
          onChange={(e) => onChange({ ...data, action_url: e.target.value })}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );
}
