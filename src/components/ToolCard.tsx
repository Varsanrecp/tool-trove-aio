
import { Tool } from '@/lib/tools';
import { useBookmark } from '@/hooks/useBookmark';
import { Bookmark, Star, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ToolCardProps {
  tool: Tool;
}

export const ToolCard = ({ tool }: ToolCardProps) => {
  const { isBookmarked, toggleBookmark } = useBookmark();
  const bookmarked = isBookmarked(tool.id);

  const getPricingColor = (pricing: Tool['pricing']) => {
    switch (pricing) {
      case 'free':
        return 'bg-green-500/20 text-green-500';
      case 'paid':
        return 'bg-blue-500/20 text-blue-500';
      case 'trial':
        return 'bg-yellow-500/20 text-yellow-500';
    }
  };

  return (
    <div className="glass rounded-lg overflow-hidden hover-card">
      <div className="relative aspect-video">
        <img
          src={tool.imageUrl}
          alt={tool.name}
          className="object-cover w-full h-full"
          loading="lazy"
        />
        <button
          onClick={() => toggleBookmark(tool)}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <Bookmark
            className={cn(
              "w-5 h-5 transition-colors",
              bookmarked ? "fill-primary text-primary" : "text-white"
            )}
          />
        </button>
        <div className="absolute top-4 left-4">
          <Badge className={cn("capitalize", getPricingColor(tool.pricing))}>
            {tool.pricing}
          </Badge>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
            <p className="text-sm text-gray-400 mt-1">{tool.description}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          {tool.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="capitalize">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-400">{tool.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-400">{tool.popularity}</span>
          </div>
        </div>
        <div className="mt-4">
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 py-2 hover:opacity-90 transition-opacity"
          >
            Visit Tool
          </a>
        </div>
      </div>
    </div>
  );
};
