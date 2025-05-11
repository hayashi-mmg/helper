import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm';

/**
 * 新規登録フォームコンポーネントのメタ情報
 */
const meta = {
  title: 'Pages/Auth/RegisterForm',
  component: RegisterForm,
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
} satisfies Meta<typeof RegisterForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト状態の新規登録フォーム
 */
export const Default: Story = {};

/**
 * ローディング状態の新規登録フォーム
 */
export const Loading: Story = {
  parameters: {
    mockData: [
      {
        // useAuthStore のモック
        hook: 'useAuthStore',
        override: () => ({
          register: async () => new Promise(resolve => setTimeout(resolve, 10000)),
          loading: true,
        }),
      },
    ],
  },
};

/**
 * エラー状態の新規登録フォーム
 */
export const WithError: Story = {
  parameters: {
    mockData: [
      {
        // useAuthStore のモック
        hook: 'useAuthStore',
        override: () => ({
          register: async () => {
            throw new Error('このメールアドレスは既に登録されています');
          },
          loading: false,
        }),
      },
    ],
  },
};

/**
 * パスワード不一致エラー状態の新規登録フォーム
 */
export const WithPasswordMismatch: Story = {
  parameters: {
    mockData: [
      {
        // initialState のモック
        state: 'initialState',
        override: {
          password: 'Password123',
          confirmPassword: 'Password456',
        },
      },
    ],
  },
};
