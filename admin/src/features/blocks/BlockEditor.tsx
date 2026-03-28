import type { Block, BlockType } from '../../domain/content/types';
import { RichTextBlock } from './components/RichTextBlock';
import { HeroBlock } from './components/HeroBlock';
import { EncartPrincipalBlock } from './components/EncartPrincipalBlock';
import { AccrocheBlock } from './components/AccrocheBlock';
import { PinGridBlock } from './components/PinGridBlock';
import { NumberedCardsBlock } from './components/NumberedCardsBlock';
import { QuestionReponseBlock } from './components/QuestionReponseBlock';
import { LeadMagnetBlock } from './components/LeadMagnetBlock';
import { ContactFormBlock } from './components/ContactFormBlock';

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      block_type: type,
      block_data: getDefaultBlockData(type),
    };
    onChange([...blocks, newBlock]);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const updateBlock = (index: number, data: Partial<Block>) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], ...data };
    onChange(updated);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    
    const updated = [...blocks];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  const renderBlockEditor = (block: Block, index: number) => {
    const commonProps = {
      block,
      onChange: (data: Record<string, any>) => {
        updateBlock(index, { block_data: { ...block.block_data, ...data } });
      },
    };

    switch (block.block_type) {
      case 'rich_text':
        return <RichTextBlock {...commonProps} />;
      case 'hero':
        return <HeroBlock {...commonProps} />;
      case 'encart_principal':
        return <EncartPrincipalBlock {...commonProps} />;
      case 'accroche':
        return <AccrocheBlock {...commonProps} />;
      case 'pin_grid':
        return <PinGridBlock {...commonProps} />;
      case 'numbered_cards':
        return <NumberedCardsBlock {...commonProps} />;
      case 'question_reponse':
        return <QuestionReponseBlock {...commonProps} />;
      case 'lead_magnet':
        return <LeadMagnetBlock {...commonProps} />;
      case 'contact_form':
        return <ContactFormBlock {...commonProps} />;
      default:
        return <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          Type de bloc inconnu: {block.block_type}
        </div>;
    }
  };

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <div key={index} className="border border-gray-300 rounded-lg p-4 bg-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500">Bloc {index + 1}</span>
              <select
                value={block.block_type}
                onChange={(e) => {
                  const newType = e.target.value as BlockType;
                  updateBlock(index, {
                    block_type: newType,
                    block_data: getDefaultBlockData(newType),
                  });
                }}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="rich_text">Texte enrichi</option>
                <option value="hero">Hero</option>
                <option value="encart_principal">Encart principal</option>
                <option value="accroche">Accroche</option>
                <option value="question_reponse">FAQ</option>
                <option value="pin_grid">Pin Grid</option>
                <option value="numbered_cards">Cartes numérotées</option>
                <option value="contact_form">Formulaire de contact</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => moveBlock(index, 'up')}
                disabled={index === 0}
                className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, 'down')}
                disabled={index === blocks.length - 1}
                className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeBlock(index)}
                className="px-2 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
              >
                Supprimer
              </button>
            </div>
          </div>
          {renderBlockEditor(block, index)}
        </div>
      ))}
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => addBlock('rich_text')}
            className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
          >
            + Texte enrichi
          </button>
          <button
            type="button"
            onClick={() => addBlock('hero')}
            className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
          >
            + Hero
          </button>
          <button
            type="button"
            onClick={() => addBlock('encart_principal')}
            className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
          >
            + Encart Principal
          </button>
          <button
            type="button"
            onClick={() => addBlock('accroche')}
            className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
          >
            + Accroche
          </button>
          <button
            type="button"
            onClick={() => addBlock('pin_grid')}
            className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
          >
            + Pin Grid
          </button>
          <button
            type="button"
            onClick={() => addBlock('numbered_cards')}
            className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
          >
            + Cartes numérotées
          </button>
          <button
            type="button"
            onClick={() => addBlock('question_reponse')}
            className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
          >
            + FAQ
          </button>
          <button
            type="button"
            onClick={() => addBlock('contact_form')}
            className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
          >
            + Formulaire de contact
          </button>
        </div>
      </div>
    </div>
  );
}

function getDefaultBlockData(type: BlockType): Record<string, any> {
  switch (type) {
    case 'rich_text':
      return { richText: '' };
    case 'hero':
      return {
        tagline: '',
        textePrincipal: '',
        sousTexte: '',
        texteBoutonPrincipal: '',
        urlBoutonPrincipal: '',
        texteBoutonSecondaire: '',
        urlBoutonSecondaire: '',
      };
    case 'encart_principal':
      return {
        titre: '',
        texte: '',
        image_id: null,
        lien: '',
        url: '',
      };
    case 'accroche':
      return {
        title: '',
        content: '',
        section_id: '',
        image_media_id: null,
      };
    case 'pin_grid':
      return {
        section_title: '',
        pins: [],
      };
    case 'numbered_cards':
      return {
        section_title: '',
        background_color: 'dark',
        cards: [],
      };
    case 'question_reponse':
      return {
        section_title: '',
        intro: '',
        section_id: '',
        items: [
          {
            question: '',
            reponse: '',
          },
        ],
      };
    case 'lead_magnet':
      return {
        icon: '',
        title: '',
        description: '',
        button_text: '',
        action_url: '',
      };
    case 'contact_form':
      return {
        title: '',
        description: '',
        submit_button_text: 'Envoyer',
        fields: [],
      };
    default:
      return {};
  }
}
