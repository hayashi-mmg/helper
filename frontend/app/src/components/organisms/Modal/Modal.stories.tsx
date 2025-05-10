import React, { useRef } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Button, Box, Text, Input, VStack, HStack } from '@chakra-ui/react';
import { Modal, useModal } from './index';

/**
 * モーダル/ダイアログコンポーネント
 * 
 * ユーザー操作の確認や入力フォームを表示するためのモーダルコンポーネント。
 * 様々なサイズ、カスタマイズオプション、アクセシビリティ機能を備えています。
 */
const meta: Meta<typeof Modal> = {
    title: 'Organisms/Modal',
    component: Modal,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

// 基本的なモーダル
export const Basic: Story = {
    render: () => {
        const { isOpen, openModal, closeModal } = useModal();
        
        return (
            <>
                <Button onClick={openModal} colorScheme="blue">モーダルを開く</Button>
                <Modal 
                    isOpen={isOpen} 
                    onClose={closeModal}
                    title="基本的なモーダル"
                >
                    <Text>これは基本的なモーダルの内容です。</Text>
                </Modal>
            </>
        );
    }
};

// 異なるサイズのモーダル
export const DifferentSizes: Story = {
    render: () => {
        const smallModal = useModal();
        const mediumModal = useModal();
        const largeModal = useModal();
        const fullModal = useModal();
        
        return (
            <VStack spacing={4} align="flex-start">
                <Button onClick={smallModal.openModal} colorScheme="teal">小さいモーダル</Button>
                <Modal 
                    isOpen={smallModal.isOpen} 
                    onClose={smallModal.closeModal}
                    title="小さいモーダル"
                    size="sm"
                >
                    <Text>これは小さいサイズのモーダルです。</Text>
                </Modal>
                
                <Button onClick={mediumModal.openModal} colorScheme="blue">中サイズモーダル</Button>
                <Modal 
                    isOpen={mediumModal.isOpen} 
                    onClose={mediumModal.closeModal}
                    title="中サイズモーダル"
                    size="md"
                >
                    <Text>これは中サイズのモーダルです。</Text>
                </Modal>
                
                <Button onClick={largeModal.openModal} colorScheme="purple">大きいモーダル</Button>
                <Modal 
                    isOpen={largeModal.isOpen} 
                    onClose={largeModal.closeModal}
                    title="大きいモーダル"
                    size="xl"
                >
                    <Text>これは大きいサイズのモーダルです。</Text>
                </Modal>
                
                <Button onClick={fullModal.openModal} colorScheme="red">全画面モーダル</Button>
                <Modal 
                    isOpen={fullModal.isOpen} 
                    onClose={fullModal.closeModal}
                    title="全画面モーダル"
                    size="full"
                >
                    <VStack h="80vh" justify="center" align="center">
                        <Text fontSize="2xl">これは全画面モーダルです。</Text>
                        <Button mt={4} onClick={fullModal.closeModal}>閉じる</Button>
                    </VStack>
                </Modal>
            </VStack>
        );
    }
};

// カスタムフッター付きモーダル
export const WithFooter: Story = {
    render: () => {
        const { isOpen, openModal, closeModal } = useModal();
        
        return (
            <>
                <Button onClick={openModal} colorScheme="green">カスタムフッター付きモーダル</Button>
                <Modal 
                    isOpen={isOpen} 
                    onClose={closeModal}
                    title="確認ダイアログ"
                    footer={
                        <HStack spacing={4}>
                            <Button variant="outline" onClick={closeModal}>キャンセル</Button>
                            <Button colorScheme="green" onClick={closeModal}>保存</Button>
                        </HStack>
                    }
                >
                    <Text>カスタムフッターを持つモーダルの例です。</Text>
                </Modal>
            </>
        );
    }
};

// フォーム入力モーダル
export const FormModal: Story = {
    render: () => {
        const { isOpen, openModal, closeModal } = useModal();
        const initialRef = useRef<HTMLInputElement>(null);
        
        return (
            <>
                <Button onClick={openModal} colorScheme="cyan">フォーム入力モーダル</Button>
                <Modal 
                    isOpen={isOpen} 
                    onClose={closeModal}
                    title="ユーザー情報入力"
                    initialFocusRef={initialRef}
                    footer={
                        <HStack spacing={4}>
                            <Button variant="outline" onClick={closeModal}>キャンセル</Button>
                            <Button colorScheme="cyan" onClick={closeModal}>送信</Button>
                        </HStack>
                    }
                >
                    <VStack spacing={4} align="stretch">
                        <Box>
                            <Text mb={2}>名前</Text>
                            <Input ref={initialRef} placeholder="名前を入力" />
                        </Box>
                        <Box>
                            <Text mb={2}>メールアドレス</Text>
                            <Input placeholder="メールアドレスを入力" />
                        </Box>
                    </VStack>
                </Modal>
            </>
        );
    }
};

// カスタム背景不透明度
export const CustomOverlay: Story = {
    render: () => {
        const { isOpen, openModal, closeModal } = useModal();
        
        return (
            <>
                <Button onClick={openModal} colorScheme="orange">濃い背景のモーダル</Button>
                <Modal 
                    isOpen={isOpen} 
                    onClose={closeModal}
                    title="濃い背景"
                    overlayOpacity={0.8}
                >
                    <Text>背景の不透明度を高くしたモーダルの例です。</Text>
                </Modal>
            </>
        );
    }
};

// ヘッダーなしモーダル
export const NoHeader: Story = {
    render: () => {
        const { isOpen, openModal, closeModal } = useModal();
        
        return (
            <>
                <Button onClick={openModal} colorScheme="pink">ヘッダーなしモーダル</Button>
                <Modal 
                    isOpen={isOpen} 
                    onClose={closeModal}
                    hideHeader={true}
                >
                    <VStack spacing={4} align="stretch">
                        <Text fontSize="xl" fontWeight="bold">カスタムコンテンツ</Text>
                        <Text>ヘッダーのないモーダルの例です。タイトルが必要な場合は、コンテンツ内に直接配置できます。</Text>
                        <Button mt={4} onClick={closeModal}>閉じる</Button>
                    </VStack>
                </Modal>
            </>
        );
    }
};
