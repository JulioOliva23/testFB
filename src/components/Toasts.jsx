import { AnimatePresence, motion } from 'framer-motion';
import { IconAlert, IconCheck } from './Icons';

export default function Toasts({ toasts }) {
  return (
    <div className="toasts">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            className={`toast toast--${t.tipo}`}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {t.tipo === 'error' ? <IconAlert /> : <IconCheck />}
            <span>{t.mensaje}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
