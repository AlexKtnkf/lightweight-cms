import type { Block } from '../../../domains/content/types';

interface PinGridBlockProps {
  block: Block;
  onChange: (data: Record<string, any>) => void;
}

export function PinGridBlock({ block, onChange }: PinGridBlockProps) {
  const data = block.block_data || {};
  const pins = data.pins || [];

  const addPin = () => {
    onChange({ ...data, pins: [...pins, { image_media_id: null, label: '' }] });
  };

  const removePin = (index: number) => {
    onChange({ ...data, pins: pins.filter((_: any, i: number) => i !== index) });
  };

  const updatePin = (index: number, pinData: any) => {
    const updated = [...pins];
    updated[index] = { ...updated[index], ...pinData };
    onChange({ ...data, pins: updated });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Section Title
        </label>
        <input
          type="text"
          value={data.section_title || ''}
          onChange={(e) => onChange({ ...data, section_title: e.target.value })}
          placeholder="e.g., Curated Vitality"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pins</label>
        {pins.map((pin: any, index: number) => (
          <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Pin {index + 1}</span>
              <button
                type="button"
                onClick={() => removePin(index)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Image Media ID</label>
                <input
                  type="number"
                  value={pin.image_media_id || ''}
                  onChange={(e) => updatePin(index, { image_media_id: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Media ID"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Label</label>
                <input
                  type="text"
                  value={pin.label || ''}
                  onChange={(e) => updatePin(index, { label: e.target.value })}
                  placeholder="e.g., Daily Balance Bowl"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addPin}
          className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
        >
          + Add Pin
        </button>
      </div>
    </div>
  );
}
