import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentContainer } from '../ContentContainer';

describe('ContentContainer', () => {
  it('renders children correctly', () => {
    render(
      <ContentContainer>
        <div>テストコンテンツ</div>
      </ContentContainer>
    );
    
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
  });
  
  it('applies maxWidth classes correctly', () => {
    const { rerender } = render(
      <ContentContainer maxWidth="xs">
        コンテンツ
      </ContentContainer>
    );
    
    let container = screen.getByText('コンテンツ').closest('.content-container');
    expect(container).toHaveClass('max-width-xs');
    
    // max-width-sm のテスト
    rerender(
      <ContentContainer maxWidth="sm">
        コンテンツ
      </ContentContainer>
    );
    container = screen.getByText('コンテンツ').closest('.content-container');
    expect(container).toHaveClass('max-width-sm');
    
    // max-width-md のテスト
    rerender(
      <ContentContainer maxWidth="md">
        コンテンツ
      </ContentContainer>
    );
    container = screen.getByText('コンテンツ').closest('.content-container');
    expect(container).toHaveClass('max-width-md');
    
    // max-width-lg のテスト (デフォルト)
    rerender(
      <ContentContainer>
        コンテンツ
      </ContentContainer>
    );
    container = screen.getByText('コンテンツ').closest('.content-container');
    expect(container).toHaveClass('max-width-lg');
    
    // max-width-xl のテスト
    rerender(
      <ContentContainer maxWidth="xl">
        コンテンツ
      </ContentContainer>
    );
    container = screen.getByText('コンテンツ').closest('.content-container');
    expect(container).toHaveClass('max-width-xl');
    
    // max-width-full のテスト
    rerender(
      <ContentContainer maxWidth="full">
        コンテンツ
      </ContentContainer>
    );
    container = screen.getByText('コンテンツ').closest('.content-container');
    expect(container).toHaveClass('max-width-full');
  });
  
  it('applies padding classes correctly', () => {
    const { rerender } = render(
      <ContentContainer>
        コンテンツ
      </ContentContainer>
    );
    
    // デフォルトではパディングが適用されている
    let container = screen.getByText('コンテンツ').closest('.content-container');
    expect(container).toHaveClass('with-horizontal-padding');
    expect(container).toHaveClass('with-vertical-padding');
    
    // 水平パディングなし
    rerender(
      <ContentContainer withHorizontalPadding={false}>
        コンテンツ
      </ContentContainer>
    );
    container = screen.getByText('コンテンツ').closest('.content-container');
    expect(container).not.toHaveClass('with-horizontal-padding');
    expect(container).toHaveClass('with-vertical-padding');
    
    // 垂直パディングなし
    rerender(
      <ContentContainer withVerticalPadding={false}>
        コンテンツ
      </ContentContainer>
    );
    container = screen.getByText('コンテンツ').closest('.content-container');
    expect(container).toHaveClass('with-horizontal-padding');
    expect(container).not.toHaveClass('with-vertical-padding');
    
    // 両方のパディングなし
    rerender(
      <ContentContainer withHorizontalPadding={false} withVerticalPadding={false}>
        コンテンツ
      </ContentContainer>
    );
    container = screen.getByText('コンテンツ').closest('.content-container');
    expect(container).not.toHaveClass('with-horizontal-padding');
    expect(container).not.toHaveClass('with-vertical-padding');
  });
  
  it('applies centered class correctly', () => {
    const { rerender } = render(
      <ContentContainer>
        コンテンツ
      </ContentContainer>
    );
    
    // デフォルトでは中央配置
    let container = screen.getByText('コンテンツ').closest('.content-container');
    expect(container).toHaveClass('centered');
    
    // 中央配置なし
    rerender(
      <ContentContainer centered={false}>
        コンテンツ
      </ContentContainer>
    );
    container = screen.getByText('コンテンツ').closest('.content-container');
    expect(container).not.toHaveClass('centered');
  });
  
  it('applies additional className correctly', () => {
    render(
      <ContentContainer className="custom-class">
        コンテンツ
      </ContentContainer>
    );
    
    const container = screen.getByText('コンテンツ').closest('.content-container');
    expect(container).toHaveClass('custom-class');
  });
  
  it('combines all classes correctly', () => {
    render(
      <ContentContainer
        maxWidth="sm"
        withHorizontalPadding={true}
        withVerticalPadding={false}
        centered={true}
        className="custom-class"
      >
        コンテンツ
      </ContentContainer>
    );
    
    const container = screen.getByText('コンテンツ').closest('.content-container');
    expect(container).toHaveClass('content-container');
    expect(container).toHaveClass('max-width-sm');
    expect(container).toHaveClass('with-horizontal-padding');
    expect(container).not.toHaveClass('with-vertical-padding');
    expect(container).toHaveClass('centered');
    expect(container).toHaveClass('custom-class');
  });
});
