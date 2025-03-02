
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useUser } from '@clerk/clerk-react';
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
import { tools } from '@/lib/tools';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Tool name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  pricing: z.enum(["free", "paid", "trial"]),
  tags: z.string().min(2, {
    message: "Please add at least one tag.",
  }),
  imageUrl: z.string().optional(),
});

export default function SubmitTool() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      url: "",
      pricing: "free",
      tags: "",
      imageUrl: "",
    },
  });

  React.useEffect(() => {
    if (!isSignedIn) {
      toast.error("Please sign in to submit a tool", {
        action: {
          label: "Sign In",
          onClick: () => document.querySelector<HTMLButtonElement>('[data-clerk-trigger]')?.click(),
        },
      });
      navigate('/');
    }
  }, [isSignedIn, navigate]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const placeholderImages = [
      'photo-1488590528505-98d2b5aba04b',
      'photo-1486312338219-ce68d2c6f44d',
      'photo-1531297484001-80022131f5a1',
      'photo-1498050108023-c5249f4df085',
      'photo-1483058712412-4245e9b90334',
    ];

    const newTool = {
      id: (tools.length + 1).toString(),
      name: values.name,
      description: values.description,
      url: values.url,
      pricing: values.pricing as "free" | "paid" | "trial",
      tags: values.tags.split(',').map(tag => tag.trim()),
      imageUrl: values.imageUrl || `https://images.unsplash.com/${placeholderImages[Math.floor(Math.random() * placeholderImages.length)]}`,
      category: "productivity",
      featured: false,
      upvotes: 0,
      downvotes: 0,
      popularity: 0,
    };

    tools.push(newTool);
    toast.success("Tool submitted successfully!");
    navigate('/tools');
  }

  if (!isSignedIn) {
    return null;
  }

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

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit Tool</Button>
        </form>
      </Form>
    </div>
  );
}
