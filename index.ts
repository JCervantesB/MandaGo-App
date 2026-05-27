import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';

/**
 * Registra el componente raíz de la app para que Expo pueda arrancarla.
 * Este archivo se mantiene minimalista: toda la lógica de UI vive en App.tsx.
 */
registerRootComponent(App);
