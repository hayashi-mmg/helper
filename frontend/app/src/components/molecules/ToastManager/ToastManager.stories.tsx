
import { Meta, StoryObj } from '@storybook/react';
import { ToastManagerProvider, useToast } from './ToastManager';
import styled from 'styled-components';

// トーストを呼び出すためのデモコンポーネント
const ToastDemo: React.FC = () => {
  const toast = useToast();
  
  return (
    <DemoContainer>
      <h2>トースト通知デモ</h2>
      <p>下のボタンを押して様々なタイプのトースト通知を表示します。</p>
      
      <ButtonGroup>
        <Button 
          onClick={() => toast.success('操作が成功しました', { title: '成功' })}
          $variant="success"
        >
          成功トースト
        </Button>
        
        <Button 
          onClick={() => toast.error('エラーが発生しました。再試行してください。', { title: 'エラー' })}
          $variant="error"
        >
          エラートースト
        </Button>
        
        <Button 
          onClick={() => toast.warning('この操作は取り消せません', { title: '警告' })}
          $variant="warning"
        >
          警告トースト
        </Button>
        
        <Button 
          onClick={() => toast.info('システムが更新されました', { title: 'お知らせ' })}
          $variant="info"
        >
          情報トースト
        </Button>
      </ButtonGroup>
      
      <h3>表示位置の設定</h3>
      <ButtonGroup>
        <Button 
          onClick={() => toast.info('上部に表示', { position: 'top' })}
          $variant="info"
        >
          上部
        </Button>
        
        <Button 
          onClick={() => toast.info('右上に表示', { position: 'top-right' })}
          $variant="info"
        >
          右上
        </Button>
        
        <Button 
          onClick={() => toast.info('左上に表示', { position: 'top-left' })}
          $variant="info"
        >
          左上
        </Button>
        
        <Button 
          onClick={() => toast.info('下部に表示', { position: 'bottom' })}
          $variant="info"
        >
          下部
        </Button>
        
        <Button 
          onClick={() => toast.info('右下に表示', { position: 'bottom-right' })}
          $variant="info"
        >
          右下
        </Button>
        
        <Button 
          onClick={() => toast.info('左下に表示', { position: 'bottom-left' })}
          $variant="info"
        >
          左下
        </Button>
      </ButtonGroup>
      
      <h3>特別なオプション</h3>
      <ButtonGroup>
        <Button 
          onClick={() => toast.info('このトーストは自動的に閉じません', { 
            autoCloseTime: 0,
            title: '永続的なトースト'
          })}
          $variant="info"
        >
          永続トースト
        </Button>
        
        <Button
          onClick={() => {
            // 複数のトーストをまとめて表示
            toast.success('成功メッセージ');
            setTimeout(() => toast.error('エラーメッセージ'), 300);
            setTimeout(() => toast.warning('警告メッセージ'), 600);
            setTimeout(() => toast.info('情報メッセージ'), 900);
          }}
          $variant="warning"
        >
          複数トースト表示
        </Button>
        
        <Button
          onClick={() => toast.removeAll()}
          $variant="error"
        >
          すべて削除
        </Button>
      </ButtonGroup>
    </DemoContainer>
  );
};

// スタイル付きコンポーネント
const DemoContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: sans-serif;
  
  h2 {
    margin-top: 0;
    margin-bottom: 16px;
  }
  
  p {
    margin-bottom: 24px;
  }
  
  h3 {
    margin-top: 32px;
    margin-bottom: 16px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
`;

const Button = styled.button<{ $variant: 'success' | 'error' | 'warning' | 'info' }>`
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  border: none;
  
  ${props => {
    switch (props.$variant) {
      case 'success':
        return `
          background-color: #38A169;
          color: white;
          &:hover { background-color: #2F855A; }
        `;
      case 'error':
        return `
          background-color: #E53E3E;
          color: white;
          &:hover { background-color: #C53030; }
        `;
      case 'warning':
        return `
          background-color: #DD6B20;
          color: white;
          &:hover { background-color: #C05621; }
        `;
      case 'info':
      default:
        return `
          background-color: #3182CE;
          color: white;
          &:hover { background-color: #2B6CB0; }
        `;
    }
  }}
`;

const meta: Meta<typeof ToastManagerProvider> = {
  title: 'Molecules/ToastManager',
  component: ToastManagerProvider,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultPosition: {
      control: { type: 'select' },
      options: ['top', 'top-right', 'top-left', 'bottom', 'bottom-right', 'bottom-left'],
    },
    defaultAutoCloseTime: {
      control: { type: 'number' },
    },
    maxToasts: {
      control: { type: 'number' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToastManagerProvider>;

export const Default: Story = {
  render: (args) => (
    <ToastManagerProvider {...args}>
      <ToastDemo />
    </ToastManagerProvider>
  ),
  args: {
    defaultPosition: 'top-right',
    defaultAutoCloseTime: 5000,
    maxToasts: 5,
  },
};

export const BottomPosition: Story = {
  render: (args) => (
    <ToastManagerProvider {...args}>
      <ToastDemo />
    </ToastManagerProvider>
  ),
  args: {
    defaultPosition: 'bottom',
    defaultAutoCloseTime: 5000,
    maxToasts: 5,
  },
};

export const ShortDuration: Story = {
  render: (args) => (
    <ToastManagerProvider {...args}>
      <ToastDemo />
    </ToastManagerProvider>
  ),
  args: {
    defaultPosition: 'top-right',
    defaultAutoCloseTime: 2000,
    maxToasts: 5,
  },
};

export const LimitedToasts: Story = {
  render: (args) => (
    <ToastManagerProvider {...args}>
      <ToastDemo />
    </ToastManagerProvider>
  ),
  args: {
    defaultPosition: 'top-right',
    defaultAutoCloseTime: 5000,
    maxToasts: 2,
  },
};
