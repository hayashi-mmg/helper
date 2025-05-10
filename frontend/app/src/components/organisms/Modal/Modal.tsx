import React, { ReactNode, useEffect, useRef } from 'react';
import {
    Modal as ChakraModal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    Box,
} from '@chakra-ui/react';

export interface ModalProps {
    /**
     * モーダルのタイトル
     */
    title?: string;
    /**
     * モーダルの内容
     */
    children: ReactNode;
    /**
     * モーダルのフッターコンテンツ
     */
    footer?: ReactNode;
    /**
     * モーダルが開いているかどうか
     */
    isOpen: boolean;
    /**
     * モーダルを閉じる関数
     */
    onClose: () => void;
    /**
     * モーダルのサイズ
     */
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    /**
     * 背景クリックでモーダルを閉じるかどうか
     */
    closeOnOverlayClick?: boolean;
    /**
     * ESCキーでモーダルを閉じるかどうか
     */
    closeOnEsc?: boolean;
    /**
     * モーダルのヘッダーを非表示にするかどうか
     */
    hideHeader?: boolean;
    /**
     * モーダルの閉じるボタンを非表示にするかどうか
     */
    hideCloseButton?: boolean;
    /**
     * モーダルの背景の不透明度
     */
    overlayOpacity?: number;
    /**
     * モーダルを開く前に実行するコールバック
     */
    onBeforeOpen?: () => void;
    /**
     * モーダルを閉じる前に実行するコールバック
     */
    onBeforeClose?: () => void;
    /**
     * モーダルが開いた後に実行するコールバック
     */
    onAfterOpen?: () => void;
    /**
     * モーダルが閉じた後に実行するコールバック
     */
    onAfterClose?: () => void;
    /**
     * モーダルのz-index
     */
    zIndex?: number;
    /**
     * カスタムクラス名
     */
    className?: string;
    /**
     * カスタムスタイル
     */
    style?: React.CSSProperties;
    /**
     * モーダルの初期フォーカス要素
     */
    initialFocusRef?: React.RefObject<HTMLElement>;
    /**
     * モーダル閉じた後にフォーカスする要素
     */
    finalFocusRef?: React.RefObject<HTMLElement>;
}

/**
 * モーダル/ダイアログコンポーネント
 * 
 * ユーザー操作の確認や入力フォームを表示するためのモーダルコンポーネント。
 * 様々なサイズ、カスタマイズオプション、アクセシビリティ機能を備えています。
 */
export const Modal: React.FC<ModalProps> = ({
    title,
    children,
    footer,
    isOpen,
    onClose,
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEsc = true,
    hideHeader = false,
    hideCloseButton = false,
    overlayOpacity = 0.4,
    onBeforeOpen,
    onBeforeClose,
    onAfterOpen,
    onAfterClose,
    zIndex,
    className,
    style,
    initialFocusRef,
    finalFocusRef,
}) => {
    // 前回のisOpenの値を保持するためのref
    const prevIsOpenRef = useRef(isOpen);

    // ライフサイクルメソッド呼び出し
    useEffect(() => {
        // 開く前
        if (!prevIsOpenRef.current && isOpen && onBeforeOpen) {
            onBeforeOpen();
        }

        // 閉じる前
        if (prevIsOpenRef.current && !isOpen && onBeforeClose) {
            onBeforeClose();
        }

        // 開いた後
        if (!prevIsOpenRef.current && isOpen && onAfterOpen) {
            onAfterOpen();
        }

        // 閉じた後
        if (prevIsOpenRef.current && !isOpen && onAfterClose) {
            onAfterClose();
        }

        // 現在の状態を保存
        prevIsOpenRef.current = isOpen;
    }, [isOpen, onBeforeOpen, onBeforeClose, onAfterOpen, onAfterClose]);

    // モーダルが開いている間はbodyのスクロールを無効化
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const overlayStyle = {
        bg: `rgba(0, 0, 0, ${overlayOpacity})`,
    };

    const contentStyle = {
        ...(style || {}),
    };

    return (
        <ChakraModal
            isOpen={isOpen}
            onClose={onClose}
            size={size}
            closeOnOverlayClick={closeOnOverlayClick}
            closeOnEsc={closeOnEsc}
            initialFocusRef={initialFocusRef}
            finalFocusRef={finalFocusRef}
            isCentered
            motionPreset="scale"
            zIndex={zIndex}
        >
            <ModalOverlay {...overlayStyle} />
            <ModalContent className={className} sx={contentStyle} data-testid="modal-content">
                {!hideHeader && title && (
                    <ModalHeader data-testid="modal-header">{title}</ModalHeader>
                )}
                {!hideCloseButton && <ModalCloseButton data-testid="modal-close-button" />}
                <ModalBody data-testid="modal-body">{children}</ModalBody>
                {footer && <ModalFooter data-testid="modal-footer">{footer}</ModalFooter>}
            </ModalContent>
        </ChakraModal>
    );
};

export default Modal;
