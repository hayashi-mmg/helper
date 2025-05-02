import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthLayout } from '../AuthLayout';

describe('AuthLayout', () => {
  it('renders children correctly', () => {
    render(
      <AuthLayout>
        <div>認証フォーム</div>
      </AuthLayout>
    );
    
    expect(screen.getByText('認証フォーム')).toBeInTheDocument();
  });
  
  it('renders logo when showLogo is true', () => {
    render(
      <AuthLayout showLogo={true}>
        <div>認証フォーム</div>
      </AuthLayout>
    );
    
    expect(screen.getByLabelText('ロゴ')).toBeInTheDocument();
  });
  
  it('does not render logo when showLogo is false', () => {
    render(
      <AuthLayout showLogo={false}>
        <div>認証フォーム</div>
      </AuthLayout>
    );
    
    expect(screen.queryByLabelText('ロゴ')).not.toBeInTheDocument();
  });
  
  it('renders title when provided', () => {
    render(
      <AuthLayout title="ログイン">
        <div>認証フォーム</div>
      </AuthLayout>
    );
    
    expect(screen.getByText('ログイン')).toBeInTheDocument();
    expect(screen.getByText('ログイン').tagName).toBe('H1');
  });
  
  it('does not render title when not provided', () => {
    render(
      <AuthLayout>
        <div>認証フォーム</div>
      </AuthLayout>
    );
    
    const headings = document.querySelectorAll('h1');
    expect(headings.length).toBe(0);
  });
  
  it('renders footer content when provided', () => {
    render(
      <AuthLayout footerContent={<div>フッターコンテンツ</div>}>
        <div>認証フォーム</div>
      </AuthLayout>
    );
    
    expect(screen.getByText('フッターコンテンツ')).toBeInTheDocument();
  });
  
  it('does not render footer when not provided', () => {
    render(
      <AuthLayout>
        <div>認証フォーム</div>
      </AuthLayout>
    );
    
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });
  
  it('applies background image when provided', () => {
    render(
      <AuthLayout backgroundImage="/images/bg.jpg">
        <div>認証フォーム</div>
      </AuthLayout>
    );
    
    const container = screen.getByText('認証フォーム').closest('.auth-layout');
    expect(container).toHaveClass('with-background');
    expect(container).toHaveStyle('background-image: url(/images/bg.jpg)');
  });
  
  it('does not apply background image when not provided', () => {
    render(
      <AuthLayout>
        <div>認証フォーム</div>
      </AuthLayout>
    );
    
    const container = screen.getByText('認証フォーム').closest('.auth-layout');
    expect(container).not.toHaveClass('with-background');
    expect(container).not.toHaveStyle('background-image: url(/images/bg.jpg)');
  });
  
  it('applies additional className correctly', () => {
    render(
      <AuthLayout className="custom-auth">
        <div>認証フォーム</div>
      </AuthLayout>
    );
    
    const container = screen.getByText('認証フォーム').closest('.auth-layout');
    expect(container).toHaveClass('custom-auth');
  });
  
  it('renders nested structure correctly', () => {
    render(
      <AuthLayout title="ログイン">
        <div>認証フォーム</div>
      </AuthLayout>
    );
    
    // auth-layout > auth-layout__card > auth-layout__content の構造になっていることを確認
    const authLayout = screen.getByText('認証フォーム').closest('.auth-layout');
    const card = authLayout?.querySelector('.auth-layout__card');
    const content = card?.querySelector('.auth-layout__content');
    
    expect(authLayout).toBeInTheDocument();
    expect(card).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(content).toContainHTML('<div>認証フォーム</div>');
  });
});
