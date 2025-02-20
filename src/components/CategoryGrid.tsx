
import { categories } from '@/lib/tools';
import { LucideIcon, MessageCircle, Image, Zap, PenTool } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  "message-circle": MessageCircle,
  "image": Image,
  "zap": Zap,
  "pen-tool": PenTool,
};

export const CategoryGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {categories.map((category) => {
        const Icon = iconMap[category.icon];
        return (
          <div key={category.id} className="glass p-6 rounded-lg hover-card cursor-pointer">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-white">{category.name}</h3>
            <p className="text-sm text-gray-400 mt-2">{category.description}</p>
          </div>
        );
      })}
    </div>
  );
};
