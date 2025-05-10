import { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { action } from '@storybook/addon-actions';
import LoginForm from './LoginForm';

const meta: Meta<typeof LoginForm> = {
    title: 'Organisms/LoginForm',
    component: LoginForm,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <BrowserRouter>
                <div style={{ width: '400px' }}>
                    <Story />
                </div>
            </BrowserRouter>
        ),
    ],
    tags: ['autodocs'],
    argTypes: {
        onSuccess: { action: 'ログイン成功' }
    }
};

export default meta;

type Story = StoryObj<typeof LoginForm>;

// 基本的なログインフォーム
export const Default: Story = {
    args: {
        onSuccess: action('ログイン成功')
    }
};

// エラーメッセージ付きのログインフォーム
export const WithError: Story = {
    args: {
        externalError: 'メールアドレスまたはパスワードが正しくありません。',
        onSuccess: action('ログイン成功')
    }
};

// パスワードリセットリンクなしのログインフォーム
export const WithoutForgotPassword: Story = {
    args: {
        showForgotPassword: false,
        onSuccess: action('ログイン成功')
    }
};

// 会員登録リンクなしのログインフォーム
export const WithoutSignUpLink: Story = {
    args: {
        showSignUpLink: false,
        onSuccess: action('ログイン成功')
    }
};

// リンクなしのログインフォーム
export const WithoutLinks: Story = {
    args: {
        showForgotPassword: false,
        showSignUpLink: false,
        onSuccess: action('ログイン成功')
    }
};

// カスタムURLを持つログインフォーム
export const WithCustomUrls: Story = {
    args: {
        signUpUrl: '/custom-register',
        forgotPasswordUrl: '/custom-reset',
        onSuccess: action('ログイン成功')
    }
};
