import { Meta, StoryObj } from '@storybook/react';
import { RequestForm } from '../components/request/RequestForm';
import { RequestType } from '../types';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof RequestForm> = {
  component: RequestForm,
  title: 'フィーチャー/ユーザー/リクエスト/リクエストフォーム',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof RequestForm>;

// アクションハンドラー
const handleSubmit = action('form-submitted');

// 子要素のサンプル
const SampleChildContent = () => (
  <div style={{ padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
    <p>これはリクエスト固有の追加フォーム要素です</p>
  </div>
);

// デフォルトストーリー
export const Default: Story = {
  args: {
    onSubmit: handleSubmit,
    isLoading: false,
    submitLabel: '送信',
  },
};

// 初期データ付き
export const WithInitialData: Story = {
  args: {
    initialData: {
      title: 'テストリクエスト',
      description: 'これはテスト用のリクエスト説明文です。詳細な情報を提供します。',
      type: RequestType.COOKING,
      scheduledDate: '2025-05-15',
      estimatedDuration: 90,
    },
    onSubmit: handleSubmit,
    isLoading: false,
    submitLabel: '送信',
  },
};

// 子要素付き
export const WithChildren: Story = {
  args: {
    onSubmit: handleSubmit,
    isLoading: false,
    submitLabel: '送信',
    children: <SampleChildContent />,
  },
};

// カスタムボタンラベル
export const WithCustomButton: Story = {
  args: {
    onSubmit: handleSubmit,
    isLoading: false,
    submitLabel: '依頼を作成',
  },
};

// ローディング状態
export const Loading: Story = {
  args: {
    onSubmit: handleSubmit,
    isLoading: true,
    submitLabel: '送信',
  },
};
