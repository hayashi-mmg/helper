import type { ReactNode } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { ColorModeScript } from '@chakra-ui/color-mode';

import { system } from '../styles/theme';

interface ChakraProviderProps {
  children: ReactNode;
}

/**
 * Chakra UIの設定を提供するプロバイダーコンポーネント
 * テーマとカラーモードの設定を管理する
 */
export function CustomChakraProvider({ children }: ChakraProviderProps) {
  return (
    <>
      <ColorModeScript initialColorMode="light" />
      <ChakraProvider value={system}>
        {children}
      </ChakraProvider>
    </>
  );
}
