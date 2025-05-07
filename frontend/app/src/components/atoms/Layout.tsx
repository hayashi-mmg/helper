import React from 'react';
import { Box, Flex } from '@chakra-ui/react';

interface LayoutProps {
    children: React.ReactNode;
    direction?: 'row' | 'column';
    spacing?: number;
}

const Layout: React.FC<LayoutProps> = ({ children, direction = 'row', spacing = 4 }) => {
    return (
        <Flex direction={direction} gap={spacing}>
            {children}
        </Flex>
    );
};

export default Layout;