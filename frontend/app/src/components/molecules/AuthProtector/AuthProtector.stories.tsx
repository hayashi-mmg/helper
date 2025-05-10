import { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthProtector from './AuthProtector';

// ストアのモックを設定するためのデコレータ
const mockAuthStore = (isAuthenticated: boolean, user: any = null) => {
    // 実際のStorybook環境ではグローバル変数として他のコンポーネントに影響を与えるため注意
    const mockStore = {
        isAuthenticated,
        user,
    };
    
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    jest.mock('../../../store/useAuthStore', () => ({
        useAuthStore: (selector) => {
            if (typeof selector === 'function') {
                return selector(mockStore);
            }
            return mockStore;
        },
    }));
    
    return (Story) => <Story />;
};

const meta: Meta<typeof AuthProtector> = {
    title: 'Molecules/AuthProtector',
    component: AuthProtector,
    parameters: {
        layout: 'padded',
    },
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/login" element={<div>ログインページ</div>} />
                    <Route path="/unauthorized" element={<div>権限がありません</div>} />
                    <Route path="/protected" element={<Story />} />
                </Routes>
            </MemoryRouter>
        ),
    ],
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AuthProtector>;

// 認証済みユーザー（コンテンツ表示）
export const Authenticated: Story = {
    args: {
        children: <div>保護されたコンテンツ</div>,
        redirectTo: '/login',
    },
    parameters: {
        docs: {
            description: {
                story: '認証済みのユーザーには、保護されたコンテンツが表示されます。',
            },
        },
        mockData: [
            {
                match: {
                    selector: (state) => state.isAuthenticated,
                },
                value: true,
            },
            {
                match: {
                    selector: (state) => state.user,
                },
                value: { id: '1', email: 'test@example.com', name: 'テストユーザー', role: 'user' },
            },
        ],
    },
};

// 未認証ユーザー（リダイレクト）
export const Unauthenticated: Story = {
    args: {
        children: <div>保護されたコンテンツ</div>,
        redirectTo: '/login',
    },
    parameters: {
        docs: {
            description: {
                story: '未認証のユーザーは、ログインページにリダイレクトされます。',
            },
        },
        mockData: [
            {
                match: {
                    selector: (state) => state.isAuthenticated,
                },
                value: false,
            },
            {
                match: {
                    selector: (state) => state.user,
                },
                value: null,
            },
        ],
    },
};

// カスタムリダイレクト
export const CustomRedirect: Story = {
    args: {
        children: <div>保護されたコンテンツ</div>,
        redirectTo: '/custom-login',
    },
    parameters: {
        docs: {
            description: {
                story: '未認証のユーザーは、指定したカスタムログインページにリダイレクトされます。',
            },
        },
        mockData: [
            {
                match: {
                    selector: (state) => state.isAuthenticated,
                },
                value: false,
            },
        ],
    },
};

// ロールベースのアクセス制御（管理者のみ）
export const AdminOnly: Story = {
    args: {
        children: <div>管理者専用コンテンツ</div>,
        requiredRole: 'admin',
    },
    parameters: {
        docs: {
            description: {
                story: '管理者ロールを持つユーザーのみがアクセス可能です。他のユーザーは権限不足ページにリダイレクトされます。',
            },
        },
        mockData: [
            {
                match: {
                    selector: (state) => state.isAuthenticated,
                },
                value: true,
            },
            {
                match: {
                    selector: (state) => state.user,
                },
                value: { id: '1', email: 'user@example.com', name: '一般ユーザー', role: 'user' },
            },
        ],
    },
};

// 管理者ユーザーがアクセス
export const AdminAccess: Story = {
    args: {
        children: <div>管理者専用コンテンツ</div>,
        requiredRole: 'admin',
    },
    parameters: {
        docs: {
            description: {
                story: '管理者ユーザーは、管理者専用コンテンツにアクセスできます。',
            },
        },
        mockData: [
            {
                match: {
                    selector: (state) => state.isAuthenticated,
                },
                value: true,
            },
            {
                match: {
                    selector: (state) => state.user,
                },
                value: { id: '2', email: 'admin@example.com', name: '管理者', role: 'admin' },
            },
        ],
    },
};
