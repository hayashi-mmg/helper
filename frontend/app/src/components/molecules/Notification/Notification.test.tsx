import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import Notification from './Notification';

describe('Notification', () => {
  // 基本的なレンダリングテスト
  it('正しくレンダリングされること', () => {
    render(
      <Notification
        type="info"
        title="通知タイトル"
        message="通知メッセージ"
      />
    );
    
    expect(screen.getByText('通知タイトル')).toBeInTheDocument();
    expect(screen.getByText('通知メッセージ')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  // 異なるタイプのテスト
  it.each([
    ['success', '成功'],
    ['error', 'エラー'],
    ['warning', '警告'],
    ['info', '情報'],
  ])('%sタイプが正しくレンダリングされること', (type, title) => {
    render(
      <Notification
        type={type as any}
        title={title}
        message={`${title}メッセージ`}
      />
    );
    
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(`${title}メッセージ`)).toBeInTheDocument();
  });

  // 閉じるボタンのテスト
  it('閉じるボタンをクリックすると閉じられること', () => {
    const handleClose = jest.fn();
    
    render(
      <Notification
        type="info"
        title="通知タイトル"
        message="通知メッセージ"
        onClose={handleClose}
      />
    );
    
    const closeButton = screen.getByLabelText('閉じる');
    fireEvent.click(closeButton);
    
    // アニメーション完了後にonCloseが呼ばれることを確認
    jest.advanceTimersByTime(300);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  // トーストモードのテスト
  it('トーストモードで表示されること', () => {
    // 実際にはcreatePortalを使用するため、テスト環境によっては調整が必要
    // モックを使用してトーストモードをテスト
    const originalCreatePortal = React.createPortal;
    // @ts-ignore
    React.createPortal = jest.fn((element) => element);
    
    render(
      <Notification
        type="success"
        message="トースト通知"
        mode="toast"
      />
    );
    
    expect(screen.getByText('トースト通知')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    // クリーンアップ
    // @ts-ignore
    React.createPortal = originalCreatePortal;
  });

  // ダイアログモードのテスト
  it('ダイアログモードで表示されること', () => {
    // 実際にはcreatePortalを使用するため、テスト環境によっては調整が必要
    const originalCreatePortal = React.createPortal;
    // @ts-ignore
    React.createPortal = jest.fn((element) => element);
    
    render(
      <Notification
        type="info"
        title="確認ダイアログ"
        message="続行しますか？"
        mode="dialog"
      />
    );
    
    expect(screen.getByText('確認ダイアログ')).toBeInTheDocument();
    expect(screen.getByText('続行しますか？')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // クリーンアップ
    // @ts-ignore
    React.createPortal = originalCreatePortal;
  });

  // 子要素のレンダリングテスト
  it('子要素としてのアクションボタンがレンダリングされること', () => {
    render(
      <Notification
        type="warning"
        title="確認"
        message="変更を保存しますか？"
      >
        <button>はい</button>
        <button>キャンセル</button>
      </Notification>
    );
    
    expect(screen.getByText('はい')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
  });
  
  // 自動で閉じるテスト
  it('autoCloseTimeが設定されていると自動的に閉じること', async () => {
    jest.useFakeTimers();
    const handleClose = jest.fn();
    
    render(
      <Notification
        type="success"
        message="自動で閉じる通知"
        mode="toast"
        autoCloseTime={2000}
        onClose={handleClose}
      />
    );
    
    expect(screen.getByText('自動で閉じる通知')).toBeInTheDocument();
    
    // 時間を進める
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // クローズアニメーション分も進める
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(handleClose).toHaveBeenCalledTimes(1);
    
    jest.useRealTimers();
  });
  
  // onShow コールバックのテスト
  it('表示されたときにonShowが呼び出されること', () => {
    const handleShow = jest.fn();
    
    render(
      <Notification
        type="info"
        message="通知"
        onShow={handleShow}
      />
    );
    
    expect(handleShow).toHaveBeenCalledTimes(1);
  });
});
