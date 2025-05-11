import { Button, FormControl, FormLabel, Input, FormErrorMessage, VStack, Link, Text, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../hooks/useAuth';
import { getAuthErrorMessage } from '../../utils/errorHandler';
import { useState } from 'react';

/**
 * ログインフォームコンポーネント
 * ユーザーのログイン処理を提供する
 *
 * @returns {JSX.Element} ログインフォームのUI
 */
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading: isLoading } = useAuthStore();
  const navigate = useNavigate();

  // メールアドレスの入力エラーチェック
  const isEmailError = email === '';
  // パスワードの入力エラーチェック
  const isPasswordError = password === '';

  /**
   * フォーム送信時の処理
   * @param {React.FormEvent} e フォームイベント
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーションチェック
    let hasError = false;
    if (isEmailError) {
      setError('メールアドレスを入力してください');
      hasError = true;
    } else if (!email.match(/\S+@\S+\.\S+/)) {
      setError('有効なメールアドレスの形式で入力してください');
      hasError = true;
    } else if (isPasswordError) {
      setError('パスワードを入力してください');
      hasError = true;
    }
    
    if (hasError) return;

    setError('');

    try {
      // 実際のAPIを呼び出してログイン
      await login(email, password);
      
      // ログイン成功時にダッシュボードへリダイレクト
      navigate('/dashboard');
    } catch (error) {
      console.error('ログインエラー:', error);
      // エラーハンドラーを使用して適切なエラーメッセージを表示
      setError(getAuthErrorMessage(error, 'login'));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        {error && (
          <Text color="red.500" textAlign="center">
            {error}
          </Text>
        )}

        <FormControl isInvalid={isEmailError}>
          <FormLabel htmlFor="email">メールアドレス</FormLabel>
          <Input
            id="email"
            type="email"
            placeholder="your@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {isEmailError && <FormErrorMessage>メールアドレスが必要です</FormErrorMessage>}
        </FormControl>

        <FormControl isInvalid={isPasswordError}>
          <FormLabel htmlFor="password">パスワード</FormLabel>
          <Input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isPasswordError && <FormErrorMessage>パスワードが必要です</FormErrorMessage>}
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          width="100%"
          mt={4}
          isLoading={isLoading}
          loadingText="ログイン中..."
        >
          ログイン
        </Button>

        <Flex justifyContent="space-between" mt={2} fontSize="sm">
          <Link as={RouterLink} to="/forgot-password" color="blue.500">
            パスワードをお忘れですか？
          </Link>
          <Link as={RouterLink} to="/register" color="blue.500">
            新規登録はこちら
          </Link>
        </Flex>
      </VStack>
    </form>
  );
};

export default LoginForm;
