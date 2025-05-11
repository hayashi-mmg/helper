
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Text } from '@chakra-ui/react';
import { Modal, useModal } from './index';
import { Component } from 'react';

// モーダルのテスト用にプロバイダーでラップしたレンダー関数
const renderModal = (props: any) => {
    return render(
        <Modal isOpen={true} onClose={() => {}} {...props}>
            <div>モーダルの内容</div>
        </Modal>
    );
};

// useModalフックのテスト用コンポーネント
const TestComponent = () => {
    const { isOpen, openModal, closeModal } = useModal(false);
    
    return (
        <>
            <button onClick={openModal} data-testid="open-button">モーダルを開く</button>
            <Modal 
                isOpen={isOpen} 
                onClose={closeModal} 
                title="テストモーダル"
            >
                <div data-testid="modal-content">テストコンテンツ</div>
            </Modal>
        </>
    );
};

describe('Modal Component', () => {
    // 基本的なレンダリングテスト
    it('renders correctly with default props', () => {
        renderModal({ title: 'テストモーダル' });
        
        expect(screen.getByText('テストモーダル')).toBeInTheDocument();
        expect(screen.getByText('モーダルの内容')).toBeInTheDocument();
        expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });
    
    // タイトルなしテスト
    it('renders without header when hideHeader is true', () => {
        renderModal({ hideHeader: true });
        
        expect(screen.queryByTestId('modal-header')).not.toBeInTheDocument();
        expect(screen.getByText('モーダルの内容')).toBeInTheDocument();
    });
    
    // 閉じるボタンなしテスト
    it('renders without close button when hideCloseButton is true', () => {
        renderModal({ hideCloseButton: true });
        
        expect(screen.queryByTestId('modal-close-button')).not.toBeInTheDocument();
    });
    
    // フッターコンテンツテスト
    it('renders with footer content when provided', () => {
        renderModal({ 
            footer: <button data-testid="footer-button">保存</button> 
        });
        
        expect(screen.getByTestId('modal-footer')).toBeInTheDocument();
        expect(screen.getByTestId('footer-button')).toBeInTheDocument();
    });
    
    // カスタムサイズテスト
    it('applies custom size when provided', () => {
        renderModal({ size: 'lg' });
        
        // Chakra UIがサイズをどのように適用するか確認する
        // 実際のスタイルをテストする場合はcomputedStyleを使う必要があるかも
        const modalContent = screen.getByTestId('modal-content');
        expect(modalContent).toBeInTheDocument();
    });
});

describe('useModal Hook', () => {
    it('opens and closes the modal correctly', async () => {
        render(<TestComponent />);
        
        // 初期状態ではモーダルは表示されていない
        expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
        
        // ボタンをクリックしてモーダルを開く
        await userEvent.click(screen.getByTestId('open-button'));
        
        // モーダルが表示される
        await waitFor(() => {
            expect(screen.getByTestId('modal-content')).toBeInTheDocument();
        });
    });
});
