import { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { action } from '@storybook/addon-actions';
import AuthStatus from './AuthStatus';

// Storybookでのモックのため
import { useState, useEffect } from 'react';

// ストアのモックを設定するためのデコレータ
const AuthStatusDecorator = (Story, context) => {
    // パラメータからモックデータを取得
    const mockAuthData = context.parameters.mockAuthData || {
        isAuthenticated: false,
        user: null,
    };
    
    // モックのログアウト関数
    const mockLogout = action('ログアウト実行');
    
    // グローバルモックを設定
    window.useAuthStoreMock = {
        ...mockAuthData,
        logout: mockLogout,
    };
    
    return (
        <BrowserRouter>
            <div style={{ padding: '16px', maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Story />
                </div>
            </div>
        </BrowserRouter>
    );
};

const meta: Meta<typeof AuthStatus> = {
    title: 'Molecules/AuthStatus',
    component: AuthStatus,
    parameters: {
        layout: 'fullscreen',
    },
    decorators: [AuthStatusDecorator],
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'radio',
            options: ['sm', 'md', 'lg'],
        },
        forceMobile: {
            control: 'boolean',
        },
    },
};

export default meta;

type Story = StoryObj<typeof AuthStatus>;

// 未認証状態
export const Unauthenticated: Story = {
    args: {
        size: 'md',
        forceMobile: false,
    },
    parameters: {
        mockAuthData: {
            isAuthenticated: false,
            user: null,
        },
        docs: {
            description: {
                story: '未認証状態では、ログインと会員登録ボタンが表示されます。',
            },
        },
    },
};

// 未認証状態（モバイル）
export const UnauthenticatedMobile: Story = {
    args: {
        size: 'md',
        forceMobile: true,
    },
    parameters: {
        mockAuthData: {
            isAuthenticated: false,
            user: null,
        },
        docs: {
            description: {
                story: 'モバイル表示では、アイコンボタンと簡略化された登録ボタンが表示されます。',
            },
        },
    },
};

// 認証済み状態
export const Authenticated: Story = {
    args: {
        size: 'md',
        forceMobile: false,
    },
    parameters: {
        mockAuthData: {
            isAuthenticated: true,
            user: {
                id: '1',
                name: 'テストユーザー',
                email: 'test@example.com',
                role: 'user',
            },
        },
        docs: {
            description: {
                story: '認証済み状態では、ユーザーアバターとメニューが表示されます。',
            },
        },
    },
};

// 認証済み状態（モバイル）
export const AuthenticatedMobile: Story = {
    args: {
        size: 'md',
        forceMobile: true,
    },
    parameters: {
        mockAuthData: {
            isAuthenticated: true,
            user: {
                id: '1',
                name: 'テストユーザー',
                email: 'test@example.com',
                role: 'user',
            },
        },
        docs: {
            description: {
                story: 'モバイル表示では、ユーザー名を非表示にしてアバターのみを表示します。',
            },
        },
    },
};

// 小サイズ
export const Small: Story = {
    args: {
        size: 'sm',
        forceMobile: false,
    },
    parameters: {
        mockAuthData: {
            isAuthenticated: true,
            user: {
                id: '1',
                name: 'テストユーザー',
                email: 'test@example.com',
                role: 'user',
            },
        },
        docs: {
            description: {
                story: '小サイズでは、コンポーネントの全体的なサイズが小さくなります。',
            },
        },
    },
};

// 大サイズ
export const Large: Story = {
    args: {
        size: 'lg',
        forceMobile: false,
    },
    parameters: {
        mockAuthData: {
            isAuthenticated: true,
            user: {
                id: '1',
                name: 'テストユーザー',
                email: 'test@example.com',
                role: 'user',
            },
        },
        docs: {
            description: {
                story: '大サイズでは、コンポーネントの全体的なサイズが大きくなります。',
            },
        },
    },
};
