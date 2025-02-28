
import { Tool } from '@/lib/tools';
import { useBookmark } from '@/hooks/useBookmark';
import { Bookmark, Star, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

interface ToolCardProps {
  tool: Tool;
}

export const ToolCard = ({ tool }: ToolCardProps) => {
  const { isBookmarked, toggleBookmark } = useBookmark();
  const bookmarked = isBookmarked(tool.id);
  const { isSignedIn } = useUser();
  const [localRating, setLocalRating] = useState(tool.rating);
  const [localRatingCount, setLocalRatingCount] = useState(tool.ratingCount);

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

  const handleRating = (rating: number) => {
    if (!isSignedIn) {
      toast.error("Please sign in to rate tools");
      return;
    }

    setLocalRating(rating);
    setLocalRatingCount(prev => prev + 1);
    toast.success("Thank you for rating!");
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            className="focus:outline-none"
          >
            <Star
              className={cn(
                "w-5 h-5 transition-colors",
                star <= localRating
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-gray-300"
              )}
            />
          </button>
        ))}
      </div>
    );
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
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            {renderStars()}
            <span className="text-sm text-gray-400">({localRatingCount})</span>
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
