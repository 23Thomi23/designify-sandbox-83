
interface PlanDisplayProps {
  plan: {
    name: string;
    price: number;
    description: string;
    included_images: number;
  };
}

const PlanDisplay = ({ plan }: PlanDisplayProps) => {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
      <div className="text-2xl font-bold mb-2">${plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
      <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
      <ul className="space-y-2">
        <li className="flex items-center text-sm">
          <span className="mr-2">✓</span>
          <span>{plan.included_images} images per month</span>
        </li>
        <li className="flex items-center text-sm">
          <span className="mr-2">✓</span>
          <span>High-quality AI transformations</span>
        </li>
        <li className="flex items-center text-sm">
          <span className="mr-2">✓</span>
          <span>Cancel anytime</span>
        </li>
      </ul>
    </div>
  );
};

export default PlanDisplay;
