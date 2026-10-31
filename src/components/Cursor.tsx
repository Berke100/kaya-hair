import { useEffect } from 'react';

/**
 * Saç kesim makinesi imlecini açar (stiller index.css içinde).
 * Yalnızca fare kullanılan cihazlarda; dokunmatik ekranlarda sistem
 * davranışı aynen kalır. Tıklama noktası makinenin bıçak ucudur.
 */
export default function Cursor() {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine) and (hover: hover)').matches) return;
    const root = document.documentElement;
    root.classList.add('clipper-cursor');
    return () => root.classList.remove('clipper-cursor');
  }, []);
  return null;
}
