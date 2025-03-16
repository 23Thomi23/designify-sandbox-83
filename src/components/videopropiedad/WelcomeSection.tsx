import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
export const WelcomeSection = () => {
  const navigate = useNavigate();
  return <section id="welcome" className="pt-32 pb-20 px-6 md:px-12 min-h-screen flex flex-col justify-center">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.7,
        delay: 0.2
      }} className="mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8">
            Transformamos fotos en contenido profesional para propiedades
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl">
            Crea imágenes inmobiliarias de nivel profesional sin esfuerzo. Perfecto para agentes, fotógrafos y gestores de propiedades.
          </p>
        </motion.div>
        
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.7,
        delay: 0.4
      }} className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate('/auth')} size="lg" className="bg-black text-white hover:bg-gray-800 gap-2 px-8 py-6 text-lg">
            Comenzar ahora
            <ArrowRight size={18} />
          </Button>
          <Button onClick={() => document.getElementById('process')?.scrollIntoView({
          behavior: 'smooth'
        })} variant="outline" size="lg" className="border-2 border-black text-black gap-2 px-8 py-6 text-lg bg-slate-400 hover:bg-slate-300">
            Cómo funciona
          </Button>
        </motion.div>
      </div>
      
      <motion.div initial={{
      opacity: 0,
      scale: 0.98
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      duration: 0.7,
      delay: 0.6
    }} className="mt-16 relative w-full max-w-6xl mx-auto rounded-xl overflow-hidden shadow-2xl">
        <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2553&auto=format&fit=crop" alt="Transformed property" className="w-full h-auto object-cover rounded-xl" />
      </motion.div>
    </section>;
};