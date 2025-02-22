
import { categories } from '@/lib/tools';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export const CategoryFilter = ({
  selectedCategories,
  onChange,
}: CategoryFilterProps) => {
  const toggleCategory = (categoryId: string) => {
    onChange(
      selectedCategories.includes(categoryId)
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => toggleCategory(category.id)}
          className={cn(
            "px-4 py-2 rounded-full transition-colors",
            selectedCategories.includes(category.id)
              ? "bg-primary text-primary-foreground"
              : "glass hover:bg-primary/20"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
