import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { FiUser, FiArrowRight } from 'react-icons/fi';
import Button from './Button';

// Storybookのメタデータ
const meta = {
    title: 'Components/Atoms/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    // Buttonコンポーネントが受け取るProps
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'light', 'dark', 'link'],
            description: 'ボタンのカラーバリエーション',
            defaultValue: 'primary',
        },
        size: {
            control: 'radio',
            options: ['small', 'medium', 'large'],
            description: 'ボタンのサイズ',
            defaultValue: 'medium',
        },
        outline: {
            control: 'boolean',
            description: 'アウトラインスタイルを適用するかどうか',
            defaultValue: false,
        },
        fullWidth: {
            control: 'boolean',
            description: 'ボタンを全幅で表示するかどうか',
            defaultValue: false,
        },
        disabled: {
            control: 'boolean',
            description: 'ボタンを無効状態にするかどうか',
            defaultValue: false,
        },
        onClick: { action: 'clicked' },
        children: {
            control: 'text',
            description: 'ボタン内のテキストコンテンツ',
        },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基本的なボタン
export const Default: Story = {
    args: {
        children: 'ボタン',
    },
};

// プライマリボタン
export const Primary: Story = {
    args: {
        variant: 'primary',
        children: 'プライマリ',
    },
};

// セカンダリボタン
export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'セカンダリ',
    },
};

// 成功ボタン
export const Success: Story = {
    args: {
        variant: 'success',
        children: '成功',
    },
};

// 警告ボタン
export const Warning: Story = {
    args: {
        variant: 'warning',
        children: '警告',
    },
};

// 危険ボタン
export const Danger: Story = {
    args: {
        variant: 'danger',
        children: '危険',
    },
};

// アウトラインボタン
export const Outline: Story = {
    args: {
        variant: 'primary',
        outline: true,
        children: 'アウトライン',
    },
};

// サイズバリエーション
export const Sizes: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Button size="small">小</Button>
            <Button size="medium">中</Button>
            <Button size="large">大</Button>
        </div>
    ),
};

// 全幅ボタン
export const FullWidth: Story = {
    args: {
        fullWidth: true,
        children: '全幅ボタン',
    },
    parameters: {
        layout: 'padded',
    },
};

// 無効状態ボタン
export const Disabled: Story = {
    args: {
        disabled: true,
        children: '無効状態',
    },
};

// アイコン付きボタン
export const WithIcons: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <Button startIcon={<FiUser />}>ユーザー</Button>
            <Button endIcon={<FiArrowRight />}>続行</Button>
            <Button startIcon={<FiUser />} endIcon={<FiArrowRight />}>両方</Button>
        </div>
    ),
};

// リンクボタン
export const AsLink: Story = {
    args: {
        href: 'https://example.com',
        target: '_blank',
        rel: 'noopener noreferrer',
        children: '外部リンク',
    },
};

// ルーターリンクボタン
export const AsRouterLink: Story = {
    args: {
        to: '/dashboard',
        children: '内部リンク',
    },
    decorators: [
        (Story) => (
            <BrowserRouter>
                <Story />
            </BrowserRouter>
        ),
    ],
};

// すべてのバリエーション
export const AllVariants: Story = {
    render: () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Button variant="primary">プライマリ</Button>
            <Button variant="primary" outline>プライマリアウトライン</Button>
            
            <Button variant="secondary">セカンダリ</Button>
            <Button variant="secondary" outline>セカンダリアウトライン</Button>
            
            <Button variant="success">成功</Button>
            <Button variant="success" outline>成功アウトライン</Button>
            
            <Button variant="warning">警告</Button>
            <Button variant="warning" outline>警告アウトライン</Button>
            
            <Button variant="danger">危険</Button>
            <Button variant="danger" outline>危険アウトライン</Button>
            
            <Button variant="info">情報</Button>
            <Button variant="info" outline>情報アウトライン</Button>
            
            <Button variant="light">ライト</Button>
            <Button variant="light" outline>ライトアウトライン</Button>
            
            <Button variant="dark">ダーク</Button>
            <Button variant="dark" outline>ダークアウトライン</Button>
            
            <Button variant="link">リンク</Button>
            <Button variant="link" outline>リンクアウトライン</Button>
        </div>
    ),
    parameters: {
        layout: 'padded',
    },
};