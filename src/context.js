import { createContext } from 'react';

export const GlobalContext = createContext({
  lang: 'en-US',
  setLang: () => {},
  theme: '',
  setTheme: () => {}
});
