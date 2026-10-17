import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

// Cuenta desde el valor anterior hasta el nuevo cada vez que cambia
export default function AnimatedNumber({ value, format }) {
  const ref = useRef(null);
  const prev = useRef(0);

  useEffect(() => {
    const controls = animate(prev.current, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { if (ref.current) ref.current.textContent = format(v); },
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, format]);

  return <span ref={ref}>{format(0)}</span>;
}
