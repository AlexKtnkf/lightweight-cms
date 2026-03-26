import { useEffect, useMemo, useState, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ImagePickerModal } from '../../shared/components/ImagePickerModal';
import { settingsApi } from '../../shared/api/settings';
import { mediaApi } from '../../shared/api/media';
import type { Settings } from '../../domain/settings/types';
import type { Media } from '../../domain/media/types';
import { Loading } from '../../shared/components/Loading';
import { renderInstagramSlide, type SlideColorTheme, type SlideVariant } from './instagramSlideRenderer';

const templateOptions: Array<{
  id: SlideVariant;
  title: string;
  accent: string;
}> = [
  {
    id: 'text-only',
    title: 'Texte seul',
    accent: 'bg-stone-100',
  },
  {
    id: 'text-with-image',
    title: 'Texte + petite image verticale',
    accent: 'bg-stone-100',
  },
  {
    id: 'text-with-horizontal-image',
    title: 'Texte + petite image horizontale',
    accent: 'bg-stone-100',
  },
  {
    id: 'image-with-text',
    title: 'Image + petit texte',
    accent: 'bg-stone-100',
  },
];

const colorThemeOptions: Array<{
  id: SlideColorTheme;
  previewClass: string;
}> = [
  {
    id: 'dedicated',
    previewClass: 'bg-[linear-gradient(135deg,#fdfaf5_0%,#fdfaf5_45%,#e8bdc3_100%)]',
  },
  {
    id: 'frontend',
    previewClass: 'bg-[linear-gradient(135deg,#eef5f1_0%,#8fc4c1_35%,#d4a373_100%)]',
  },
  {
    id: 'plain-rose',
    previewClass: 'bg-[#E34262]',
  },
];

function slugifyFilename(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'slide-instagram';
}

export function InstagramSlideGenerator() {
  const [variant, setVariant] = useState<SlideVariant>('text-only');
  const [colorTheme, setColorTheme] = useState<SlideColorTheme>('dedicated');
  const [title, setTitle] = useState('Férié');
  const [body, setBody] = useState(
    '- Paris est triste ce matin, férié ne lui réussit pas bien\n- Pardon pour le thé mon amour, infusé jusqu\'à non-retour\n- C\'est même pas qu\'on ne s\'aime plus, c\'est rien que la beauté qui se vautre\n - C\'est même pas qu\'on ne s\'aime plus, c\'est même plus qu\'on en aime d\'autres'
  );
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [defaultLogoUrl, setDefaultLogoUrl] = useState<string | null>(null);

  const deferredTitle = useDeferredValue(title);
  const deferredBody = useDeferredValue(body);
  const deferredVariant = useDeferredValue(variant);
  const deferredColorTheme = useDeferredValue(colorTheme);
  const deferredImageId = useDeferredValue(selectedImageId);

  const { data: settings, isLoading: settingsLoading } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: media, isLoading: mediaLoading } = useQuery<Media[]>({
    queryKey: ['media'],
    queryFn: () => mediaApi.list(),
    staleTime: 1000 * 60 * 2,
  });

  useEffect(() => {
    let active = true;

    async function loadDefaultLogo() {
      try {
        const response = await fetch('/media/logo.svg');
        const svg = await response.text();
        if (!active) {
          return;
        }

        const tintedSvg = svg.replace(/currentColor/g, '#D87A8E');
        setDefaultLogoUrl(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(tintedSvg)}`);
      } catch {
        if (active) {
          setDefaultLogoUrl('/media/logo.svg');
        }
      }
    }

    loadDefaultLogo();

    return () => {
      active = false;
    };
  }, []);

  const selectedImage = useMemo(
    () => media?.find((item) => item.id === deferredImageId) ?? null,
    [media, deferredImageId]
  );

  const logoUrl = settings?.logo_media_id ? `/api/media/${settings.logo_media_id}` : defaultLogoUrl;
  const imageUrl = selectedImage ? `/api/media/${selectedImage.id}` : null;

  useEffect(() => {
    let cancelled = false;

    async function generatePreview() {
      setRendering(true);
      setRenderError(null);

      try {
        const nextPreviewUrl = await renderInstagramSlide({
          variant: deferredVariant,
          colorTheme: deferredColorTheme,
          title: deferredTitle,
          body: deferredBody,
          imageUrl,
          logoUrl,
        });

        if (!cancelled) {
          setPreviewUrl(nextPreviewUrl);
        }
      } catch (error) {
        if (!cancelled) {
          setRenderError('Impossible de generer le visuel pour le moment.');
        }
      } finally {
        if (!cancelled) {
          setRendering(false);
        }
      }
    }

    if (logoUrl) {
      generatePreview();
    }

    return () => {
      cancelled = true;
    };
  }, [deferredVariant, deferredColorTheme, deferredTitle, deferredBody, imageUrl, logoUrl, settings?.site_title]);

  const requiresImage = variant !== 'text-only';

  const downloadSlide = () => {
    if (!previewUrl) {
      return;
    }

    const anchor = document.createElement('a');
    anchor.href = previewUrl;
    anchor.download = `${slugifyFilename(title)}-${variant}.png`;
    anchor.click();
  };

  if (settingsLoading || mediaLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Slides Instagram</h1>
          </div>

          <button
            type="button"
            onClick={downloadSlide}
            disabled={!previewUrl || rendering}
            className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {rendering ? 'Génération...' : 'Télécharger le slide'}
          </button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Composition</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {templateOptions.map((option) => {
              const isSelected = option.id === variant;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setVariant(option.id)}
                  className={`rounded-lg border p-4 text-left transition ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
              
                  <h3 className="text-base font-semibold text-gray-900">{option.title}</h3>
                </button>
              );
            })}
          </div>

          <div className="grid ">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Titre</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Ex : Les signes qui montrent que vous manquez de carburant"
              />
            </div>

          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Couleurs de fond</label>
            <div className="grid gap-3 md:grid-cols-3">
              {colorThemeOptions.map((option) => {
                const isSelected = option.id === colorTheme;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setColorTheme(option.id)}
                    className={`rounded-lg border p-3 text-left transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`mb-3 h-14 rounded border border-gray-200 ${option.previewClass}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Texte</label>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={9}
              className="w-full rounded border border-gray-300 px-3 py-3 text-sm leading-7 text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="- Première idée clé\n- Deuxième idée clé\n- Troisième idée clé"
            />
          </div>
{requiresImage && (
<div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Image</h3>
              </div>

              <button
                type="button"
                onClick={() => setIsImagePickerOpen(true)}
                className="inline-flex items-center justify-center rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition hover:border-gray-400 hover:bg-gray-100"
              >
                Choisir une image
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              {selectedImage ? (
                <>
                  <img
                    src={`/api/media/${selectedImage.id}`}
                    alt={selectedImage.alt_text || selectedImage.filename}
                    className="h-28 w-28 rounded border border-gray-200 bg-white object-cover shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{selectedImage.filename}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-gray-500">
                      {Math.round(selectedImage.file_size / 1024)} Ko
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedImageId(null)}
                    className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                  >
                    Retirer
                  </button>
                </>
              ) : (
                <div className="rounded border border-dashed border-gray-300 bg-white px-5 py-6 text-sm text-gray-500">
                  {requiresImage ? 'Aucune image sélectionnée pour le moment.' : 'Aucune image sélectionnée.'}
                </div>
              )}
            </div>
          </div>
)}
          
        </section>

        <section className="space-y-5">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Aperçu</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Format 1080 × 1350, optimisé pour les publications Instagram en portrait.
                </p>
              </div>
              <div className="rounded border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gray-600">
                4:5
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded border border-gray-200 bg-gray-50 p-4">
              <div className="mx-auto aspect-[4/5] max-w-[420px] overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Aperçu"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-stone-500">
                    Aperçu indisponible
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={downloadSlide}
                disabled={!previewUrl || rendering}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {rendering ? 'Génération en cours...' : 'Télécharger en PNG'}
              </button>
              <p className="text-xs leading-5 text-gray-500">
                Logo détecté : {settings?.logo_media_id ? 'logo du site' : 'logo SVG par défaut'}
              </p>
            </div>

            {renderError && (
              <div className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {renderError}
              </div>
            )}
          </div>
        </section>
      </div>

      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelect={setSelectedImageId}
        selectedId={selectedImageId ?? undefined}
      />
    </div>
  );
}
