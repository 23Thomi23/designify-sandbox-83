import { motion } from 'framer-motion';
import { CheckCircle, Clock, DollarSign, Image } from 'lucide-react';
export const AboutUsSection = () => {
  return <section id="about" className="py-20 px-6 md:px-12 bg-gray-50">
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Sobre Nosotros</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Transformar tus imágenes, para que tu inmobiliaria destaque en el mercado y capten la atención de potenciales compradores.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{
          opacity: 0,
          x: -20
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.7
        }} className="space-y-8">
            <h3 className="text-2xl font-bold">Potenciamos tus propiedades con imágenes impactantes</h3>
            <p className="text-gray-600">
              En VideoPropiedad, entendemos que las imágenes de calidad son cruciales para destacar en el mercado inmobiliario. 
              Nuestra tecnología de IA permite transformar fotografías ordinarias en representaciones visuales extraordinarias 
              que capturan la esencia y el potencial de cada propiedad.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-1" size={20} />
                <p>Mejoramos la apariencia visual en un 96%</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-1" size={20} />
                <p>Te ahorramos un 85% de tiempo</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-1" size={20} />
                <p>Ahorramos horas de edición</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-1" size={20} />
                <p>Aumentamos las solicitudes de visitas en un 78%</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div initial={{
          opacity: 0,
          x: 20
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.7
        }}>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 inline-block mb-4">
                  <Image size={24} />
                </div>
                <h4 className="text-xl font-bold mb-2">Calidad profesional</h4>
                <p className="text-gray-600">Resultados de nivel profesional sin necesidad de equipos costosos</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="bg-purple-100 p-3 rounded-full text-purple-600 inline-block mb-4">
                  <Clock size={24} />
                </div>
                <h4 className="text-xl font-bold mb-2">Ahorro de tiempo</h4>
                <p className="text-gray-600">Obtén resultados en segundos, no en días</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="bg-green-100 p-3 rounded-full text-green-600 inline-block mb-4">
                  <DollarSign size={24} />
                </div>
                <h4 className="text-xl font-bold mb-2">Rentable</h4>
                <p className="text-gray-600">Fracción del costo de la fotografía profesional</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="bg-orange-100 p-3 rounded-full text-orange-600 inline-block mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-2">Fácil de usar</h4>
                <p className="text-gray-600">Sin conocimientos técnicos necesarios</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
};