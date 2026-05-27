/**
 * Declaraciones de tipos para archivos de imagen.
 * Permite importar imágenes en TypeScript sin errores.
 */

declare module '*.png' {
  const value: ImageRequireSource;
  export default value;
}

declare module '*.jpg' {
  const value: ImageRequireSource;
  export default value;
}

declare module '*.jpeg' {
  const value: ImageRequireSource;
  export default value;
}

declare module '*.gif' {
  const value: ImageRequireSource;
  export default value;
}

declare module '*.svg' {
  const value: ImageRequireSource;
  export default value;
}

declare module '*.webp' {
  const value: ImageRequireSource;
  export default value;
}