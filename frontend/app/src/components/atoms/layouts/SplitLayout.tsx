import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Flex, useMergeRefs } from '@chakra-ui/react';

export interface SplitLayoutProps {
    /**
     * 左側（または上側）のペイン内容
     */
    leftPane: React.ReactNode;
    
    /**
     * 右側（または下側）のペイン内容
     */
    rightPane: React.ReactNode;
    
    /**
     * 分割方向
     * @default 'horizontal'
     */
    direction?: 'horizontal' | 'vertical';
    
    /**
     * デフォルトの分割位置（左側または上側の割合、1-99）
     * @default 50
     */
    defaultSplit?: number;
    
    /**
     * リサイズ可能か
     * @default true
     */
    resizable?: boolean;
    
    /**
     * 左（上）ペインの最小サイズ（%）
     * @default 20
     */
    minLeftSize?: number;
    
    /**
     * 右（下）ペインの最小サイズ（%）
     * @default 20
     */
    minRightSize?: number;
    
    /**
     * スプリッターの幅または高さ（ピクセル）
     * @default 4
     */
    splitterSize?: number;
    
    /**
     * 分割位置が変更された時のコールバック
     */
    onSplitChange?: (position: number) => void;
    
    /**
     * 追加のクラス名
     */
    className?: string;
}

/**
 * 画面を水平または垂直に分割するレイアウト
 * 分割比率を調整可能
 */
export const SplitLayout: React.FC<SplitLayoutProps> = ({
    leftPane,
    rightPane,
    direction = 'horizontal',
    defaultSplit = 50,
    resizable = true,
    minLeftSize = 20,
    minRightSize = 20,
    splitterSize = 4,
    onSplitChange,
    className
}) => {
    const [splitPosition, setSplitPosition] = useState(defaultSplit);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    
    const isHorizontal = direction === 'horizontal';
    
    // ドラッグ開始時の処理
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!resizable) return;
        
        isDraggingRef.current = true;
        document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
        document.body.style.userSelect = 'none';
        
        e.preventDefault();
    }, [resizable, isHorizontal]);
    
    // マウス移動時の処理
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDraggingRef.current || !containerRef.current) return;
        
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        
        let newPosition;
        if (isHorizontal) {
            newPosition = ((e.clientX - rect.left) / rect.width) * 100;
        } else {
            newPosition = ((e.clientY - rect.top) / rect.height) * 100;
        }
        
        // 最小サイズの制約を適用
        newPosition = Math.max(minLeftSize, Math.min(100 - minRightSize, newPosition));
        
        setSplitPosition(newPosition);
        if (onSplitChange) {
            onSplitChange(newPosition);
        }
        
        e.preventDefault();
    }, [isHorizontal, minLeftSize, minRightSize, onSplitChange]);
    
    // ドラッグ終了時の処理
    const handleMouseUp = useCallback(() => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    }, []);
    
    // ダブルクリックで50/50に分割
    const handleDoubleClick = useCallback(() => {
        if (resizable) {
            setSplitPosition(50);
            if (onSplitChange) {
                onSplitChange(50);
            }
        }
    }, [resizable, onSplitChange]);
    
    // キーボードでのリサイズ
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!document.activeElement || document.activeElement.getAttribute('role') !== 'separator') {
            return;
        }
        
        let newPosition = splitPosition;
        
        if ((isHorizontal && e.key === 'ArrowLeft') || (!isHorizontal && e.key === 'ArrowUp')) {
            newPosition = Math.max(minLeftSize, splitPosition - 1);
        } else if ((isHorizontal && e.key === 'ArrowRight') || (!isHorizontal && e.key === 'ArrowDown')) {
            newPosition = Math.min(100 - minRightSize, splitPosition + 1);
        }
        
        if (newPosition !== splitPosition) {
            setSplitPosition(newPosition);
            if (onSplitChange) {
                onSplitChange(newPosition);
            }
            e.preventDefault();
        }
    }, [isHorizontal, minLeftSize, minRightSize, splitPosition, onSplitChange]);
    
    // イベントリスナーの登録・解除
    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleMouseMove, handleMouseUp, handleKeyDown]);
    
    // 左/上ペインのスタイル
    const leftStyle = {
        [isHorizontal ? 'width' : 'height']: `${splitPosition}%`,
        overflow: 'auto',
    };
    
    // 右/下ペインのスタイル
    const rightStyle = {
        [isHorizontal ? 'width' : 'height']: `${100 - splitPosition}%`,
        overflow: 'auto',
    };
    
    // スプリッターのスタイル
    const splitterStyle = {
        [isHorizontal ? 'width' : 'height']: `${splitterSize}px`,
        [isHorizontal ? 'minWidth' : 'minHeight']: `${splitterSize}px`,
        cursor: resizable ? (isHorizontal ? 'col-resize' : 'row-resize') : 'default',
    };
    
    return (
        <Flex
            ref={containerRef}
            direction={isHorizontal ? 'row' : 'column'}
            width="100%"
            height="100%"
            className={`split-layout ${className || ''}`}
            data-testid="split-layout"
        >
            <Box
                className="split-layout__pane split-layout__left"
                style={leftStyle}
            >
                {leftPane}
            </Box>
            
            <Box
                as="div"
                role="separator"
                aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
                aria-valuenow={splitPosition}
                tabIndex={resizable ? 0 : undefined}
                className="split-layout__splitter"
                style={splitterStyle}
                bg="gray.200"
                _hover={resizable ? { bg: 'gray.300' } : {}}
                _active={resizable ? { bg: 'gray.400' } : {}}
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
                aria-label="リサイズハンドル"
            />
            
            <Box
                className="split-layout__pane split-layout__right"
                style={rightStyle}
            >
                {rightPane}
            </Box>
        </Flex>
    );
};

export default SplitLayout;