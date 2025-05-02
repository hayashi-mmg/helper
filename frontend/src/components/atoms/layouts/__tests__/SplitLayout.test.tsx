import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SplitLayout } from '../SplitLayout';

describe('SplitLayout', () => {
  // BoundingClientRectをモックする関数
  const mockBoundingClientRect = (width: number, height: number) => {
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      width,
      height,
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      x: 0,
      y: 0,
      toJSON: () => {}
    }));
    
    return () => {
      Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    };
  };
  
  it('renders both panes correctly', () => {
    render(
      <SplitLayout 
        leftPane={<div>左ペイン</div>} 
        rightPane={<div>右ペイン</div>}
      />
    );
    
    // 両方のペインが表示されていることを確認
    expect(screen.getByText('左ペイン')).toBeInTheDocument();
    expect(screen.getByText('右ペイン')).toBeInTheDocument();
  });
  
  it('applies default split position correctly', () => {
    render(
      <SplitLayout 
        leftPane={<div>左ペイン</div>} 
        rightPane={<div>右ペイン</div>}
        defaultSplit={30}
      />
    );
    
    // 左ペインの幅が30%になっていることを確認
    const leftPane = screen.getByText('左ペイン').closest('.split-layout__pane');
    expect(leftPane).toHaveStyle('width: 30%');
  });
  
  it('handles direction prop correctly', () => {
    render(
      <SplitLayout 
        leftPane={<div>上ペイン</div>} 
        rightPane={<div>下ペイン</div>}
        direction="vertical"
        defaultSplit={40}
      />
    );
    
    // コンテナにdirection-verticalクラスが適用されていることを確認
    const container = screen.getByText('上ペイン').closest('.split-layout');
    expect(container).toHaveClass('direction-vertical');
    
    // 上下ペインの高さが正しく設定されていることを確認
    const topPane = screen.getByText('上ペイン').closest('.split-layout__pane');
    expect(topPane).toHaveStyle('height: 40%');
    
    const bottomPane = screen.getByText('下ペイン').closest('.split-layout__pane');
    expect(bottomPane).toHaveStyle('height: 60%');
  });
  
  it('handles mouse drag to resize correctly', () => {
    // BoundingClientRectをモック
    const restoreMock = mockBoundingClientRect(1000, 1000);
    
    try {
      render(
        <SplitLayout 
          leftPane={<div>左ペイン</div>} 
          rightPane={<div>右ペイン</div>}
          defaultSplit={50}
        />
      );
      
      const splitter = screen.getByRole('separator');
      const leftPane = screen.getByText('左ペイン').closest('.split-layout__pane');
      
      // ドラッグ開始
      fireEvent.mouseDown(splitter);
      
      // マウスを移動（x座標300の位置 = 30%）
      fireEvent.mouseMove(document, { clientX: 300 });
      
      // ドラッグ終了
      fireEvent.mouseUp(document);
      
      // 左ペインの幅が30%に更新されていることを確認
      expect(leftPane).toHaveStyle('width: 30%');
    } finally {
      // モックを元に戻す
      restoreMock();
    }
  });
  
  it('respects min size constraints', () => {
    // BoundingClientRectをモック
    const restoreMock = mockBoundingClientRect(1000, 1000);
    
    try {
      render(
        <SplitLayout 
          leftPane={<div>左ペイン</div>} 
          rightPane={<div>右ペイン</div>}
          defaultSplit={50}
          minLeftSize={30}
          minRightSize={40}
        />
      );
      
      const splitter = screen.getByRole('separator');
      const leftPane = screen.getByText('左ペイン').closest('.split-layout__pane');
      
      // ドラッグ開始
      fireEvent.mouseDown(splitter);
      
      // マウスを移動（x座標100の位置 = 10%）- 最小制約より小さい
      fireEvent.mouseMove(document, { clientX: 100 });
      
      // ドラッグ終了
      fireEvent.mouseUp(document);
      
      // 左ペインの幅が最小制約の30%に制限されていることを確認
      expect(leftPane).toHaveStyle('width: 30%');
      
      // 再度ドラッグ開始
      fireEvent.mouseDown(splitter);
      
      // マウスを移動（x座標700の位置 = 70%）- 右ペインの最小制約より大きい
      fireEvent.mouseMove(document, { clientX: 700 });
      
      // ドラッグ終了
      fireEvent.mouseUp(document);
      
      // 左ペインの幅が右ペインの最小制約を考慮して60%に制限されていることを確認
      expect(leftPane).toHaveStyle('width: 60%');
    } finally {
      // モックを元に戻す
      restoreMock();
    }
  });
  
  it('resets to 50/50 when double clicking splitter', () => {
    render(
      <SplitLayout 
        leftPane={<div>左ペイン</div>} 
        rightPane={<div>右ペイン</div>}
        defaultSplit={30}
      />
    );
    
    const splitter = screen.getByRole('separator');
    const leftPane = screen.getByText('左ペイン').closest('.split-layout__pane');
    
    // 初期状態が30%であることを確認
    expect(leftPane).toHaveStyle('width: 30%');
    
    // スプリッターをダブルクリック
    fireEvent.doubleClick(splitter);
    
    // 50%にリセットされていることを確認
    expect(leftPane).toHaveStyle('width: 50%');
  });
  
  it('does not resize when resizable is false', () => {
    // BoundingClientRectをモック
    const restoreMock = mockBoundingClientRect(1000, 1000);
    
    try {
      render(
        <SplitLayout 
          leftPane={<div>左ペイン</div>} 
          rightPane={<div>右ペイン</div>}
          defaultSplit={40}
          resizable={false}
        />
      );
      
      const splitter = screen.getByRole('separator');
      const leftPane = screen.getByText('左ペイン').closest('.split-layout__pane');
      
      // 初期状態が40%であることを確認
      expect(leftPane).toHaveStyle('width: 40%');
      
      // ドラッグ試行
      fireEvent.mouseDown(splitter);
      fireEvent.mouseMove(document, { clientX: 300 });
      fireEvent.mouseUp(document);
      
      // 幅が変更されていないことを確認
      expect(leftPane).toHaveStyle('width: 40%');
      
      // ダブルクリック試行
      fireEvent.doubleClick(splitter);
      
      // 幅が変更されていないことを確認
      expect(leftPane).toHaveStyle('width: 40%');
    } finally {
      // モックを元に戻す
      restoreMock();
    }
  });
  
  it('handles keyboard navigation correctly', () => {
    render(
      <SplitLayout 
        leftPane={<div>左ペイン</div>} 
        rightPane={<div>右ペイン</div>}
        defaultSplit={50}
      />
    );
    
    const splitter = screen.getByRole('separator');
    const leftPane = screen.getByText('左ペイン').closest('.split-layout__pane');
    
    // 左矢印キーで左ペインを縮小
    fireEvent.keyDown(splitter, { key: 'ArrowLeft' });
    expect(leftPane).toHaveStyle('width: 45%');
    
    // 右矢印キーで左ペインを拡大
    fireEvent.keyDown(splitter, { key: 'ArrowRight' });
    expect(leftPane).toHaveStyle('width: 50%');
  });
  
  it('applies custom splitter size correctly', () => {
    render(
      <SplitLayout 
        leftPane={<div>左ペイン</div>} 
        rightPane={<div>右ペイン</div>}
        splitter={8}
      />
    );
    
    const splitter = screen.getByRole('separator');
    expect(splitter).toHaveStyle('width: 8px');
  });
  
  it('renders custom splitter content', () => {
    render(
      <SplitLayout 
        leftPane={<div>左ペイン</div>} 
        rightPane={<div>右ペイン</div>}
        splitter={<div data-testid="custom-splitter">≡</div>}
      />
    );
    
    expect(screen.getByTestId('custom-splitter')).toBeInTheDocument();
  });
});
