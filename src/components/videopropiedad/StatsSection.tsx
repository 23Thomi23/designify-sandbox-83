import { motion } from 'framer-motion';
const stats = [{
  label: 'Tiempo ahorrado',
  value: '90%'
}, {
  label: 'Clientes satisfechos',
  value: '45+'
}, {
  label: 'Videos creados',
  value: '50+'
}, {
  label: 'Imágenes mejoradas',
  value: '98'
}];
export const StatsSection = () => {
  return <section className="py-20 px-6 md:px-12 text-white bg-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => <motion.div key={stat.label} initial={{
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
        }} className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
              <p className="text-gray-400">{stat.label}</p>
            </motion.div>)}
        </div>
      </div>
    </section>;
};