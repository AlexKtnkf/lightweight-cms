import type { BlockType } from '../../domain/content/types';
import type { ComponentType } from 'react';
import { HeroPreview } from './previews/HeroPreview';
import { RichTextPreview } from './previews/RichTextPreview';
import { EncartPrincipalPreview } from './previews/EncartPrincipalPreview';
import { AccrochePreview } from './previews/AccrochePreview';
import { PinGridPreview } from './previews/PinGridPreview';
import { NumberedCardsPreview } from './previews/NumberedCardsPreview';
import { QuestionReponsePreview } from './previews/QuestionReponsePreview';
import { LeadMagnetPreview } from './previews/LeadMagnetPreview';
import { ContactFormPreview } from './previews/ContactFormPreview';
import { ShopProductPreview } from './previews/ShopProductPreview';
import { AppointmentBookingPreview } from './previews/AppointmentBookingPreview';

export interface BlockCatalogEntry {
  type: BlockType;
  label: string;
  description: string;
  Preview: ComponentType;
  /** Feature flag that controls visibility of this block for non-super_admin users */
  featureFlag: string;
}

export const blockCatalog: BlockCatalogEntry[] = [
  {
    type: 'hero',
    label: 'Hero',
    description:
      'Grande bannière d\'en-tête pleine largeur. Idéale pour la première section d\'une page d\'accueil : elle affiche un slogan, un titre accrocheur, un court texte de présentation et jusqu\'à deux boutons d\'appel à l\'action.',
    Preview: HeroPreview,
    featureFlag: 'FEATURE_BLOCK_HERO',
  },
  {
    type: 'rich_text',
    label: 'Texte enrichi',
    description:
      'Bloc de contenu libre avec mise en forme riche (gras, italique, listes, liens, images…). Parfait pour rédiger un paragraphe, un article ou toute section de texte.',
    Preview: RichTextPreview,
    featureFlag: 'FEATURE_BLOCK_RICH_TEXT',
  },
  {
    type: 'encart_principal',
    label: 'Encart principal',
    description:
      'Section mise en avant avec une image, un titre, un texte descriptif et un lien optionnel. Idéal pour présenter un service, une offre phare, un point clé...',
    Preview: EncartPrincipalPreview,
    featureFlag: 'FEATURE_BLOCK_ENCART_PRINCIPAL',
  },
  {
    type: 'accroche',
    label: 'Accroche',
    description:
      'Section d\'introduction avec un titre, un texte riche et une image optionnelle. Sert à introduire une rubrique ou attirer l\'attention sur un sujet important.',
    Preview: AccrochePreview,
    featureFlag: 'FEATURE_BLOCK_ACCROCHE',
  },
  {
    type: 'pin_grid',
    label: 'Pin Grid',
    description:
      'Grille d\'images façon Pinterest avec un titre de section. Chaque « pin » contient une image et un libellé. Idéal pour une galerie de recettes, réalisations ou inspirations visuelles.',
    Preview: PinGridPreview,
    featureFlag: 'FEATURE_BLOCK_PIN_GRID',
  },
  {
    type: 'numbered_cards',
    label: 'Cartes numérotées',
    description:
      'Série de cartes numérotées sur fond sombre ou clair. Chaque carte affiche un numéro, un titre et une description. Parfait pour détailler des étapes, une méthode ou un programme.',
    Preview: NumberedCardsPreview,
    featureFlag: 'FEATURE_BLOCK_NUMBERED_CARDS',
  },
  {
    type: 'question_reponse',
    label: 'FAQ',
    description:
      'Section de questions fréquentes en accordéon. Ajoutez un titre, un texte d\'introduction optionnel et autant de couples question / réponse que nécessaire.',
    Preview: QuestionReponsePreview,
    featureFlag: 'FEATURE_BLOCK_QUESTION_REPONSE',
  },
  {
    type: 'lead_magnet',
    label: 'Lead Magnet',
    description:
      'Encart d\'inscription par e-mail avec icône, titre, description et un bouton d\'action. Utile pour proposer un guide gratuit, une newsletter ou tout contenu à télécharger.',
    Preview: LeadMagnetPreview,
    featureFlag: 'FEATURE_BLOCK_LEAD_MAGNET',
  },
  {
    type: 'contact_form',
    label: 'Formulaire de contact',
    description:
      'Formulaire personnalisable avec des champs libres (texte, e-mail, téléphone, liste déroulante, zone de texte). Configurez le titre, la description et le bouton d\'envoi.',
    Preview: ContactFormPreview,
    featureFlag: 'FEATURE_BLOCK_CONTACT_FORM',
  },
  {
    type: 'shop_product',
    label: 'Produit boutique',
    description:
      'Bloc de mise en avant d\'un produit avec image, prix et bouton vers la boutique.',
    Preview: ShopProductPreview,
    featureFlag: 'FEATURE_BLOCK_SHOP_PRODUCT',
  },
  {
    type: 'appointment_booking',
    label: 'Prise de rendez-vous',
    description:
      'Bloc d\'appel a l\'action vers le module de reservation de rendez-vous.',
    Preview: AppointmentBookingPreview,
    featureFlag: 'FEATURE_BLOCK_APPOINTMENT_BOOKING',
  },
];
