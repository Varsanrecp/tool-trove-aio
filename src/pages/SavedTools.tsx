
import { ToolCard } from '@/components/ToolCard';
import { useBookmark } from '@/hooks/useBookmark';
import { tools } from '@/lib/tools';

const SavedTools = () => {
  const { bookmarks } = useBookmark();
  const savedTools = tools.filter(tool => bookmarks.includes(tool.id));

  if (savedTools.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-3xl font-bold">No Saved Tools</h1>
          <p className="text-muted-foreground max-w-md">
            You haven't saved any tools yet. Browse our collection and click the bookmark icon to save your favorite tools.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 py-2 hover:opacity-90 transition-opacity"
          >
            Browse Tools
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Saved Tools</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedTools;
