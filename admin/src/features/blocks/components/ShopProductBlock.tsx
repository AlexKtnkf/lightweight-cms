import type { Block } from '../../../domain/content/types';

interface ShopProductBlockProps {
  block: Block;
  onChange: (data: Record<string, any>) => void;
}

export function ShopProductBlock({ block, onChange }: ShopProductBlockProps) {
  const data = block.block_data || {};

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Produit coup de coeur"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          rows={3}
          placeholder="Description courte du produit..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix (ex: 29,90 EUR)</label>
          <input
            type="text"
            value={data.price_label || ''}
            onChange={(e) => onChange({ price_label: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="29,90 EUR"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optionnel)</label>
          <input
            type="url"
            value={data.image_url || ''}
            onChange={(e) => onChange({ image_url: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Texte bouton</label>
          <input
            type="text"
            value={data.cta_text || ''}
            onChange={(e) => onChange({ cta_text: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="Voir le produit"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL bouton</label>
          <input
            type="text"
            value={data.cta_url || ''}
            onChange={(e) => onChange({ cta_url: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="/boutique"
          />
        </div>
      </div>
    </div>
  );
}
