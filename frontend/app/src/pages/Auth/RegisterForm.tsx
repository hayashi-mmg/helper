import { useState } from 'react';
import { Button, FormControl, FormLabel, Input, FormErrorMessage, VStack, Text, Link, Flex } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuth';
import { getAuthErrorMessage } from '../../utils/errorHandler';
import { useState } from 'react';

/**
 * 新規登録フォームコンポーネント
 * ユーザーの新規アカウント登録処理を提供する
 *
 * @returns {JSX.Element} 新規登録フォームのUI
 */
const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const { register, loading: isLoading } = useAuthStore();
  const navigate = useNavigate();

  // 各入力のエラーチェック
  const isNameError = name === '';
  const isEmailError = email === '';
  const isPasswordError = password === '';
  const isConfirmPasswordError = confirmPassword === '' || password !== confirmPassword;
  /**
   * フォーム送信時の処理
   * @param {React.FormEvent} e フォームイベント
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // エラーチェック - より具体的なエラーメッセージを表示
    if (isNameError) {
      setError('お名前を入力してください');
      return;
    }
    
    if (isEmailError) {
      setError('メールアドレスを入力してください');
      return;
    } else if (!email.match(/\S+@\S+\.\S+/)) {
      setError('有効なメールアドレスの形式で入力してください');
      return;
    }
    
    if (isPasswordError) {
      setError('パスワードを入力してください');
      return;
    } else if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    } else if (!/(?=.*[a-z])(?=.*[A-Z]|.*[0-9])/.test(password)) {
      setError('パスワードには少なくとも英小文字と数字または大文字を含めてください');
      return;
    }
    
    if (isConfirmPasswordError) {
      setError(confirmPassword === '' ? 'パスワード（確認）を入力してください' : 'パスワードが一致しません');
      return;
    }

    setError('');

    try {
      // ユーザー名をメールアドレスから自動生成（@ より前の部分を使用）
      const username = email.split('@')[0];
      
      // APIを呼び出して登録
      await register(username, email, password);
      
      // 登録成功時にダッシュボードへリダイレクト
      navigate('/dashboard');
    } catch (error) {
      console.error('登録エラー:', error);
        // エラーハンドラーを使用して適切なエラーメッセージを表示
      setError(getAuthErrorMessage(error, 'register'));
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

        <FormControl isInvalid={isNameError}>
          <FormLabel htmlFor="name">お名前</FormLabel>
          <Input
            id="name"
            placeholder="山田 太郎"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {isNameError && <FormErrorMessage>お名前が必要です</FormErrorMessage>}
        </FormControl>

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

        <FormControl isInvalid={isConfirmPasswordError}>
          <FormLabel htmlFor="confirmPassword">パスワード（確認）</FormLabel>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {isConfirmPasswordError && (
            <FormErrorMessage>
              {confirmPassword === '' ? 'パスワード（確認）が必要です' : 'パスワードが一致しません'}
            </FormErrorMessage>
          )}
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          width="100%"
          mt={4}
          isLoading={isLoading}
          loadingText="登録中..."
        >
          登録する
        </Button>

        <Flex justifyContent="center" mt={2} fontSize="sm">
          <Text>既にアカウントをお持ちですか？ </Text>
          <Link as={RouterLink} to="/login" color="blue.500" ml={1}>
            ログインはこちら
          </Link>
        </Flex>
      </VStack>
    </form>
  );
};

export default RegisterForm;
