import { useState } from 'react';
import type { Block } from '../../../domain/content/types';
import { ImagePickerModal } from '../../../shared/components/ImagePickerModal';
import { HtmlEditorField } from './HtmlEditorField';

interface AccrocheBlockProps {
  block: Block;
  onChange: (data: Record<string, unknown>) => void;
}

export function AccrocheBlock({ block, onChange }: AccrocheBlockProps) {
  const data = block.block_data || {};
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const selectedImage = data.image_media_id ? `/api/media/${data.image_media_id}` : null;

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
          placeholder="Titre de l'accroche"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <HtmlEditorField
        label="Contenu"
        value={data.content || ''}
        onChange={(content) => onChange({ ...data, content })}
        height={200}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID de section
        </label>
        <input
          type="text"
          value={data.section_id || ''}
          onChange={(e) => onChange({ ...data, section_id: e.target.value })}
          placeholder="facultatif, ex. : faq"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image
        </label>
        <div className="space-y-2">
          {selectedImage && (
            <div className="relative w-full h-32 border border-gray-300 rounded-md overflow-hidden">
              <img
                src={selectedImage}
                alt="Image sélectionnée"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange({ ...data, image_media_id: null })}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                aria-label="Supprimer l'image"
              >
                ×
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsImagePickerOpen(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm"
          >
            {selectedImage ? 'Changer l\'image' : 'Sélectionner une image'}
          </button>
        </div>
        {data.image_media_id && (
          <p className="mt-1 text-xs text-gray-500">ID: {data.image_media_id}</p>
        )}
      </div>

      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelect={(mediaId) => onChange({ ...data, image_media_id: mediaId })}
        selectedId={data.image_media_id || null}
      />
    </div>
  );
}
