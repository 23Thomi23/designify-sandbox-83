
export const HowItWorksSection = () => {
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">1</div>
          <h3 className="text-xl font-bold">Upload Your Photo</h3>
          <p className="text-muted-foreground">Select any property photo you want to enhance</p>
        </div>
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">2</div>
          <h3 className="text-xl font-bold">Choose Your Style</h3>
          <p className="text-muted-foreground">Select from various professional design styles</p>
        </div>
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">3</div>
          <h3 className="text-xl font-bold">Get Results</h3>
          <p className="text-muted-foreground">Download your professionally enhanced image</p>
        </div>
      </div>
    </div>
  );
};
