import type { Block } from '../../../domain/content/types';

interface HeroBlockProps {
  block: Block;
  onChange: (data: Record<string, any>) => void;
}

export function HeroBlock({ block, onChange }: HeroBlockProps) {
  const data = block.block_data || {};
  const title = data.textePrincipal || data.title || '';
  const description = data.sousTexte || data.description || '';
  const primaryButtonText = data.texteBoutonPrincipal || data.button_primary_text || '';
  const primaryButtonUrl = data.urlBoutonPrincipal || data.button_primary_url || '';
  const secondaryButtonText = data.texteBoutonSecondaire || data.button_secondary_text || '';
  const secondaryButtonUrl = data.urlBoutonSecondaire || data.button_secondary_url || '';

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slogan
        </label>
        <input
          type="text"
          value={data.tagline || ''}
          onChange={(e) => onChange({ ...data, tagline: e.target.value })}
          placeholder="Pierre Qui Roule N'Amasse Pas Mousse"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onChange({ ...data, textePrincipal: e.target.value })}
          placeholder="Titre principal"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => onChange({ ...data, sousTexte: e.target.value })}
          placeholder="Sous-titre ou description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texte du bouton principal
        </label>
        <input
          type="text"
          value={primaryButtonText}
          onChange={(e) => onChange({ ...data, texteBoutonPrincipal: e.target.value })}
          placeholder="ex. : Payez Moi"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL du bouton principal
        </label>
        <input
          type="text"
          value={primaryButtonUrl}
          onChange={(e) => onChange({ ...data, urlBoutonPrincipal: e.target.value })}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texte du bouton secondaire
        </label>
        <input
          type="text"
          value={secondaryButtonText}
          onChange={(e) => onChange({ ...data, texteBoutonSecondaire: e.target.value })}
          placeholder="ex. : Voir Le Programme"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL du bouton secondaire
        </label>
        <input
          type="text"
          value={secondaryButtonUrl}
          onChange={(e) => onChange({ ...data, urlBoutonSecondaire: e.target.value })}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );
}
