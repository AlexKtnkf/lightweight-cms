import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Article, Block } from '../../domain/content/types';
import { articlesApi } from '../../shared/api/articles';
import { RichTextBlock } from '../blocks/components/RichTextBlock';
import { Loading } from '../../shared/components/Loading';

const articleSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  slug: z.string().optional(),
  published: z.boolean(),
  published_at: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  content: z.string().optional(),
});

type ArticleForm = z.infer<typeof articleSchema>;

export function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: article, isLoading } = useQuery<Article>({
    queryKey: ['article', id],
    queryFn: () => articlesApi.get(Number(id!)),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (data: ArticleForm) => 
      id ? articlesApi.update(Number(id), data) : articlesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      navigate('/articles');
    },
  });

  const form = useForm<ArticleForm>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      slug: '',
      published: false,
      content: '',
    },
  });

  // Helper to extract content from blocks array or create default block
  const getContentFromArticle = (article: Article): string => {
    if (!article.blocks || article.blocks.length === 0) return '';
    const textBlock = article.blocks.find((b: Block) => b.block_type === 'rich_text');
    return textBlock?.block_data?.richText || '';
  };

  // Reset form when article loads (only if article changed)
  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title,
        slug: article.slug,
        published: article.published,
        published_at: article.published_at
          ? new Date(article.published_at).toISOString().slice(0, 16)
          : '',
        meta_title: article.meta_title || '',
        meta_description: article.meta_description || '',
        content: getContentFromArticle(article),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {id ? 'Modifier l\'article' : 'Nouvel article'}
        </h1>
        <button
          onClick={() => navigate('/articles')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Retour à la liste des articles
        </button>
      </div>

      <form
        onSubmit={form.handleSubmit((data) => {
          // Convert content string back to blocks array for backend
          const blocks: Block[] = [
            {
              block_type: 'rich_text',
              block_data: { richText: data.content || '' },
            },
          ];

          const submitData = {
            title: data.title,
            slug: data.slug,
            published: data.published,
            published_at: data.published_at ? new Date(data.published_at).toISOString() : undefined,
            meta_title: data.meta_title,
            meta_description: data.meta_description,
            blocks,
          };
          mutation.mutate(submitData);
        })}
        className="bg-white shadow rounded-lg p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre *
          </label>
          <input
            {...form.register('title')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {form.formState.errors.title && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug
          </label>
          <input
            {...form.register('slug')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {form.formState.errors.slug && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.slug.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              {...form.register('published')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">Publié</label>
          </div>
          {form.watch('published') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publié le
              </label>
              <input
                type="datetime-local"
                {...form.register('published_at')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre SEO
          </label>
          <input
            {...form.register('meta_title')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description SEO
          </label>
          <textarea
            {...form.register('meta_description')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <RichTextBlock
            block={{ block_type: 'rich_text', block_data: { richText: form.watch('content') || '' } }}
            onChange={(data) => form.setValue('content', data.richText, { shouldDirty: true })}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/articles')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Enregistrer...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
