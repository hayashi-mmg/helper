import { Meta, StoryObj } from '@storybook/react';
import { RequestFilterPanel } from '../components/request/RequestFilterPanel';
import { RequestStatus, RequestType } from '../types';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof RequestFilterPanel> = {
  component: RequestFilterPanel,
  title: 'フィーチャー/ユーザー/リクエスト/フィルターパネル',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof RequestFilterPanel>;

// アクションハンドラー
const handlers = {
  onFilterChange: action('filter-changed'),
};

// デフォルトストーリー（空のフィルター）
export const Default: Story = {
  args: {
    initialFilter: {},
    isLoading: false,
    ...handlers,
  },
};

// 事前に設定されたフィルター
export const WithPresetFilter: Story = {
  args: {
    initialFilter: {
      status: RequestStatus.INPROGRESS,
      type: RequestType.COOKING,
      startDate: '2025-05-01',
      endDate: '2025-05-31',
    },
    isLoading: false,
    ...handlers,
  },
};

// ステータスのみフィルター
export const StatusOnlyFilter: Story = {
  args: {
    initialFilter: {
      status: RequestStatus.COMPLETED,
    },
    isLoading: false,
    ...handlers,
  },
};

// タイプのみフィルター
export const TypeOnlyFilter: Story = {
  args: {
    initialFilter: {
      type: RequestType.ERRAND,
    },
    isLoading: false,
    ...handlers,
  },
};

// 日付範囲のみフィルター
export const DateRangeOnlyFilter: Story = {
  args: {
    initialFilter: {
      startDate: '2025-04-01',
      endDate: '2025-04-30',
    },
    isLoading: false,
    ...handlers,
  },
};

// ローディング状態
export const Loading: Story = {
  args: {
    initialFilter: {},
    isLoading: true,
    ...handlers,
  },
};
