import { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { action } from '@storybook/addon-actions';
import RegisterForm from './RegisterForm';

const meta: Meta<typeof RegisterForm> = {
    title: 'Organisms/RegisterForm',
    component: RegisterForm,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <BrowserRouter>
                <div style={{ width: '500px' }}>
                    <Story />
                </div>
            </BrowserRouter>
        ),
    ],
    tags: ['autodocs'],
    argTypes: {
        onSuccess: { action: '登録成功' }
    }
};

export default meta;

type Story = StoryObj<typeof RegisterForm>;

// 基本的な登録フォーム
export const Default: Story = {
    args: {
        onSuccess: action('登録成功')
    }
};

// エラーメッセージ付きの登録フォーム
export const WithError: Story = {
    args: {
        externalError: '既に登録されているメールアドレスです。',
        onSuccess: action('登録成功')
    }
};

// ログインリンクなしの登録フォーム
export const WithoutLoginLink: Story = {
    args: {
        showLoginLink: false,
        onSuccess: action('登録成功')
    }
};

// カスタムURLを持つ登録フォーム
export const WithCustomUrls: Story = {
    args: {
        loginUrl: '/custom-login',
        termsUrl: '/custom-terms',
        privacyUrl: '/custom-privacy',
        onSuccess: action('登録成功')
    }
};
