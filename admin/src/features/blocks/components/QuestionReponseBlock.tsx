import type { Block } from '../../../domains/content/types';

interface QuestionReponseBlockProps {
  block: Block;
  onChange: (data: Record<string, any>) => void;
}

export function QuestionReponseBlock({ block, onChange }: QuestionReponseBlockProps) {
  const data = block.block_data || {};

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question
        </label>
        <input
          type="text"
          value={data.question || ''}
          onChange={(e) => onChange({ ...data, question: e.target.value })}
          placeholder="Question text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Réponse
        </label>
        <textarea
          value={data.reponse || ''}
          onChange={(e) => onChange({ ...data, reponse: e.target.value })}
          placeholder="Answer text"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );
}
