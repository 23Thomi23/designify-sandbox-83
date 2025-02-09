
import { cn } from '@/lib/utils';

export interface Style {
  id: string;
  name: string;
  description: string;
  preview: string;
}

interface StyleSelectorProps {
  styles: Style[];
  selectedStyle: string;
  onStyleSelect: (styleId: string) => void;
  className?: string;
}

export const StyleSelector = ({
  styles,
  selectedStyle,
  onStyleSelect,
  className,
}: StyleSelectorProps) => {
  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      {styles.map((style) => (
        <button
          key={style.id}
          onClick={() => onStyleSelect(style.id)}
          className={cn(
            "relative group overflow-hidden rounded-xl transition-all duration-200",
            "bg-card border shadow-sm hover:shadow-md",
            "hover:border-primary/50 focus:border-primary focus:outline-none",
            selectedStyle === style.id ? "ring-2 ring-primary ring-offset-2" : "border-border/50"
          )}
        >
          <img
            src={style.preview}
            alt={style.name}
            className="w-full h-32 object-cover brightness-[0.9] group-hover:brightness-100 transition-all"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end">
            <h3 className="text-sm font-medium text-white">{style.name}</h3>
            <p className="text-xs text-white/80 mt-1">{style.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};
