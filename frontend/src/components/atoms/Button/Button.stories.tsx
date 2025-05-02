import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

/**
 * `Button`コンポーネントは、ユーザーのアクションを促すための汎用的なボタンUIを提供します。
 * Material-UIを活用し、様々なスタイルバリエーションとサイズをサポートし、アイコンやローディング状態も表現できます。
 */
const meta: Meta<typeof Button> = {
    title: 'Atoms/Button',
    component: Button,
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['primary', 'secondary', 'outline', 'text'],
            description: 'ボタンの見た目のバリエーション',
        },
        size: {
            control: { type: 'select' },
            options: ['small', 'medium', 'large'],
            description: 'ボタンのサイズ',
        },
        disabled: {
            control: { type: 'boolean' },
            description: 'ボタンの無効状態',
        },
        loading: {
            control: { type: 'boolean' },
            description: 'ローディング状態の表示',
        },
        startIcon: {
            control: false,
            description: 'ボタンの先頭に表示するアイコン',
        },
        endIcon: {
            control: false,
            description: 'ボタンの末尾に表示するアイコン',
        },
        onClick: { action: 'clicked' },
    },
    parameters: {
        docs: {
            description: {
                component: '`Button`コンポーネントは、Material-UIを活用したユーザーのアクションを促すための汎用的なボタンUIを提供します。様々なスタイルバリエーションとサイズをサポートし、アイコンやローディング状態も表現できます。',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * 基本的なプライマリボタンの例です。
 * 主要なアクションに使用します。
 */
export const Primary: Story = {
    args: {
        variant: 'primary',
        children: 'プライマリボタン',
    },
};

/**
 * セカンダリボタンの例です。
 * セカンダリアクションに使用します。
 */
export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'セカンダリボタン',
    },
};

/**
 * アウトラインボタンの例です。
 * 枠線のみのボタンで、控えめなアクションに使用します。
 */
export const Outline: Story = {
    args: {
        variant: 'outline',
        children: 'アウトラインボタン',
    },
};

/**
 * テキストボタンの例です。
 * 最も控えめなボタンで、補助的なアクションに使用します。
 */
export const Text: Story = {
    args: {
        variant: 'text',
        children: 'テキストボタン',
    },
};

/**
 * 小サイズボタンの例です。
 * コンパクトなUIに適したサイズです。
 */
export const Small: Story = {
    args: {
        size: 'small',
        children: '小サイズボタン',
    },
};

/**
 * 中サイズボタンの例です（デフォルト）。
 * 標準的なサイズです。
 */
export const Medium: Story = {
    args: {
        size: 'medium',
        children: '中サイズボタン',
    },
};

/**
 * 大サイズボタンの例です。
 * 大きめのサイズで、重要なアクションに使用します。
 */
export const Large: Story = {
    args: {
        size: 'large',
        children: '大サイズボタン',
    },
};

/**
 * 無効状態のボタンの例です。
 * クリックできず、視覚的に無効であることを示します。
 */
export const Disabled: Story = {
    args: {
        disabled: true,
        children: '無効ボタン',
    },
};

/**
 * ローディング状態のボタンの例です。
 * 自動的に無効化され、ローディングインジケーターが表示されます。
 */
export const Loading: Story = {
    args: {
        loading: true,
        children: '保存中',
    },
};

/**
 * 先頭にアイコンを配置したボタンの例です。
 */
export const WithStartIcon: Story = {
    render: () => (
        <Button startIcon={<SendIcon />}>
            送信
        </Button>
    ),
};

/**
 * 末尾にアイコンを配置したボタンの例です。
 */
export const WithEndIcon: Story = {
    render: () => (
        <Button endIcon={<SendIcon />}>
            送信
        </Button>
    ),
};

/**
 * 複数のバリエーションを一覧表示した例です。
 */
export const AllVariants: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="primary">プライマリ</Button>
            <Button variant="secondary">セカンダリ</Button>
            <Button variant="outline">アウトライン</Button>
            <Button variant="text">テキスト</Button>
        </div>
    ),
};

/**
 * 複数のサイズを一覧表示した例です。
 */
export const AllSizes: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button size="small">小</Button>
            <Button size="medium">中</Button>
            <Button size="large">大</Button>
        </div>
    ),
};

/**
 * アイコン付きボタンの例です。
 */
export const IconButtons: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button variant="primary" startIcon={<AddIcon />}>追加</Button>
            <Button variant="secondary" endIcon={<SendIcon />}>送信</Button>
            <Button variant="outline" startIcon={<CloudUploadIcon />}>アップロード</Button>
        </div>
    ),
};