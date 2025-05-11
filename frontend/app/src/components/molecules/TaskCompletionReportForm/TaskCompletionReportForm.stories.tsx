import { Meta, StoryObj } from '@storybook/react';
import { TaskCompletionReportForm } from './TaskCompletionReportForm';
import { mockRequests } from '../../../mocks/requests';

const meta: Meta<typeof TaskCompletionReportForm> = {
  title: 'Molecules/TaskCompletionReportForm',
  component: TaskCompletionReportForm,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof TaskCompletionReportForm>;

export const Default: Story = {
  args: {
    request: mockRequests.find(r => r.id === 'req-001'), // 料理リクエスト
    isLoading: false,
    isSubmitting: false,
    onSubmit: (formData) => {
      console.log('Form submitted with data:', formData);
    },
    onCancel: () => console.log('Form cancelled'),
    onImageUpload: async (file) => {
      console.log('Uploading image:', file.name);
      // 実際のAPIでは画像をアップロードしてIDを返すが、ここではモックとしてランダムIDを返す
      return `image-${Math.random().toString(36).substr(2, 9)}`;
    },
    onImageDelete: async (imageId) => {
      console.log('Deleting image with ID:', imageId);
    },
  },
};

export const ErrandRequest: Story = {
  args: {
    ...Default.args,
    request: mockRequests.find(r => r.id === 'req-003'), // お使いリクエスト
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
};

export const Submitting: Story = {
  args: {
    ...Default.args,
    isSubmitting: true,
  },
};

export const Error: Story = {
  args: {
    ...Default.args,
    request: undefined, // エラー状態をテスト
  },
};
