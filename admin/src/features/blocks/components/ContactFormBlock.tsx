import type { Block } from '../../../domains/content/types';

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
      fields: [...fields, { label: '', type: 'text', required: false, placeholder: '' }],
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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Form title"
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
          placeholder="Form description"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Submit Button Text
        </label>
        <input
          type="text"
          value={data.submit_button_text || 'Submit'}
          onChange={(e) => onChange({ ...data, submit_button_text: e.target.value })}
          placeholder="Submit"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fields</label>
        {fields.map((field: any, index: number) => (
          <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Field {index + 1}</span>
              <button
                type="button"
                onClick={() => removeField(index)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Label</label>
                <input
                  type="text"
                  value={field.label || ''}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                  placeholder="Field label"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Type</label>
                <select
                  value={field.type || 'text'}
                  onChange={(e) => updateField(index, { type: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="tel">Phone</option>
                  <option value="textarea">Textarea</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Placeholder</label>
                <input
                  type="text"
                  value={field.placeholder || ''}
                  onChange={(e) => updateField(index, { placeholder: e.target.value })}
                  placeholder="Placeholder text"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={field.required || false}
                  onChange={(e) => updateField(index, { required: e.target.checked })}
                  className="h-4 w-4 text-blue-600"
                />
                <label className="ml-2 text-xs text-gray-600">Required</label>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addField}
          className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
        >
          + Add Field
        </button>
      </div>
    </div>
  );
}
