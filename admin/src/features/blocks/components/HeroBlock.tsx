import type { Block } from '../../../domains/content/types';

interface HeroBlockProps {
  block: Block;
  onChange: (data: Record<string, any>) => void;
}

export function HeroBlock({ block, onChange }: HeroBlockProps) {
  const data = block.block_data || {};

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tagline
        </label>
        <input
          type="text"
          value={data.tagline || ''}
          onChange={(e) => onChange({ ...data, tagline: e.target.value })}
          placeholder="e.g., Optimization & Longevity"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={data.textePrincipal || ''}
          onChange={(e) => onChange({ ...data, textePrincipal: e.target.value })}
          placeholder="Main heading"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={data.sousTexte || ''}
          onChange={(e) => onChange({ ...data, sousTexte: e.target.value })}
          placeholder="Subtitle or description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Primary Button Text
        </label>
        <input
          type="text"
          value={data.texteBoutonPrincipal || ''}
          onChange={(e) => onChange({ ...data, texteBoutonPrincipal: e.target.value })}
          placeholder="e.g., Start Your Program"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Primary Button URL
        </label>
        <input
          type="text"
          value={data.urlBoutonPrincipal || ''}
          onChange={(e) => onChange({ ...data, urlBoutonPrincipal: e.target.value })}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Secondary Button Text
        </label>
        <input
          type="text"
          value={data.texteBoutonSecondaire || ''}
          onChange={(e) => onChange({ ...data, texteBoutonSecondaire: e.target.value })}
          placeholder="e.g., View The Menu"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Secondary Button URL
        </label>
        <input
          type="text"
          value={data.urlBoutonSecondaire || ''}
          onChange={(e) => onChange({ ...data, urlBoutonSecondaire: e.target.value })}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );
}
