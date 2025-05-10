import { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { action } from '@storybook/addon-actions';
import PasswordResetForm from './PasswordResetForm';

const meta: Meta<typeof PasswordResetForm> = {
    title: 'Organisms/PasswordResetForm',
    component: PasswordResetForm,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <BrowserRouter>
                <div style={{ width: '450px' }}>
                    <Story />
                </div>
            </BrowserRouter>
        ),
    ],
    tags: ['autodocs'],
    argTypes: {
        onSuccess: { action: 'パスワードリセットメール送信成功' }
    }
};

export default meta;

type Story = StoryObj<typeof PasswordResetForm>;

// 基本的なパスワードリセットフォーム
export const Default: Story = {
    args: {
        onSuccess: action('パスワードリセットメール送信成功')
    }
};

// エラーメッセージ付きのパスワードリセットフォーム
export const WithError: Story = {
    args: {
        externalError: '登録されていないメールアドレスです。',
        onSuccess: action('パスワードリセットメール送信成功')
    }
};

// カスタムURLを持つパスワードリセットフォーム
export const WithCustomUrls: Story = {
    args: {
        loginUrl: '/custom-login',
        registerUrl: '/custom-register',
        onSuccess: action('パスワードリセットメール送信成功')
    }
};
