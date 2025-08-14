import { Tool } from '@/lib/tools';
import { useBookmark } from '@/hooks/useBookmark';
import { Bookmark, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

interface ToolCardProps {
  tool: Tool;
  isBookmarked: boolean;
  toggleBookmark: () => void;
}

export const ToolCard = ({ tool, isBookmarked, toggleBookmark }: ToolCardProps) => {
  const { toggleVote, hasVoted, getUserVote, getToolVotes } = useBookmark();
  const toolVotes = getToolVotes(tool.id);
  const userVote = getUserVote(tool.id);

  const handleVote = (voteType: 'up' | 'down') => {
    toggleVote(tool.id, voteType);
  };

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
          onClick={toggleBookmark}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <Bookmark
            className={cn(
              "w-5 h-5 transition-colors",
              isBookmarked ? "fill-primary text-primary" : "text-white"
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
            <button
              onClick={() => handleVote('up')}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full transition-colors",
                userVote === 'up' ? "bg-green-500/20" : "hover:bg-gray-700/20"
              )}
            >
              <ThumbsUp className={cn(
                "w-4 h-4",
                userVote === 'up' ? "text-green-500" : "text-gray-400"
              )} />
              <span className="text-sm text-gray-400">{toolVotes.upvotes}</span>
            </button>
            <button
              onClick={() => handleVote('down')}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full transition-colors",
                userVote === 'down' ? "bg-red-500/20" : "hover:bg-gray-700/20"
              )}
            >
              <ThumbsDown className={cn(
                "w-4 h-4",
                userVote === 'down' ? "text-red-500" : "text-gray-400"
              )} />
              <span className="text-sm text-gray-400">{toolVotes.downvotes}</span>
            </button>
          </div>
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
