import type { Block } from '../../../domain/content/types';

interface ContactFormBlockProps {
  block: Block;
  onChange: (data: Record<string, any>) => void;
}

export function ContactFormBlock({ block, onChange }: ContactFormBlockProps) {
  const data = block.block_data || {};
  const fields = data.fields || [];

  const addField = () => {
    onChange({
      ...data,
      fields: [...fields, { label: '', type: 'text', required: false, placeholder: '', options: [] }],
    });
  };

  const removeField = (index: number) => {
    onChange({ ...data, fields: fields.filter((_: any, i: number) => i !== index) });
  };

  const updateField = (index: number, fieldData: any) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...fieldData };
    onChange({ ...data, fields: updated });
  };

  const serializeOptions = (options: Array<{ label?: string; value?: string } | string>) =>
    (options || [])
      .map((option) => {
        if (typeof option === 'string') {
          return option;
        }
        const label = option.label || option.value || '';
        const value = option.value || option.label || '';
        return value && value !== label ? `${label}=${value}` : label;
      })
      .filter(Boolean)
      .join('\n');

  const parseOptions = (value: string) =>
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf('=');
        if (separatorIndex === -1) {
          return { label: line, value: line };
        }
        const label = line.slice(0, separatorIndex).trim();
        const optionValue = line.slice(separatorIndex + 1).trim();
        return {
          label: label || optionValue,
          value: optionValue || label,
        };
      });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Titre du formulaire"
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
          placeholder="Description du formulaire"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texte du bouton d'envoi
        </label>
        <input
          type="text"
          value={data.submit_button_text || 'Envoyer'}
          onChange={(e) => onChange({ ...data, submit_button_text: e.target.value })}
          placeholder="Envoyer"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Champs</label>
        {fields.map((field: any, index: number) => (
          <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Champ {index + 1}</span>
              <button
                type="button"
                onClick={() => removeField(index)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Supprimer
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Libellé</label>
                <input
                  type="text"
                  value={field.label || ''}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                  placeholder="Libellé du champ"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Type</label>
                <select
                  value={field.type || 'text'}
                  onChange={(e) => updateField(index, {
                    type: e.target.value,
                    options: e.target.value === 'select' ? (field.options || []) : [],
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="text">Texte</option>
                  <option value="email">Email</option>
                  <option value="tel">Téléphone</option>
                  <option value="textarea">Zone de texte</option>
                  <option value="select">Liste déroulante</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Texte indicatif</label>
                <input
                  type="text"
                  value={field.placeholder || ''}
                  onChange={(e) => updateField(index, { placeholder: e.target.value })}
                  placeholder="Texte indicatif"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              {field.type === 'select' && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Options</label>
                  <textarea
                    value={serializeOptions(field.options || [])}
                    onChange={(e) => updateField(index, { options: parseOptions(e.target.value) })}
                    placeholder={`Option 1\nOption 2=valeur-2`}
                    rows={4}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Une ligne par option. Format facultatif : `Label=valeur`.
                  </p>
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={field.required || false}
                  onChange={(e) => updateField(index, { required: e.target.checked })}
                  className="h-4 w-4 text-blue-600"
                />
                <label className="ml-2 text-xs text-gray-600">Requis</label>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addField}
          className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
        >
          + Ajouter un champ
        </button>
      </div>
    </div>
  );
}
