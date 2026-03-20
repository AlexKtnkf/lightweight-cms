import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  useForm, 
  useFieldArray, 
  useFormContext, 
  FormProvider 
} from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form'; // Fix for verbatimModuleSyntax
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useMemo } from 'react';
import { z } from 'zod';
import { settingsApi } from '../../shared/api/settings';
import type { Settings } from '../../domain/settings/types';
import { Loading } from '../../shared/components/Loading';
import { ImagePickerModal } from '../../shared/components/ImagePickerModal';

// --- 1. SCHEMA ---
const menuLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
  order: z.number(),
});

const socialLinkSchema = z.object({
  platform: z.string(),
  url: z.string(),
  icon: z.string(),
});

const settingsSchema = z.object({
  site_title: z.string().min(1, 'Le titre du site est requis'),
  site_tagline: z.string(),
  logo_media_id: z.number().nullable().optional(), 
  header_menu_links: z.array(menuLinkSchema),
  footer_menu_links: z.array(menuLinkSchema),
  footer_text: z.string(),
  social_links: z.array(socialLinkSchema),
  allow_search_indexing: z.boolean().default(true),
  contact_email: z.string().email('Email valide requis').optional().or(z.literal('')),
});

type SettingsForm = z.infer<typeof settingsSchema>;

// --- 2. SUB-COMPONENTS ---

interface MenuLinksSectionProps {
  name: 'header_menu_links' | 'footer_menu_links';
  title: string;
}

function MenuLinksSection({ name, title }: MenuLinksSectionProps) {
  const { control, register } = useFormContext<SettingsForm>();
  const { fields, append, remove, move } = useFieldArray({ control, name });

  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={() => append({ label: '', url: '', order: fields.length })}
          className="text-sm bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200 text-gray-700"
        >
          + Ajouter un lien
        </button>
      </div>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-3 p-3 bg-gray-50 rounded-md items-start">
            <div className="flex-1 grid grid-cols-2 gap-3">
              <input {...register(`${name}.${index}.label`)} className="w-full px-2 py-1.5 text-sm border rounded" placeholder="Label" />
              <input {...register(`${name}.${index}.url`)} className="w-full px-2 py-1.5 text-sm border rounded" placeholder="URL" />
            </div>
            <div className="flex gap-1 mt-1">
              <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} className="px-2 border rounded bg-white disabled:opacity-50">↑</button>
              <button type="button" onClick={() => move(index, index + 1)} disabled={index === fields.length - 1} className="px-2 border rounded bg-white disabled:opacity-50">↓</button>
              <button type="button" onClick={() => remove(index)} className="px-2 text-red-600 border border-red-200 rounded bg-red-50">×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialLinksSection() {
  const { control, register, setValue } = useFormContext<SettingsForm>();
  const { fields, append, remove } = useFieldArray({ control, name: 'social_links' });

  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Réseaux Sociaux</h3>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-3 p-3 bg-gray-50 rounded-md items-start">
            <select
              {...register(`social_links.${index}.platform`)}
              onChange={(e) => {
                const v = e.target.value;
                setValue(`social_links.${index}.platform`, v);
                setValue(`social_links.${index}.icon`, v);
              }}
              className="flex-1 px-2 py-1.5 text-sm border rounded bg-white"
            >
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
            </select>
            <input {...register(`social_links.${index}.url`)} className="flex-1 px-2 py-1.5 text-sm border rounded" placeholder="URL" />
            <button type="button" onClick={() => remove(index)} className="px-2 py-1.5 text-red-600">×</button>
          </div>
        ))}
        <button type="button" onClick={() => append({ platform: 'instagram', url: '', icon: 'instagram' })} className="text-sm bg-gray-100 px-3 py-1.5 rounded-md mt-2">
          + Ajouter un réseau
        </button>
      </div>
    </div>
  );
}

// --- 3. MAIN COMPONENT ---

export function SettingsEditor() {
  const [isLogoPickerOpen, setIsLogoPickerOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<Settings>) => settingsApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['settings'], updated);
      alert('Paramètres enregistrés ! Le site est en cours de régénération...');
    },
  });

  const formValues: SettingsForm = useMemo(() => {
    const empty: SettingsForm = {
      site_title: '',
      site_tagline: '',
      logo_media_id: null,
      header_menu_links: [],
      footer_menu_links: [],
      footer_text: '',
      social_links: [],
      allow_search_indexing: true,
      contact_email: '',
    };
    if (!settings) return empty;

    return {
      site_title: settings.site_title ?? '',
      site_tagline: settings.site_tagline ?? '',
      logo_media_id: settings.logo_media_id ?? null,
      header_menu_links: settings.header_menu_links ?? [],
      footer_menu_links: settings.footer_menu_links ?? [],
      footer_text: settings.footer_text ?? '',
      social_links: settings.social_links ?? [],
      allow_search_indexing: settings.allow_search_indexing ?? true,
      contact_email: settings.contact_email ?? '',
    };
  }, [settings]);

  const methods = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    values: formValues,
  });

  const { handleSubmit, setValue, watch, register, formState: { errors } } = methods;
  const logoMediaId = watch('logo_media_id');

  const onFormSubmit: SubmitHandler<SettingsForm> = (data) => {
    // Re-calculate order based on array index
    const prepare = (arr: { label: string; url: string; order: number }[]) => 
      arr.map((item, i) => ({ ...item, order: i }));

    // Align logo_media_id: convert null to undefined for the API
    const payload: Partial<Settings> = {
      ...data,
      logo_media_id: data.logo_media_id === null ? undefined : data.logo_media_id,
      header_menu_links: prepare(data.header_menu_links),
      footer_menu_links: prepare(data.footer_menu_links),
    };

    mutation.mutate(payload);
  };

  if (isLoading) return <Loading />;
  if (error) return <div className="p-6 text-red-600">Erreur de chargement.</div>;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Paramètres du site</h1>
      
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onFormSubmit)} className="bg-white shadow rounded-lg p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Titre *</label>
              <input {...register('site_title')} className="w-full mt-1 px-3 py-2 border rounded-md" />
              {errors.site_title && <p className="text-red-500 text-xs mt-1">{errors.site_title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slogan</label>
              <input {...register('site_tagline')} className="w-full mt-1 px-3 py-2 border rounded-md" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
              {logoMediaId ? (
                <div className="relative">
                  <img src={`/api/media/${logoMediaId}`} className="w-20 h-20 object-contain bg-white border rounded" alt="Logo" />
                  <button type="button" onClick={() => setValue('logo_media_id', null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                </div>
              ) : <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">Aucun</div>}
              <button type="button" onClick={() => setIsLogoPickerOpen(true)} className="px-4 py-2 border rounded bg-white text-sm">Changer</button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Autoriser le référencement par les moteurs de recherche</label>
                <p className="text-xs text-gray-500 mt-1">Contrôle le fichier robots.txt pour permettre ou bloquer l'indexation du site</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input {...register('allow_search_indexing')} type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <MenuLinksSection name="header_menu_links" title="Menu Header" />
          <MenuLinksSection name="footer_menu_links" title="Menu Footer" />

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Texte Footer</label>
            <textarea {...register('footer_text')} rows={3} className="w-full px-3 py-2 border rounded-md" />
          </div>

          <SocialLinksSection />

          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email pour le formulaire de contact</label>
            <p className="text-xs text-gray-500 mb-2">Les messages du formulaire de contact seront envoyés à cet email</p>
            <input {...register('contact_email')} type="email" className="w-full px-3 py-2 border rounded-md" placeholder="admin@example.com" />
            {errors.contact_email && <p className="text-red-500 text-xs mt-1">{errors.contact_email.message}</p>}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button type="submit" disabled={mutation.isPending} className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">
              {mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </FormProvider>

      <ImagePickerModal
        isOpen={isLogoPickerOpen}
        onClose={() => setIsLogoPickerOpen(false)}
        onSelect={(id) => {
          setValue('logo_media_id', id ?? null, { shouldDirty: true });
          setIsLogoPickerOpen(false);
        }}
        selectedId={logoMediaId ?? null}
      />
    </div>
  );
}