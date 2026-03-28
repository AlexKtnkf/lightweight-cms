import type { Block } from '../../../domain/content/types';

interface FaqItem {
  question: string;
  reponse: string;
}

interface QuestionReponseBlockProps {
  block: Block;
  onChange: (data: Record<string, any>) => void;
}

export function QuestionReponseBlock({ block, onChange }: QuestionReponseBlockProps) {
  const data = block.block_data || {};
  const items: FaqItem[] = Array.isArray(data.items)
    ? data.items
    : (data.question || data.reponse)
      ? [{ question: data.question || '', reponse: data.reponse || '' }]
      : [];

  const updateItems = (nextItems: FaqItem[]) => {
    onChange({
      section_title: data.section_title || '',
      intro: data.intro || '',
      section_id: data.section_id || '',
      items: nextItems,
    });
  };

  const updateItem = (index: number, itemData: Partial<FaqItem>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...itemData };
    updateItems(updated);
  };

  const addItem = () => {
    updateItems([...items, { question: '', reponse: '' }]);
  };

  const removeItem = (index: number) => {
    updateItems(items.filter((_, itemIndex) => itemIndex !== index));
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
          onChange={(e) => onChange({ ...data, section_title: e.target.value, items })}
          placeholder="ex. : Questions frequentes"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Introduction
        </label>
        <textarea
          value={data.intro || ''}
          onChange={(e) => onChange({ ...data, intro: e.target.value, items })}
          placeholder="Petit texte d'introduction facultatif"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID de section
        </label>
        <input
          type="text"
          value={data.section_id || ''}
          onChange={(e) => onChange({ ...data, section_id: e.target.value, items })}
          placeholder="facultatif, ex. : faq"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Questions / reponses
        </label>
        {items.map((item, index) => (
          <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Question {index + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Supprimer
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Question</label>
                <input
                  type="text"
                  value={item.question || ''}
                  onChange={(e) => updateItem(index, { question: e.target.value })}
                  placeholder="Texte de la question"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Réponse</label>
                <textarea
                  value={item.reponse || ''}
                  onChange={(e) => updateItem(index, { reponse: e.target.value })}
                  placeholder="Texte de la réponse"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
        >
          + Ajouter une question
        </button>
      </div>
    </div>
  );
}
