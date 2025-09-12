// src/pages/SubmitTool.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useUser, useAuth } from '@clerk/clerk-react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';
import { supabase as baseSupabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Tool name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  pricing: z.enum(['free', 'paid', 'trial']),
  tags: z.string().min(2, { message: 'Please add at least one tag.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitTool() {
  const { isSignedIn, user } = useUser();
  const { getToken, isLoaded } = useAuth();
  const navigate = useNavigate();
  const { toolId } = useParams<{ toolId?: string }>();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      url: '',
      pricing: 'free',
      tags: '',
    },
  });

  useEffect(() => {
    if (!isSignedIn) {
      toast.error('Please sign in to submit a tool', {
        action: {
          label: 'Sign In',
          onClick: () => document.querySelector<HTMLButtonElement>('[data-clerk-trigger]')?.click(),
        },
      });
      navigate('/');
    }
  }, [isSignedIn, navigate]);

  // helper: create a supabase client that includes Clerk token in Authorization
  async function getAuthedSupabaseClient() {
    if (!isLoaded) throw new Error('Auth not loaded yet. Wait a moment.');
    const token = await getToken({ template: 'supabase' } as any).catch(() => getToken());
    if (!token) throw new Error('No Clerk token found. Are you signed in?');
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anon) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars.');
    return createClient(url, anon, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }

  // If a toolId is present -> load the tool into the form (edit mode)
  useEffect(() => {
    if (!toolId) return;
    let cancelled = false;
    const loadTool = async () => {
      const { data, error } = await baseSupabase.from('tools').select('*').eq('id', toolId).single();
      if (error) {
        console.error('Failed to load tool:', error);
        toast.error('Failed to load tool data.');
        return;
      }
      if (cancelled) return;
      form.reset({
        name: data.name || '',
        description: data.description || '',
        url: data.url || '',
        pricing: data.pricing || 'free',
        tags: (data.tags || []).join(', '),
      });
      setExistingImageUrl(data.imageUrl || null);
      setPreviewUrl(data.imageUrl || null);
    };
    loadTool();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) setPreviewUrl(URL.createObjectURL(f));
  }

  async function onSubmit(values: FormValues) {
    if (!isSignedIn || !user?.id) {
      toast.error('You must be signed in to submit.');
      return;
    }
    setSubmitting(true);
    try {
      const sb = await getAuthedSupabaseClient();

      // finalImageUrl starts as existingImageUrl (if any)
      let finalImageUrl = existingImageUrl ?? `https://images.unsplash.com/photo-1488590528505-98d2b5aba04b`;

      if (file) {
        const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '');
        const fileName = `${Date.now()}.${ext}`;

        const uploadResult = await sb.storage.from('tool-public-images').upload(fileName, file, { upsert: true });
        if (uploadResult.error) {
          console.error('Upload error', uploadResult.error);
          toast.error('Image upload failed.');
          setSubmitting(false);
          return;
        }

        const publicUrlResult = sb.storage.from('tool-public-images').getPublicUrl(uploadResult.data.path);
        finalImageUrl = (publicUrlResult as any).data?.publicUrl || (publicUrlResult as any)?.publicUrl || existingImageUrl;
      }

      const toolPayload = {
        name: values.name,
        description: values.description,
        url: values.url,
        pricing: values.pricing,
        tags: values.tags.split(',').map(t => t.trim()).filter(Boolean),
        imageUrl: finalImageUrl,
        category: 'productivity',
      };

      if (toolId) {
        // Update existing tool (do NOT modify user_id here)
        const { error: updateErr } = await sb.from('tools').update(toolPayload).eq('id', toolId);
        if (updateErr) {
          console.error('Update error:', updateErr);
          toast.error('Failed to update tool.');
          setSubmitting(false);
          return;
        }
        toast.success('Tool updated successfully!');
      } else {
        // Insert new tool (set owner / user_id)
        const insertPayload = { ...toolPayload, user_id: user.id };
        const { error: insertErr } = await sb.from('tools').insert([insertPayload]);
        if (insertErr) {
          console.error('Insert error:', insertErr);
          toast.error('Failed to submit tool.');
          setSubmitting(false);
          return;
        }
        toast.success('Tool submitted successfully!');
      }

      form.reset();
      setFile(null);
      setPreviewUrl(null);
      navigate('/tools');
    } catch (err: any) {
      console.error('Submit error:', err);
      toast.error(err?.message || 'Unexpected error. Check console.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isSignedIn) return null;

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-2xl font-bold mb-8">{toolId ? 'Edit Tool' : 'Submit a New Tool'}</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Tool Name</FormLabel>
              <FormControl><Input placeholder="Enter tool name" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea placeholder="What does this tool do?" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="url" render={({ field }) => (
            <FormItem>
              <FormLabel>Tool URL</FormLabel>
              <FormControl><Input placeholder="https://example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="pricing" render={({ field }) => (
            <FormItem>
              <FormLabel>Pricing</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select pricing type" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="tags" render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl><Input placeholder="productivity, ai, tools (comma separated)" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormItem>
            <FormLabel>Image (optional)</FormLabel>
            <FormControl>
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full border rounded px-3 py-2 bg-background text-foreground" />
            </FormControl>
            <FormMessage />
            {previewUrl && (
              <div className="mt-3">
                <img src={previewUrl} alt="Preview" className="w-40 h-24 object-cover rounded" />
              </div>
            )}
          </FormItem>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? (toolId ? 'Updating...' : 'Submitting...') : (toolId ? 'Update Tool' : 'Submit Tool')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
