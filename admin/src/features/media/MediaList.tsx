import { ImagePicker } from '../../shared/components/ImagePicker';

export function ImagesList() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Images</h1>
      </div>
      <ImagePicker mode="browse" />
    </div>
  );
}

// Keep MediaList as alias for backward compatibility during transition
export const MediaList = ImagesList;
