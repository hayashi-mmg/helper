import React from 'react';
import { render, screen, fireEvent } from '../../../test-utils/providers';
import SplitLayout from './SplitLayout';

// BoundingClientRectをモック
const mockGetBoundingClientRect = jest.fn(() => ({
    left: 0,
    top: 0,
    width: 1000,
    height: 500,
    right: 1000,
    bottom: 500,
    x: 0,
    y: 0,
    toJSON: () => {}
}));

Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;

describe('SplitLayout Component', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    it('renders both panes correctly', () => {
        render(
            <SplitLayout 
                leftPane={<div>左側のコンテンツ</div>} 
                rightPane={<div>右側のコンテンツ</div>}
            />
        );
        
        expect(screen.getByText('左側のコンテンツ')).toBeInTheDocument();
        expect(screen.getByText('右側のコンテンツ')).toBeInTheDocument();
        expect(screen.getByRole('separator')).toBeInTheDocument();
    });
    
    it('applies default 50/50 split', () => {
        const { container } = render(
            <SplitLayout 
                leftPane={<div>左側</div>} 
                rightPane={<div>右側</div>}
            />
        );
        
        const leftPane = container.querySelector('.split-layout__left');
        const rightPane = container.querySelector('.split-layout__right');
        
        expect(leftPane).toHaveStyle('width: 50%');
        expect(rightPane).toHaveStyle('width: 50%');
    });
    
    it('applies custom split position', () => {
        const { container } = render(
            <SplitLayout 
                leftPane={<div>左側</div>} 
                rightPane={<div>右側</div>}
                defaultSplit={30}
            />
        );
        
        const leftPane = container.querySelector('.split-layout__left');
        const rightPane = container.querySelector('.split-layout__right');
        
        expect(leftPane).toHaveStyle('width: 30%');
        expect(rightPane).toHaveStyle('width: 70%');
    });
    
    it('renders vertical split when direction is vertical', () => {
        const { container } = render(
            <SplitLayout 
                leftPane={<div>上側</div>} 
                rightPane={<div>下側</div>}
                direction="vertical"
            />
        );
        
        const layout = container.firstChild;
        const leftPane = container.querySelector('.split-layout__left');
        const rightPane = container.querySelector('.split-layout__right');
        
        expect(layout).toHaveStyle('flex-direction: column');
        expect(leftPane).toHaveStyle('height: 50%');
        expect(rightPane).toHaveStyle('height: 50%');
    });
    
    it('calls onSplitChange when split position changes', () => {
        const handleSplitChange = jest.fn();
        
        render(
            <SplitLayout 
                leftPane={<div>左側</div>} 
                rightPane={<div>右側</div>}
                onSplitChange={handleSplitChange}
            />
        );
        
        // スプリッターをドラッグ
        const splitter = screen.getByRole('separator');
        
        fireEvent.mouseDown(splitter);
        
        // マウス移動をシミュレート (30%の位置)
        fireEvent.mouseMove(document, { clientX: 300 });
        
        // マウスアップでドラッグ終了
        fireEvent.mouseUp(document);
        
        // コールバックが呼ばれたことを確認
        expect(handleSplitChange).toHaveBeenCalledWith(30);
    });
    
    it('resets to 50/50 when double clicking splitter', () => {
        const handleSplitChange = jest.fn();
        
        const { container } = render(
            <SplitLayout 
                leftPane={<div>左側</div>} 
                rightPane={<div>右側</div>}
                defaultSplit={30}
                onSplitChange={handleSplitChange}
            />
        );
        
        const leftPane = container.querySelector('.split-layout__left');
        const splitter = screen.getByRole('separator');
        
        // 初期値が30%であることを確認
        expect(leftPane).toHaveStyle('width: 30%');
        
        // ダブルクリックで50%にリセット
        fireEvent.doubleClick(splitter);
        
        // スタイルが更新されたことを確認
        expect(leftPane).toHaveStyle('width: 50%');
        expect(handleSplitChange).toHaveBeenCalledWith(50);
    });
    
    it('supports keyboard navigation', () => {
        const handleSplitChange = jest.fn();
        
        const { container } = render(
            <SplitLayout 
                leftPane={<div>左側</div>} 
                rightPane={<div>右側</div>}
                defaultSplit={50}
                onSplitChange={handleSplitChange}
            />
        );
        
        const leftPane = container.querySelector('.split-layout__left');
        const splitter = screen.getByRole('separator');
        
        // フォーカスをスプリッターに設定
        splitter.focus();
        
        // 右矢印キーで右に移動
        fireEvent.keyDown(splitter, { key: 'ArrowRight' });
        
        // 51%に更新されたことを確認
        expect(leftPane).toHaveStyle('width: 51%');
        expect(handleSplitChange).toHaveBeenCalledWith(51);
        
        // 左矢印キーで左に移動
        fireEvent.keyDown(splitter, { key: 'ArrowLeft' });
        
        // 50%に戻ったことを確認
        expect(leftPane).toHaveStyle('width: 50%');
        expect(handleSplitChange).toHaveBeenCalledWith(50);
    });
    
    it('respects minLeftSize and minRightSize constraints', () => {
        const { container } = render(
            <SplitLayout 
                leftPane={<div>左側</div>} 
                rightPane={<div>右側</div>}
                minLeftSize={25}
                minRightSize={30}
            />
        );
        
        const leftPane = container.querySelector('.split-layout__left');
        const splitter = screen.getByRole('separator');
        
        // ドラッグでminLeftSize未満に移動しようとする
        fireEvent.mouseDown(splitter);
        fireEvent.mouseMove(document, { clientX: 200 }); // 20%
        fireEvent.mouseUp(document);
        
        // 最小値である25%に制限されることを確認
        expect(leftPane).toHaveStyle('width: 25%');
        
        // ドラッグでminRightSize未満に移動しようとする
        fireEvent.mouseDown(splitter);
        fireEvent.mouseMove(document, { clientX: 800 }); // 80%
        fireEvent.mouseUp(document);
        
        // 最大値である70%(= 100% - 30%)に制限されることを確認
        expect(leftPane).toHaveStyle('width: 70%');
    });
    
    it('is not resizable when resizable is false', () => {
        const handleSplitChange = jest.fn();
        
        const { container } = render(
            <SplitLayout 
                leftPane={<div>左側</div>} 
                rightPane={<div>右側</div>}
                defaultSplit={40}
                resizable={false}
                onSplitChange={handleSplitChange}
            />
        );
        
        const leftPane = container.querySelector('.split-layout__left');
        const splitter = screen.getByRole('separator');
        
        // ドラッグを試みる
        fireEvent.mouseDown(splitter);
        fireEvent.mouseMove(document, { clientX: 600 }); // 60%
        fireEvent.mouseUp(document);
        
        // 位置が変わらないことを確認
        expect(leftPane).toHaveStyle('width: 40%');
        expect(handleSplitChange).not.toHaveBeenCalled();
        
        // ダブルクリックしても位置が変わらないことを確認
        fireEvent.doubleClick(splitter);
        expect(leftPane).toHaveStyle('width: 40%');
        expect(handleSplitChange).not.toHaveBeenCalled();
    });
});