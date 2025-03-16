import { motion } from 'framer-motion';
const projects = [{
  id: 1,
  title: 'Mansión de lujo en Málaga',
  image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3',
  description: 'Transformación completa de imágenes para una propiedad de lujo con vistas al mar.'
}, {
  id: 2,
  title: 'Apartamento moderno en Madrid',
  image: 'https://images.unsplash.com/photo-1600607687644-c7171b62ccd2',
  description: 'Actualización de fotos para un apartamento céntrico con diseño minimalista.'
}, {
  id: 3,
  title: 'Villa con jardín en Sevilla',
  image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
  description: 'Mejora visual del espacio exterior e interior para una villa familiar.'
}, {
  id: 4,
  title: 'Casa adosada en Barcelona',
  image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea',
  description: 'Optimización de imágenes para resaltar los espacios y características de la vivienda.'
}];
export const ProjectsSection = () => {
  return <section id="projects" className="py-20 px-6 md:px-12 bg-gray-50">
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestros Proyectos</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Transformamos las fotos de propiedades en espacios extraordinarios en segundos.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => <motion.div key={project.id} initial={{
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
        }} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="h-64 overflow-hidden">
                <img src={`${project.image}?q=80&w=1200&auto=format&fit=crop`} alt={project.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-600">{project.description}</p>
              </div>
            </motion.div>)}
        </div>
      </div>
    </section>;
};