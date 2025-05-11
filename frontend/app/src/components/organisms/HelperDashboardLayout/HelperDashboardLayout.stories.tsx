import { Meta, StoryObj } from '@storybook/react';
import { HelperDashboardLayout } from './HelperDashboardLayout';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof HelperDashboardLayout> = {
  title: 'Organisms/HelperDashboardLayout',
  component: HelperDashboardLayout,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HelperDashboardLayout>;

export const Default: Story = {
  args: {
    title: 'ダッシュボード',
    children: (
      <div>
        <h1>ヘルパーダッシュボードコンテンツ</h1>
        <p>このエリアに各ページのコンテンツが表示されます。</p>
      </div>
    ),
  },
};

export const WithCustomTitle: Story = {
  args: {
    title: 'カスタムタイトル',
    children: (
      <div>
        <h1>カスタムタイトル付きダッシュボード</h1>
        <p>タイトルをカスタマイズしたダッシュボードのサンプルです。</p>
      </div>
    ),
  },
};
