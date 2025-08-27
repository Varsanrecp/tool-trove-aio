// src/pages/SubmitTool.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { supabase as baseSupabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Tool name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  pricing: z.enum(['free', 'paid', 'trial']),
  tags: z.string().min(2, { message: 'Please add at least one tag.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitTool() {
  const { isSignedIn } = useUser();
  const { getToken, isLoaded } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  // Create a temporary Supabase client that passes Clerk token in Authorization header.
  // This client will be used for upload & insert so RLS policies see an authenticated request.
  async function getAuthedSupabaseClient() {
    if (!isLoaded) {
      throw new Error('Auth not loaded yet. Try again in a moment.');
    }
    const token = await getToken({ template: 'supabase' } as any).catch(async () => {
      // fallback: try without template (some Clerk setups create supabase-compatible tokens with default template)
      return getToken();
    });

    if (!token) {
      throw new Error('No Clerk token found. Are you signed in?');
    }

    const url = import.meta.env.VITE_SUPABASE_URL;
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in env.');
    }

    // create a temporary supabase client which includes Authorization header
    // (this is intentionally per-request to attach the Clerk token)
    return createClient(url, anon, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    }
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);

    try {
      // placeholder images (same behavior as before)
      const placeholderImages = [
        'photo-1488590528505-98d2b5aba04b',
        'photo-1486312338219-ce68d2c6f44d',
        'photo-1531297484001-80022131f5a1',
        'photo-1498050108023-c5249f4df085',
        'photo-1483058712412-4245e9b90334',
      ];

      let finalImageUrl = `https://images.unsplash.com/${placeholderImages[Math.floor(Math.random() * placeholderImages.length)]}`;

      // If a file was chosen, upload it using an authed client
      if (file) {
        const sb = await getAuthedSupabaseClient();

        // create filename: timestamp + sanitized extension
        const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '');
        const fileName = `${Date.now()}.${ext}`;

        // Upload to storage (bucket must allow authenticated inserts)
        const { data: uploadData, error: uploadError } = await sb.storage
          .from('tool-public-images')
          .upload(fileName, file, { upsert: true });

        if (uploadError) {
          console.error('Upload error', uploadError);
          toast.error('Image upload failed. Check console for details.');
          setSubmitting(false);
          return;
        }

        // Get public URL (bucket is public-read)
        const { data: publicUrlData, error: publicUrlError } = sb.storage
          .from('tool-public-images')
          .getPublicUrl(uploadData.path);

        if (publicUrlError) {
          console.error('Get public URL error', publicUrlError);
          toast.error('Failed to get uploaded image URL. Try again.');
          setSubmitting(false);
          return;
        }

        finalImageUrl = publicUrlData.publicUrl;
      }

      // Prepare new tool object
      const newTool = {
        name: values.name,
        description: values.description,
        url: values.url,
        pricing: values.pricing,
        tags: values.tags.split(',').map(t => t.trim()).filter(Boolean),
        imageUrl: finalImageUrl,
        category: 'productivity',
        featured: false,
        upvotes: 0,
        downvotes: 0,
        popularity: 0,
      };

      // Use authed client for insert (so RLS 'authenticated' insert policy allows it)
      const sb2 = await getAuthedSupabaseClient();
      const { error: insertError } = await sb2.from('tools').insert([newTool]);

      if (insertError) {
        console.error('Insert error', insertError);
        toast.error(insertError.message || 'Failed to submit tool.');
        setSubmitting(false);
        return;
      }

      toast.success('Tool submitted successfully!');
      form.reset();
      setFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      navigate('/tools');
    } catch (err: any) {
      console.error('Submit error:', err);
      // If RLS is still rejecting, show that exact message to help debug
      if (err?.message) toast.error(err.message);
      else toast.error('Unexpected error. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isSignedIn) return null;

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-2xl font-bold mb-8">Submit a New Tool</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tool Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter tool name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="What does this tool do?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tool URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pricing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pricing</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricing type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input placeholder="productivity, ai, tools (comma separated)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* File picker */}
          <FormItem>
            <FormLabel>Image (Optional)</FormLabel>
            <FormControl>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border rounded px-3 py-2 bg-background text-foreground"
              />
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
              {submitting ? 'Submitting...' : 'Submit Tool'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
