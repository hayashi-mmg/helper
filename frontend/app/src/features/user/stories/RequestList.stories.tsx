import { Meta, StoryObj } from '@storybook/react';
import { RequestList } from '../components/request/RequestList';
import { mockRequestArray } from '../../test-utils/test-data';
import { RequestStatus, RequestType } from '../types';
import { action } from '@storybook/addon-actions';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof RequestList> = {
  component: RequestList,
  title: 'フィーチャー/ユーザー/リクエスト/リクエスト一覧',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
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
type Story = StoryObj<typeof RequestList>;

// アクションハンドラー
const handlers = {
  onPageChange: action('page-changed'),
  onFilterChange: action('filter-changed'),
  onViewRequest: action('view-request'),
  onEditRequest: action('edit-request'),
  onDeleteRequest: action('delete-request'),
};

// デフォルトストーリー
export const Default: Story = {
  args: {
    requests: mockRequestArray(5),
    isLoading: false,
    totalItems: 5,
    page: 1,
    totalPages: 1,
    limit: 10,
    ...handlers,
  },
};

// ローディング状態
export const Loading: Story = {
  args: {
    requests: [],
    isLoading: true,
    ...handlers,
  },
};

// データなし
export const NoData: Story = {
  args: {
    requests: [],
    isLoading: false,
    totalItems: 0,
    page: 1,
    totalPages: 0,
    ...handlers,
  },
};

// ページネーション付き
export const WithPagination: Story = {
  args: {
    requests: mockRequestArray(10),
    isLoading: false,
    totalItems: 25,
    page: 2,
    totalPages: 3,
    limit: 10,
    ...handlers,
  },
};

// フィルタリング状態
export const WithActiveFilter: Story = {
  args: {
    requests: mockRequestArray(3).map(r => ({ ...r, status: RequestStatus.INPROGRESS })),
    isLoading: false,
    totalItems: 3,
    page: 1,
    totalPages: 1,
    filter: { status: RequestStatus.INPROGRESS },
    ...handlers,
  },
};

// さまざまなステータスを含む
export const MixedStatuses: Story = {
  args: {
    requests: [
      ...mockRequestArray(1).map(r => ({ ...r, status: RequestStatus.PENDING })),
      ...mockRequestArray(1).map(r => ({ ...r, status: RequestStatus.ACCEPTED })),
      ...mockRequestArray(1).map(r => ({ ...r, status: RequestStatus.INPROGRESS })),
      ...mockRequestArray(1).map(r => ({ ...r, status: RequestStatus.COMPLETED })),
      ...mockRequestArray(1).map(r => ({ ...r, status: RequestStatus.CANCELLED })),
    ],
    isLoading: false,
    totalItems: 5,
    page: 1,
    totalPages: 1,
    ...handlers,
  },
};
