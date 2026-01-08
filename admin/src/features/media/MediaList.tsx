import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { mediaApi } from '../../shared/api/media';
import type { Media } from '../../domains/media/types';

export function MediaList() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: media, isLoading } = useQuery<Media[]>({
    queryKey: ['media'],
    queryFn: () => mediaApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => mediaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await mediaApi.upload(file);
      queryClient.invalidateQueries({ queryKey: ['media'] });
      e.target.value = ''; // Reset input
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number, filename: string) => {
    if (confirm(`Are you sure you want to delete "${filename}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Media</h1>
        <label className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer">
          {uploading ? 'Uploading...' : 'Upload File'}
          <input
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            accept="image/*"
          />
        </label>
      </div>

      {media && media.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((item) => (
            <div key={item.id} className="bg-white shadow rounded-lg overflow-hidden">
              {item.mime_type?.startsWith('image/') ? (
                <img
                  src={`/api/media/${item.id}`}
                  alt={item.alt_text || item.filename}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">File</span>
                </div>
              )}
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate" title={item.filename}>
                  {item.filename}
                </p>
                <button
                  onClick={() => handleDelete(item.id, item.filename)}
                  className="mt-2 text-xs text-red-600 hover:text-red-800"
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">No media files. Upload your first file!</p>
        </div>
      )}
    </div>
  );
}
