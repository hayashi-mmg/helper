import { Meta, StoryObj } from '@storybook/react';
import { RecentRequests } from '../components/dashboard/RecentRequests';
import { mockRequestArray } from '../../test-utils/test-data';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof RecentRequests> = {
  component: RecentRequests,
  title: 'フィーチャー/ユーザー/ダッシュボード/最近の依頼',
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
type Story = StoryObj<typeof RecentRequests>;

export const Default: Story = {
  args: {
    requests: mockRequestArray(5),
    isLoading: false,
    title: '最近の依頼',
    limit: 5,
    showViewAll: true,
  },
};

export const Loading: Story = {
  args: {
    requests: [],
    isLoading: true,
    title: '最近の依頼',
    limit: 5,
    showViewAll: true,
  },
};

export const NoData: Story = {
  args: {
    requests: [],
    isLoading: false,
    title: '最近の依頼',
    limit: 5,
    showViewAll: true,
  },
};

export const WithLimitedData: Story = {
  args: {
    requests: mockRequestArray(2),
    isLoading: false,
    title: '最近の依頼',
    limit: 5,
    showViewAll: true,
  },
};

export const NoViewAllButton: Story = {
  args: {
    requests: mockRequestArray(5),
    isLoading: false,
    title: '最近の依頼',
    limit: 5,
    showViewAll: false,
  },
};

export const CustomTitle: Story = {
  args: {
    requests: mockRequestArray(5),
    isLoading: false,
    title: 'カスタムタイトル',
    limit: 5,
    showViewAll: true,
  },
};
