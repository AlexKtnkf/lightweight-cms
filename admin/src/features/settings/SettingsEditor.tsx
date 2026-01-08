import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { settingsApi } from '../../shared/api/settings';
import type { Settings } from '../../domains/settings/types';

const settingsSchema = z.object({
  site_title: z.string().min(1, 'Site title is required'),
  site_tagline: z.string().optional(),
  logo_media_id: z.number().optional(),
  header_menu_links: z.array(z.object({
    label: z.string(),
    url: z.string(),
    order: z.number(),
  })).optional(),
  footer_menu_links: z.array(z.object({
    label: z.string(),
    url: z.string(),
    order: z.number(),
  })).optional(),
  footer_text: z.string().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export function SettingsEditor() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
  });

  const mutation = useMutation({
    mutationFn: (data: SettingsForm) => settingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      alert('Settings saved successfully!');
    },
  });

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings || {
      site_title: '',
      site_tagline: '',
      header_menu_links: [],
      footer_menu_links: [],
    },
  });

  if (settings && !form.formState.isDirty) {
    form.reset({
      site_title: settings.site_title || '',
      site_tagline: settings.site_tagline || '',
      logo_media_id: settings.logo_media_id,
      header_menu_links: settings.header_menu_links || [],
      footer_menu_links: settings.footer_menu_links || [],
      footer_text: settings.footer_text || '',
    });
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="bg-white shadow rounded-lg p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Site Title *
          </label>
          <input
            {...form.register('site_title')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Site Tagline
          </label>
          <input
            {...form.register('site_tagline')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logo Media ID
          </label>
          <input
            type="number"
            {...form.register('logo_media_id', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Footer Text
          </label>
          <textarea
            {...form.register('footer_text')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
