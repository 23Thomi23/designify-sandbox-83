
import { StyleSelector, Style } from '../StyleSelector';

interface StyleSectionProps {
  styles: Style[];
  selectedStyle: string;
  onStyleSelect: (styleId: string) => void;
}

export const StyleSection = ({ styles, selectedStyle, onStyleSelect }: StyleSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Select Style</h2>
      <StyleSelector
        styles={styles}
        selectedStyle={selectedStyle}
        onStyleSelect={onStyleSelect}
      />
    </div>
  );
};
