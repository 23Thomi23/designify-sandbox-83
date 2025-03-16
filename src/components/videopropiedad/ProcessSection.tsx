import { motion } from 'framer-motion';
const steps = [{
  number: '01',
  title: 'Sube tu foto',
  description: 'Selecciona cualquier imagen de propiedad que desees mejorar'
}, {
  number: '02',
  title: 'Elige el estilo',
  description: 'Selecciona entre más de 50 estilos profesionales de diseño'
}, {
  number: '03',
  title: 'Especifica el tipo de habitación',
  description: 'Elije entre cocina, salón, dormitorio, baño y más'
}, {
  number: '04',
  title: 'Obtén resultados',
  description: 'Descarga tu imagen mejorada profesionalmente'
}];
export const ProcessSection = () => {
  return <section id="process" className="py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.7
      }} className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-center md:text-5xl">Transformar tus imágenes nunca ha sido tan fácil. 

Solo 4 pasos simples.</h2>
          
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => <motion.div key={step.number} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: index * 0.1
        }} className="relative">
              <div className="bg-gray-50 rounded-xl p-8 h-full">
                <div className="text-5xl font-bold text-black/10 mb-4">{step.number}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 5L19 12L12 19" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>}
            </motion.div>)}
        </div>
      </div>
    </section>;
};