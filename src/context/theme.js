import { createContext, useContext } from 'react'

export const ThemeCtx = createContext()
export const useTheme = () => useContext(ThemeCtx)
