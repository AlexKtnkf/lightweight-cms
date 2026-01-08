import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import type { Page } from '../../domains/content/types';
import { pagesApi } from '../../shared/api/pages';
import { BlockEditor } from '../blocks/BlockEditor';

const pageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  published: z.boolean(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  blocks: z.array(z.any()),
});

type PageForm = z.infer<typeof pageSchema>;

export function PageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: page, isLoading } = useQuery<Page>({
    queryKey: ['page', id],
    queryFn: () => pagesApi.get(Number(id!)),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (data: PageForm) => 
      id ? pagesApi.update(Number(id), data) : pagesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      navigate('/admin/pages');
    },
  });

  const form = useForm<PageForm>({
    resolver: zodResolver(pageSchema),
    defaultValues: page || {
      title: '',
      slug: '',
      published: false,
      blocks: [],
    },
  });

  // Update form when page loads
  if (page && !form.formState.isDirty) {
    form.reset({
      title: page.title,
      slug: page.slug,
      published: page.published,
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      blocks: page.blocks || [],
    });
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {id ? 'Edit Page' : 'New Page'}
        </h1>
        <button
          onClick={() => navigate('/admin/pages')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Pages
        </button>
      </div>

      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="bg-white shadow rounded-lg p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
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
            Slug *
          </label>
          <input
            {...form.register('slug')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {form.formState.errors.slug && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.slug.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...form.register('published')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">Published</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meta Title
          </label>
          <input
            {...form.register('meta_title')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meta Description
          </label>
          <textarea
            {...form.register('meta_description')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blocks ({form.watch('blocks')?.length || 0})
          </label>
          <BlockEditor
            blocks={form.watch('blocks') || []}
            onChange={(blocks) => form.setValue('blocks', blocks)}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/pages')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
