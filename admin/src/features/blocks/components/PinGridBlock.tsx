import { useState } from 'react';
import type { Block } from '../../../domain/content/types';
import { ImagePickerModal } from '../../../shared/components/ImagePickerModal';

interface Pin {
  image_media_id: number | null;
  label: string;
}

interface PinGridBlockProps {
  block: Block;
  onChange: (data: Record<string, unknown>) => void;
}

export function PinGridBlock({ block, onChange }: PinGridBlockProps) {
  const data = block.block_data || {};
  const pins = data.pins || [];
  const [openPickerForIndex, setOpenPickerForIndex] = useState<number | null>(null);

  const addPin = () => {
    onChange({ ...data, pins: [...pins, { image_media_id: null, label: '' }] });
  };

  const removePin = (index: number) => {
    onChange({ ...data, pins: pins.filter((_: Pin, i: number) => i !== index) });
  };

  const updatePin = (index: number, pinData: Partial<Pin>) => {
    const updated = [...pins];
    updated[index] = { ...updated[index], ...pinData };
    onChange({ ...data, pins: updated });
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
          placeholder="ex. : Vitalité Débordante Grâce à Cette Cure Miracle"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pins</label>
        {pins.map((pin: Pin, index: number) => (
          <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Pin {index + 1}</span>
              <button
                type="button"
                onClick={() => removePin(index)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Supprimer
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Image</label>
                {pin.image_media_id ? (
                  <div className="space-y-1">
                    <div className="relative w-full h-20 border border-gray-300 rounded overflow-hidden">
                      <img
                        src={`/api/media/${pin.image_media_id}`}
                        alt="Image du pin"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => updatePin(index, { image_media_id: null })}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                        aria-label="Supprimer l'image"
                      >
                        ×
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenPickerForIndex(index)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50"
                    >
                      Changer l'image
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenPickerForIndex(index)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50"
                  >
                    Sélectionner une image
                  </button>
                )}
                {pin.image_media_id && (
                  <p className="mt-1 text-xs text-gray-400">ID: {pin.image_media_id}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Libellé</label>
                <input
                  type="text"
                  value={pin.label || ''}
                  onChange={(e) => updatePin(index, { label: e.target.value })}
                  placeholder="ex. : Bol d'Équilibre Du Matin Chagrin"
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
          + Ajouter un pin
        </button>
      </div>

      {/* Image Picker Modal for the currently selected pin */}
      {openPickerForIndex !== null && (
        <ImagePickerModal
          isOpen={true}
          onClose={() => setOpenPickerForIndex(null)}
          onSelect={(mediaId) => {
            updatePin(openPickerForIndex, { image_media_id: mediaId });
            setOpenPickerForIndex(null);
          }}
          selectedId={pins[openPickerForIndex]?.image_media_id || null}
        />
      )}
    </div>
  );
}
