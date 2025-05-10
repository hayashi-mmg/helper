import { useState, useCallback } from 'react';

interface UseModalReturn {
    /**
     * モーダルが開いているかどうか
     */
    isOpen: boolean;
    /**
     * モーダルを開く関数
     */
    openModal: () => void;
    /**
     * モーダルを閉じる関数
     */
    closeModal: () => void;
    /**
     * モーダルの開閉状態を切り替える関数
     */
    toggleModal: () => void;
}

/**
 * モーダルの開閉状態を管理するカスタムフック
 * 
 * @param initialState - モーダルの初期状態（デフォルトは閉じている）
 * @returns モーダルの状態と操作関数
 */
export const useModal = (initialState = false): UseModalReturn => {
    const [isOpen, setIsOpen] = useState<boolean>(initialState);

    const openModal = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    const toggleModal = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    return { isOpen, openModal, closeModal, toggleModal };
};

export default useModal;
