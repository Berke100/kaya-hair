/// <reference types="vite/client" />

interface Window {
  /** Site açıldı; index.html'deki yükleme güvencesi hata ekranını göstermez. */
  __khReady?: boolean;
}
