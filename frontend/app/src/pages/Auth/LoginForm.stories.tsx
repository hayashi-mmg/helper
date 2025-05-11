import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from './LoginForm';

/**
 * ログインフォームコンポーネントのメタ情報
 */
const meta = {
  title: 'Pages/Auth/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div style={{ width: '400px' }}>
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト状態のログインフォーム
 */
export const Default: Story = {};

/**
 * ローディング状態のログインフォーム
 */
export const Loading: Story = {
  parameters: {
    mockData: [
      {
        // useAuthStore のモック
        hook: 'useAuthStore',
        override: () => ({
          login: async () => new Promise(resolve => setTimeout(resolve, 10000)),
          loading: true,
        }),
      },
    ],
  },
};

/**
 * エラー状態のログインフォーム
 */
export const WithError: Story = {
  parameters: {
    mockData: [
      {
        // useAuthStore のモック
        hook: 'useAuthStore',
        override: () => ({
          login: async () => {
            throw new Error('メールアドレスまたはパスワードが正しくありません');
          },
          loading: false,
        }),
      },
    ],
  },
};
