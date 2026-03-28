const sanitize = require('./sanitize');

function sanitizeFaqItems(blockData) {
  if (Array.isArray(blockData.items) && blockData.items.length > 0) {
    return blockData.items.map(item => ({
      question: item.question || '',
      reponse: sanitize(item.reponse || '')
    }));
  }

  if (blockData.question || blockData.reponse) {
    return [{
      question: blockData.question || '',
      reponse: sanitize(blockData.reponse || '')
    }];
  }

  return [];
}

/**
 * Sanitize block data based on block type
 */
function sanitizeBlockData(blockType, blockData) {
  switch (blockType) {
    case 'rich_text':
      return {
        richText: sanitize(blockData.richText || '')
      };
    
    case 'encart_principal':
      return {
        titre: blockData.titre || '',
        texte: sanitize(blockData.texte || ''),
        image_id: blockData.image_id || null,
        lien: blockData.lien || '',
        url: blockData.url || ''
      };
    
    case 'hero':
      return {
        textePrincipal: blockData.textePrincipal || '',
        sousTexte: blockData.sousTexte || '',
        texteBoutonPrincipal: blockData.texteBoutonPrincipal || '',
        urlBoutonPrincipal: blockData.urlBoutonPrincipal || '',
        texteBoutonSecondaire: blockData.texteBoutonSecondaire || '',
        urlBoutonSecondaire: blockData.urlBoutonSecondaire || ''
      };
    
    case 'question_reponse':
      return {
        section_title: blockData.section_title || '',
        intro: sanitize(blockData.intro || ''),
        section_id: blockData.section_id || '',
        items: sanitizeFaqItems(blockData)
      };
    
    case 'accroche':
      return {
        title: blockData.title || '',
        content: sanitize(blockData.content || ''),
        image_media_id: blockData.image_media_id || null,
        section_id: blockData.section_id || ''
      };
    
    case 'pin_grid':
      return {
        section_title: blockData.section_title || '',
        pins: Array.isArray(blockData.pins) ? blockData.pins.map(pin => ({
          image_media_id: pin.image_media_id || null,
          label: pin.label || ''
        })) : []
      };
    
    case 'numbered_cards':
      return {
        section_title: blockData.section_title || '',
        background_color: blockData.background_color || 'dark',
        cards: Array.isArray(blockData.cards) ? blockData.cards.map(card => ({
          number: card.number || '',
          title: card.title || '',
          description: sanitize(card.description || '')
        })) : []
      };
    
    case 'lead_magnet':
      return {
        icon: blockData.icon || '',
        title: blockData.title || '',
        description: blockData.description || '',
        button_text: blockData.button_text || '',
        action_url: blockData.action_url || ''
      };
    
    case 'contact_form':
      return {
        title: blockData.title || '',
        description: blockData.description || '',
        submit_button_text: blockData.submit_button_text || 'Submit',
        fields: Array.isArray(blockData.fields) ? blockData.fields.map(field => ({
          label: field.label || '',
          type: field.type || 'text',
          required: Boolean(field.required),
          placeholder: field.placeholder || ''
        })) : []
      };
    
    default:
      return blockData;
  }
}

/**
 * Sanitize and prepare blocks for creation
 */
function prepareBlocksForCreation(blocks) {
  return blocks.map((block, index) => ({
    block_type: block.block_type,
    block_order: index,
    block_data: sanitizeBlockData(block.block_type, block.block_data || {})
  }));
}

module.exports = {
  sanitizeBlockData,
  prepareBlocksForCreation
};
