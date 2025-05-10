import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { ToastManagerProvider, useToast } from './ToastManager';

// テスト用コンポーネント
const TestComponent: React.FC = () => {
  const toast = useToast();
  
  return (
    <div>
      <button onClick={() => toast.success('成功しました')}>成功トースト</button>
      <button onClick={() => toast.error('エラーが発生しました')}>エラートースト</button>
      <button onClick={() => toast.warning('警告')}>警告トースト</button>
      <button onClick={() => toast.info('お知らせ')}>情報トースト</button>
      <button onClick={() => toast.removeAll()}>すべて削除</button>
    </div>
  );
};

describe('ToastManager', () => {
  beforeEach(() => {
    // createPortalのモック
    const originalCreatePortal = React.createPortal;
    // @ts-ignore
    React.createPortal = jest.fn((element) => element);
    
    // jestのタイマーをモック
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // モックをリセット
    jest.clearAllMocks();
    jest.useRealTimers();
    // @ts-ignore
    React.createPortal = jest.requireActual('react-dom').createPortal;
  });
  
  it('トースト通知を表示できること', () => {
    render(
      <ToastManagerProvider>
        <TestComponent />
      </ToastManagerProvider>
    );
    
    // 成功トーストを表示
    fireEvent.click(screen.getByText('成功トースト'));
    
    expect(screen.getByText('成功しました')).toBeInTheDocument();
  });
  
  it('異なる種類のトーストを表示できること', () => {
    render(
      <ToastManagerProvider>
        <TestComponent />
      </ToastManagerProvider>
    );
    
    // 各種トーストを表示
    fireEvent.click(screen.getByText('成功トースト'));
    fireEvent.click(screen.getByText('エラートースト'));
    fireEvent.click(screen.getByText('警告トースト'));
    
    expect(screen.getByText('成功しました')).toBeInTheDocument();
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    expect(screen.getByText('警告')).toBeInTheDocument();
  });
  
  it('トーストが自動的に消えること', () => {
    jest.useFakeTimers();
    
    render(
      <ToastManagerProvider defaultAutoCloseTime={1000}>
        <TestComponent />
      </ToastManagerProvider>
    );
    
    // トーストを表示
    fireEvent.click(screen.getByText('情報トースト'));
    
    expect(screen.getByText('お知らせ')).toBeInTheDocument();
    
    // 時間を進める
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // animationの時間も進める
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // トーストが消えた状態になる
    expect(screen.queryByText('お知らせ')).not.toBeInTheDocument();
  });
  
  it('すべてのトーストをまとめて削除できること', () => {
    render(
      <ToastManagerProvider>
        <TestComponent />
      </ToastManagerProvider>
    );
    
    // いくつかのトーストを表示
    fireEvent.click(screen.getByText('成功トースト'));
    fireEvent.click(screen.getByText('警告トースト'));
    
    expect(screen.getByText('成功しました')).toBeInTheDocument();
    expect(screen.getByText('警告')).toBeInTheDocument();
    
    // すべて削除
    fireEvent.click(screen.getByText('すべて削除'));
    
    // トーストが消えている
    expect(screen.queryByText('成功しました')).not.toBeInTheDocument();
    expect(screen.queryByText('警告')).not.toBeInTheDocument();
  });
  
  it('最大トースト数を超えると古いトーストが削除されること', () => {
    render(
      <ToastManagerProvider maxToasts={2}>
        <TestComponent />
      </ToastManagerProvider>
    );
    
    // 3つのトーストを表示（maxToastsは2）
    fireEvent.click(screen.getByText('情報トースト')); // これが削除される
    fireEvent.click(screen.getByText('警告トースト'));
    fireEvent.click(screen.getByText('エラートースト'));
    
    // 古いトースト（情報）は消えて、新しいトースト（警告、エラー）は残る
    expect(screen.queryByText('お知らせ')).not.toBeInTheDocument();
    expect(screen.getByText('警告')).toBeInTheDocument();
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
  });
  
  it('ToastManagerProviderの外でuseToastを呼ぶとエラーになること', () => {
    // エラーをコンソールに出さないように設定
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const ErrorComponent: React.FC = () => {
      expect(() => useToast()).toThrow('useToast must be used within a ToastManagerProvider');
      return null;
    };
    
    render(<ErrorComponent />);
    
    // クリーンアップ
    consoleError.mockRestore();
  });
});
