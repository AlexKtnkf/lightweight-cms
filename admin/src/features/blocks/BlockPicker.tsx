import { useState } from 'react';
import type { BlockType } from '../../domain/content/types';
import { blockCatalog } from './blockCatalog';
import { useFeatureFlags } from '../flags/FeatureFlagsContext';

interface BlockPickerProps {
  onSelect: (type: BlockType) => void;
  isSuperAdmin?: boolean;
}

export function BlockPicker({ onSelect, isSuperAdmin = false }: BlockPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isEnabled } = useFeatureFlags();

  const availableBlocks = blockCatalog.filter(
    (entry) => isSuperAdmin || isEnabled(entry.featureFlag)
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-3 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-dashed border-blue-200 transition-colors"
      >
        + Ajouter un bloc
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Choisir un bloc</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                aria-label="Fermer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableBlocks.map((entry) => (
                  <button
                    key={entry.type}
                    type="button"
                    onClick={() => {
                      onSelect(entry.type);
                      setIsOpen(false);
                    }}
                    className="text-left bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:border-blue-400 hover:shadow-md transition-all group"
                  >
                    <div className="p-3 bg-gray-50 group-hover:bg-blue-50 transition-colors">
                      <entry.Preview />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {entry.label}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                        {entry.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
