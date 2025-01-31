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
            "relative group overflow-hidden rounded-lg transition-all duration-200",
            "border-2 hover:border-primary focus:border-primary focus:outline-none",
            selectedStyle === style.id ? "border-primary" : "border-transparent"
          )}
        >
          <img
            src={style.preview}
            alt={style.name}
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <h3 className="text-sm font-medium text-white">{style.name}</h3>
            <p className="text-xs text-white/80">{style.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};