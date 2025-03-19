
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChangeTierButton } from '@/components/subscription/ChangeTierButton';

export const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    
    checkAuth();
  }, []);
  
  return <motion.header initial={{
    opacity: 0,
    y: -20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5
  }} className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 flex justify-between items-center backdrop-blur-md bg-white/80">
      <div className="flex items-center gap-2">
        <div className="bg-black size-8 rounded-full"></div>
        <span className="text-lg font-semibold tracking-tight">InmoMejora</span>
      </div>
      
      <nav className="hidden md:flex space-x-8">
        <a href="#welcome" className="text-sm font-medium hover:text-gray-600 transition-colors">Inicio</a>
        <a href="#projects" className="text-sm font-medium hover:text-gray-600 transition-colors">Proyectos</a>
        <a href="#about" className="text-sm font-medium hover:text-gray-600 transition-colors">Nosotros</a>
        <a href="#process" className="text-sm font-medium hover:text-gray-600 transition-colors">Proceso</a>
        <a href="#contact" className="text-sm font-medium hover:text-gray-600 transition-colors">Contacto</a>
      </nav>
      
      <div className="hidden md:flex gap-2">
        {isLoggedIn && <ChangeTierButton />}
        <Button 
          onClick={() => navigate(isLoggedIn ? '/' : '/auth')} 
          variant="default" 
          className="bg-black text-white hover:bg-gray-800"
        >
          {isLoggedIn ? 'Dashboard' : 'Iniciar Sesión'}
        </Button>
      </div>
      
      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button variant="ghost" className="p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
      </div>
    </motion.header>;
};
