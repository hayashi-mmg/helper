import { Meta, StoryObj } from '@storybook/react';
import { DashboardSummary } from '../components/dashboard/DashboardSummary';
import { mockUserSummary } from '../../test-utils/test-data';

const meta: Meta<typeof DashboardSummary> = {
  component: DashboardSummary,
  title: 'フィーチャー/ユーザー/ダッシュボード/サマリー',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DashboardSummary>;

export const Default: Story = {
  args: {
    summary: mockUserSummary(),
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    summary: mockUserSummary(),
    isLoading: true,
  },
};

export const EmptyData: Story = {
  args: {
    summary: {
      totalRequests: 0,
      activeRequests: 0,
      completedRequests: 0,
      favoriteHelpers: 0,
    },
    isLoading: false,
  },
};

export const HighNumbers: Story = {
  args: {
    summary: {
      totalRequests: 1250,
      activeRequests: 423,
      completedRequests: 827,
      favoriteHelpers: 58,
    },
    isLoading: false,
  },
};
