import { blockCatalog } from '../blocks/blockCatalog';

export function HowTo() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Guide des blocs</h1>
 
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blockCatalog.map((entry) => (
          <div
            key={entry.type}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-4 bg-gray-50">
              <entry.Preview />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {entry.label}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {entry.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
