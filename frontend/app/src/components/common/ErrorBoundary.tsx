import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // エラーが発生した場合、次のレンダリングでエラーUIを表示する
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // エラー情報をログに記録
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render() {
    const { hasError, error, errorInfo } = this.state;

    if (hasError) {
      // エラーUIの表示
      return (
        <Box p={8} maxW="md" mx="auto" mt={20}>
          <VStack spacing={4} align="center">
            <Heading size="md" color="red.500">
              エラーが発生しました
            </Heading>
            <Text textAlign="center" color="gray.600">
              申し訳ありません。予期しないエラーが発生しました。
            </Text>
            {import.meta.env.DEV && error && (
              <Box as="pre" p={4} bg="gray.100" rounded="md" fontSize="sm" overflow="auto" width="100%">
                {error.toString()}
                {errorInfo && errorInfo.componentStack}
              </Box>
            )}
            <Button onClick={this.handleReload} colorScheme="blue">
              ページをリロード
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
