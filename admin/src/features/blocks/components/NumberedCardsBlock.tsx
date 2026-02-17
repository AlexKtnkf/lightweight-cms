import type { Block } from '../../../domain/content/types';

interface NumberedCardsBlockProps {
  block: Block;
  onChange: (data: Record<string, any>) => void;
}

export function NumberedCardsBlock({ block, onChange }: NumberedCardsBlockProps) {
  const data = block.block_data || {};
  const cards = data.cards || [];

  const addCard = () => {
    onChange({ ...data, cards: [...cards, { number: '', title: '', description: '' }] });
  };

  const removeCard = (index: number) => {
    onChange({ ...data, cards: cards.filter((_: any, i: number) => i !== index) });
  };

  const updateCard = (index: number, cardData: any) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], ...cardData };
    onChange({ ...data, cards: updated });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titre de la section
        </label>
        <input
          type="text"
          value={data.section_title || ''}
          onChange={(e) => onChange({ ...data, section_title: e.target.value })}
          placeholder="ex. : Les Quatre Commandements"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Couleur de fond
        </label>
        <select
          value={data.background_color || 'dark'}
          onChange={(e) => onChange({ ...data, background_color: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="dark">Sombre</option>
          <option value="light">Clair</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cartes</label>
        {cards.map((card: any, index: number) => (
          <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Carte {index + 1}</span>
              <button
                type="button"
                onClick={() => removeCard(index)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Supprimer
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Numéro</label>
                <input
                  type="text"
                  value={card.number || ''}
                  onChange={(e) => updateCard(index, { number: e.target.value })}
                  placeholder="ex. : 01"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Titre</label>
                <input
                  type="text"
                  value={card.title || ''}
                  onChange={(e) => updateCard(index, { title: e.target.value })}
                  placeholder="ex. : Hydratation Matinale"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Description</label>
                <textarea
                  value={card.description || ''}
                  onChange={(e) => updateCard(index, { description: e.target.value })}
                  placeholder="Texte de description"
                  rows={2}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addCard}
          className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
        >
          + Ajouter une carte
        </button>
      </div>
    </div>
  );
}
