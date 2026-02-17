import { useState } from 'react';
import { ImagePicker } from './ImagePicker';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaId: number | null) => void;
  selectedId?: number | null;
}

export function ImagePickerModal({ isOpen, onClose, onSelect, selectedId }: ImagePickerModalProps) {
  const [tempSelectedId, setTempSelectedId] = useState<number | null>(selectedId || null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelect(tempSelectedId);
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedId(selectedId || null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Sélectionner une image</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Fermer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <ImagePicker
              mode="select"
              onSelect={setTempSelectedId}
              selectedId={tempSelectedId}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {tempSelectedId ? 'Sélectionner' : 'Aucune image'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
