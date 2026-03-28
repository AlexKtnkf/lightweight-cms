import { useEffect, useMemo, useState, useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImagePickerModal } from "../../shared/components/ImagePickerModal";
import { settingsApi } from "../../shared/api/settings";
import { mediaApi } from "../../shared/api/media";
import type { Settings } from "../../domain/settings/types";
import type { Media } from "../../domain/media/types";
import { Loading } from "../../shared/components/Loading";
import {
  renderInstagramSlide,
  type SlideColorTheme,
  type SlideTextAlignment,
  type SlideVariant,
} from "./instagramSlideRenderer";

const templateOptions: Array<{
  id: SlideVariant;
  title: string;
  accent: string;
}> = [
  {
    id: "text-only",
    title: "Texte seul",
    accent: "bg-stone-100",
  },
  {
    id: "text-with-image",
    title: "Texte + petite image verticale",
    accent: "bg-stone-100",
  },
  {
    id: "text-with-horizontal-image",
    title: "Texte + petite image horizontale",
    accent: "bg-stone-100",
  },
  {
    id: "image-with-text",
    title: "Image + petit texte",
    accent: "bg-stone-100",
  },
];

const colorThemeOptions: Array<{
  id: SlideColorTheme;
  previewClass: string;
}> = [
  {
    id: "dedicated",
    previewClass:
      "bg-[linear-gradient(135deg,#fdfaf5_0%,#fdfaf5_45%,#e8bdc3_100%)]",
  },
  {
    id: "frontend",
    previewClass:
      "bg-[linear-gradient(135deg,#f7f1e9_0%,#dcebe5_42%,#e0bc96_100%)]",
  },
  {
    id: "tricolor-soft",
    previewClass:
      "bg-[linear-gradient(135deg,#fbf8fd_0%,#9bc29d_24%,#9370db_68%,#e34262_100%)]",
  },
  {
    id: "plain-rose",
    previewClass: "bg-[#E34262]",
  },
  {
    id: "plain-sage",
    previewClass: "bg-[#9BC29D]",
  },
  {
    id: "plain-violet",
    previewClass: "bg-[#9370DB]",
  },
];

const logoColors: Record<SlideColorTheme, string> = {
  dedicated: "#D87A8E",
  frontend: "#3D7370",
  "tricolor-soft": "#6E56A6",
  "plain-rose": "#FFF5F7",
  "plain-sage": "#F7FFF7",
  "plain-violet": "#F8F4FF",
};

function slugifyFilename(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "slide-instagram"
  );
}

export function InstagramSlideGenerator() {
  const [variant, setVariant] = useState<SlideVariant>("text-only");
  const [colorTheme, setColorTheme] = useState<SlideColorTheme>("dedicated");
  const [title, setTitle] = useState("");
  const [bodyAlignment, setBodyAlignment] =
    useState<SlideTextAlignment>("normal");
  const [body, setBody] = useState(
    "- Paris est vide ce matin, férié ne lui réussit pas bien\n- Pardon pour le thé mon amour, infusé jusqu'à non-retour\n- C'est même pas qu'on ne s'aime plus, c'est rien que la beauté qui se vautre\n - C'est même pas qu'on ne s'aime plus, c'est même plus qu'on en aime d'autres",
  );
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [themeLogoUrl, setThemeLogoUrl] = useState<string | null>(null);

  const deferredTitle = useDeferredValue(title);
  const deferredBody = useDeferredValue(body);
  const deferredBodyAlignment = useDeferredValue(bodyAlignment);
  const deferredVariant = useDeferredValue(variant);
  const deferredColorTheme = useDeferredValue(colorTheme);
  const deferredImageId = useDeferredValue(selectedImageId);

  const { data: settings, isLoading: settingsLoading } = useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: media, isLoading: mediaLoading } = useQuery<Media[]>({
    queryKey: ["media"],
    queryFn: () => mediaApi.list(),
    staleTime: 1000 * 60 * 2,
  });

  useEffect(() => {
    let active = true;

    async function loadThemeLogo() {
      const sourceUrl = settings?.logo_media_id
        ? `/api/media/${settings.logo_media_id}`
        : "/media/logo.svg";

      try {
        const response = await fetch(sourceUrl);
        const contentType = response.headers.get("content-type") ?? "";
        if (!active) {
          return;
        }

        const isSvg =
          contentType.includes("image/svg+xml") || sourceUrl.endsWith(".svg");
        if (isSvg) {
          const asset = await response.text();
          if (!active) {
            return;
          }
          const tintedSvg = asset.replace(
            /currentColor/g,
            logoColors[colorTheme],
          );
          setThemeLogoUrl(
            `data:image/svg+xml;charset=utf-8,${encodeURIComponent(tintedSvg)}`,
          );
          return;
        }

        setThemeLogoUrl(sourceUrl);
      } catch {
        if (active) {
          setThemeLogoUrl(
            settings?.logo_media_id
              ? `/api/media/${settings.logo_media_id}`
              : "/media/logo.svg",
          );
        }
      }
    }

    loadThemeLogo();

    return () => {
      active = false;
    };
  }, [colorTheme, settings?.logo_media_id]);

  const selectedImage = useMemo(
    () => media?.find((item) => item.id === deferredImageId) ?? null,
    [media, deferredImageId],
  );

  const logoUrl = themeLogoUrl;
  const imageUrl = selectedImage ? `/api/media/${selectedImage.id}` : null;

  useEffect(() => {
    let cancelled = false;

    async function generatePreview() {
      setRendering(true);

      try {
        const nextPreviewUrl = await renderInstagramSlide({
          variant: deferredVariant,
          colorTheme: deferredColorTheme,
          title: deferredTitle,
          body: deferredBody,
          bodyAlignment: deferredBodyAlignment,
          imageUrl,
          logoUrl,
        });

        if (!cancelled) {
          setPreviewUrl(nextPreviewUrl);
        }
      } catch {
        if (!cancelled) {
          setPreviewUrl(null);
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
  }, [
    deferredVariant,
    deferredColorTheme,
    deferredTitle,
    deferredBody,
    deferredBodyAlignment,
    imageUrl,
    logoUrl,
    settings?.site_title,
  ]);

  const requiresImage = variant !== "text-only";

  const downloadSlide = () => {
    if (!previewUrl) {
      return;
    }

    const anchor = document.createElement("a");
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
            <h1 className="text-2xl font-bold text-gray-900">InstaStudio</h1>
          </div>

          <button
            type="button"
            onClick={downloadSlide}
            disabled={!previewUrl || rendering}
            className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {rendering ? "Génération..." : "Télécharger le slide"}
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
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <h3 className="text-base font-semibold text-gray-900">
                    {option.title}
                  </h3>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Couleurs de fond
            </label>
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
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`mb-3 h-14 rounded border border-gray-200 ${option.previewClass}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid ">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Titre</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Ex : Férié"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-medium text-gray-700">Texte</label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                  Alignement
                </span>
                <div className="inline-flex rounded-md border border-gray-300 bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setBodyAlignment("normal")}
                    className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                      bodyAlignment === "normal"
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setBodyAlignment("center")}
                    className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                      bodyAlignment === "center"
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Centré
                  </button>
                </div>
              </div>
            </div>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={9}
              className="w-full rounded border border-gray-300 px-3 py-3 text-sm leading-7 text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Ex : Paris est vide ce matin, férié ne lui réussit pas bien"
            />
          </div>
          {requiresImage && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Image
                  </h3>
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
                      <p className="truncate text-sm font-medium text-gray-900">
                        {selectedImage.filename}
                      </p>
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
                    {requiresImage
                      ? "Aucune image sélectionnée pour le moment."
                      : "Aucune image sélectionnée."}
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
                  Format 1080 × 1350, optimisé pour les publications Instagram
                  en portrait.
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
          </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
              <button
                type="button"
                onClick={downloadSlide}
                disabled={!previewUrl || rendering}
                className="inline-flex items-end justify-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {rendering ? "Génération..." : "Télécharger le slide"}
              </button>
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
