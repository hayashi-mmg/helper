import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import Notification from './Notification';
import styled from 'styled-components';

const meta: Meta<typeof Notification> = {
  title: 'Molecules/Notification',
  component: Notification,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['success', 'error', 'warning', 'info'],
    },
    mode: {
      control: { type: 'select' },
      options: ['alert', 'toast', 'dialog'],
    },
    position: {
      control: { type: 'select' },
      options: ['top', 'top-right', 'top-left', 'bottom', 'bottom-right', 'bottom-left'],
    },
    children: {
      control: false,
    },
    icon: {
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Notification>;

// ストーリーのラッパー（コンポーネントを中央に表示）
const StoryWrapper = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

export const Success: Story = {
  render: (args) => (
    <StoryWrapper>
      <Notification {...args} />
    </StoryWrapper>
  ),
  args: {
    type: 'success',
    title: '成功',
    message: '操作が正常に完了しました。',
    showCloseButton: true,
  },
};

export const Error: Story = {
  render: (args) => (
    <StoryWrapper>
      <Notification {...args} />
    </StoryWrapper>
  ),
  args: {
    type: 'error',
    title: 'エラー',
    message: '処理中にエラーが発生しました。もう一度お試しください。',
    showCloseButton: true,
  },
};

export const Warning: Story = {
  render: (args) => (
    <StoryWrapper>
      <Notification {...args} />
    </StoryWrapper>
  ),
  args: {
    type: 'warning',
    title: '警告',
    message: '入力内容を確認してください。',
    showCloseButton: true,
  },
};

export const Info: Story = {
  render: (args) => (
    <StoryWrapper>
      <Notification {...args} />
    </StoryWrapper>
  ),
  args: {
    type: 'info',
    title: 'お知らせ',
    message: 'システムメンテナンスが明日予定されています。',
    showCloseButton: true,
  },
};

export const WithoutTitle: Story = {
  render: (args) => (
    <StoryWrapper>
      <Notification {...args} />
    </StoryWrapper>
  ),
  args: {
    type: 'info',
    message: 'タイトルなしの通知メッセージです。',
    showCloseButton: true,
  },
};

export const WithActions: Story = {
  render: (args) => (
    <StoryWrapper>
      <Notification {...args}>
        <button onClick={() => alert('承認されました')}>承認</button>
        <button onClick={() => alert('却下されました')}>却下</button>
      </Notification>
    </StoryWrapper>
  ),
  args: {
    type: 'warning',
    title: '確認',
    message: 'この操作を実行しますか？',
    showCloseButton: true,
  },
};

export const DialogMode: Story = {
  render: (args) => (
    <StoryWrapper>
      <Notification {...args}>
        <button onClick={() => alert('はい')}>はい</button>
        <button onClick={() => alert('いいえ')}>いいえ</button>
      </Notification>
    </StoryWrapper>
  ),
  args: {
    type: 'warning',
    title: '確認ダイアログ',
    message: '変更を保存せずに閉じますか？',
    mode: 'dialog',
    showCloseButton: true,
  },
};
