import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useCallback } from 'react';
import { mediaApi } from '../api/media';
import type { Media } from '../../domain/media/types';
import { Loading } from './Loading';

interface ImagePickerProps {
  onSelect?: (mediaId: number | null) => void;
  selectedId?: number | null;
  mode?: 'browse' | 'select'; // 'browse' for standalone, 'select' for modal
}

export function ImagePicker({ onSelect, selectedId, mode = 'browse' }: ImagePickerProps) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const { data: media, isLoading } = useQuery<Media[]>({
    queryKey: ['media'],
    queryFn: () => mediaApi.list(),
  });

  // Filter to only show images
  const images = media?.filter(item => item.mime_type?.startsWith('image/')) || [];

  const deleteMutation = useMutation({
    mutationFn: (id: number) => mediaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      // If deleted image was selected, clear selection
      if (selectedId === deleteMutation.variables && onSelect) {
        onSelect(null);
      }
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.upload(file),
    onSuccess: (newMedia) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      // Auto-select newly uploaded image in select mode
      if (mode === 'select' && onSelect) {
        onSelect(newMedia.id);
      }
    },
  });

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image');
      return;
    }

    setUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } catch {
      alert('Upload échoué');
    } finally {
      setUploading(false);
    }
  }, [uploadMutation]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDelete = async (id: number, filename: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${filename}" ?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }
        `}
      >
        <div className="space-y-2">
          <p className="text-gray-600">
            {dragActive ? 'Déposez l\'image ici' : 'Glissez-déposez une image ici ou'}
          </p>
          <label className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer">
            {uploading ? 'Upload en cours...' : 'Parcourir les fichiers'}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInput}
              disabled={uploading}
              className="hidden"
              accept="image/*"
            />
          </label>
        </div>
      </div>

      {/* Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <div
                key={item.id}
                className={`
                  bg-white shadow rounded-lg overflow-hidden cursor-pointer transition-all
                  ${isSelected 
                    ? 'ring-2 ring-blue-500 ring-offset-2' 
                    : 'hover:shadow-lg'
                  }
                  ${mode === 'select' ? 'hover:ring-2 hover:ring-blue-300' : ''}
                `}
                onClick={() => mode === 'select' && onSelect && onSelect(item.id)}
              >
                <div className="relative">
                  <img
                    src={`/api/media/${item.id}`}
                    alt={item.alt_text || item.filename}
                    className="w-full h-32 object-cover"
                  />
                  {isSelected && mode === 'select' && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate" title={item.filename}>
                    {item.filename}
                  </p>
                  {mode === 'browse' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id, item.filename);
                      }}
                      className="mt-2 text-xs text-red-600 hover:text-red-800"
                      disabled={deleteMutation.isPending}
                    >
                      Supprimer
                    </button>
                  )}
                  {mode === 'select' && (
                    <p className="mt-1 text-xs text-gray-500">ID: {item.id}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">Aucune image. Téléversez-en une pour commencer.</p>
        </div>
      )}
    </div>
  );
}
