import type { ReactNode } from 'react';
import { ChakraProvider } from '@chakra-ui/react';

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
      {/* Chakra UI v3では、ColorModeScriptは削除され、代わりにclassNameで指定します */}
      <ChakraProvider value={system}>
        {children}
      </ChakraProvider>
    </>
  );
}
