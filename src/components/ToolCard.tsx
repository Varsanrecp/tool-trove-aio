// src/components/ToolCard.tsx
import React, { useState } from 'react';
import { Tool } from '@/lib/tools';
import { useBookmark } from '@/hooks/useBookmark';
import { Bookmark, ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

interface ToolCardProps {
  tool: Tool & { user_id?: string | null };
  isBookmarked: boolean;
  toggleBookmark: () => void;
  onEdit?: () => void; // keep edit
  // delete intentionally removed per your request
}

export const ToolCard = ({ tool, isBookmarked, toggleBookmark, onEdit }: ToolCardProps) => {
  const { toggleVote, getUserVote, getToolVotes } = useBookmark();
  const toolVotes = getToolVotes(tool.id);
  const userVote = getUserVote(tool.id);
  const { user } = useUser();

  const [manageOpen, setManageOpen] = useState(false);

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
      default:
        return '';
    }
  };

  const isOwner = !!user?.id && !!tool.user_id && user.id === tool.user_id;

  return (
    <div className="glass rounded-lg overflow-hidden hover-card relative flex flex-col">
      {/* image area */}
      <div className="relative w-full">
        <div className="w-full aspect-[16/9] bg-muted overflow-hidden">
          <img
            src={tool.imageUrl}
            alt={tool.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* bookmark */}
        <button
          onClick={toggleBookmark}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
          aria-label="Toggle bookmark"
        >
          <Bookmark
            className={cn(
              "w-5 h-5 transition-colors",
              isBookmarked ? "fill-primary text-primary" : "text-white"
            )}
          />
        </button>

        {/* manage (owner only) */}
        {isOwner && (
          <button
            onClick={() => setManageOpen(true)}
            className="absolute top-3 right-12 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
            aria-label="Manage tool"
            title="Manage (edit)"
          >
            <MoreHorizontal className="w-5 h-5 text-white" />
          </button>
        )}

        {/* pricing badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className={cn("capitalize", getPricingColor(tool.pricing))}>
            {tool.pricing}
          </Badge>
        </div>
      </div>

      {/* content */}
      <div className="p-4 flex-1 flex flex-col">
        <div>
          <h3 className="text-lg font-semibold text-white leading-snug">{tool.name}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{tool.description}</p>
        </div>

        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {Array.isArray(tool.tags) && tool.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="capitalize">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote('up')}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors",
                userVote === 'up' ? "bg-green-500/20" : "hover:bg-gray-700/10"
              )}
            >
              <ThumbsUp className={cn("w-4 h-4", userVote === 'up' ? "text-green-500" : "text-gray-400")} />
              <span className="text-sm text-muted-foreground">{toolVotes.upvotes}</span>
            </button>

            <button
              onClick={() => handleVote('down')}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors",
                userVote === 'down' ? "bg-red-500/20" : "hover:bg-gray-700/10"
              )}
            >
              <ThumbsDown className={cn("w-4 h-4", userVote === 'down' ? "text-red-500" : "text-gray-400")} />
              <span className="text-sm text-muted-foreground">{toolVotes.downvotes}</span>
            </button>
          </div>

          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-3 py-2 hover:opacity-90 transition-opacity"
          >
            Visit Tool
          </a>
        </div>
      </div>

      {/* manage modal (edit only) */}
      {manageOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setManageOpen(false)} />
          <div className="bg-card border border-border rounded-lg p-6 z-50 w-full max-w-sm">
            <h4 className="text-lg font-semibold mb-3">Manage tool</h4>
            <p className="text-sm text-muted-foreground mb-4">Edit this tool.</p>
            <div className="flex gap-3 justify-end">
              {onEdit && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setManageOpen(false);
                    onEdit();
                  }}
                >
                  Edit
                </Button>
              )}
              <Button variant="ghost" onClick={() => setManageOpen(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
