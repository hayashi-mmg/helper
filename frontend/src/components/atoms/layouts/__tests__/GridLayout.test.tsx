import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GridLayout, GridItem } from '../GridLayout';

describe('GridLayout', () => {
  it('renders children correctly', () => {
    render(
      <GridLayout>
        <div>アイテム1</div>
        <div>アイテム2</div>
      </GridLayout>
    );
    
    expect(screen.getByText('アイテム1')).toBeInTheDocument();
    expect(screen.getByText('アイテム2')).toBeInTheDocument();
  });
  
  it('applies columns prop correctly to style', () => {
    render(
      <GridLayout columns={6}>
        <div>テストコンテンツ</div>
      </GridLayout>
    );
    
    const gridElement = screen.getByText('テストコンテンツ').parentElement;
    expect(gridElement).toHaveStyle('grid-template-columns: repeat(6, 1fr)');
  });
  
  it('applies gap prop correctly to style when number', () => {
    render(
      <GridLayout gap={24}>
        <div>テストコンテンツ</div>
      </GridLayout>
    );
    
    const gridElement = screen.getByText('テストコンテンツ').parentElement;
    expect(gridElement).toHaveStyle('gap: 24px');
  });
  
  it('applies gap prop correctly to style when object', () => {
    render(
      <GridLayout gap={{ x: 16, y: 32 }}>
        <div>テストコンテンツ</div>
      </GridLayout>
    );
    
    const gridElement = screen.getByText('テストコンテンツ').parentElement;
    expect(gridElement).toHaveStyle('column-gap: 16px');
    expect(gridElement).toHaveStyle('row-gap: 32px');
  });
  
  it('applies responsive custom properties correctly', () => {
    render(
      <GridLayout responsive={{ sm: 2, md: 3, lg: 4, xl: 6 }}>
        <div>テストコンテンツ</div>
      </GridLayout>
    );
    
    const gridElement = screen.getByText('テストコンテンツ').parentElement;
    
    // CSSカスタムプロパティの検証は難しいので、スタイル属性に設定されていることを確認
    const style = gridElement?.getAttribute('style');
    expect(style).toContain('--grid-columns-sm: 2');
    expect(style).toContain('--grid-columns-md: 3');
    expect(style).toContain('--grid-columns-lg: 4');
    expect(style).toContain('--grid-columns-xl: 6');
  });
  
  it('applies autoRows class correctly', () => {
    const { rerender } = render(
      <GridLayout>
        <div>テストコンテンツ</div>
      </GridLayout>
    );
    
    // デフォルトではauto-rowsクラスが適用されている
    let gridElement = screen.getByText('テストコンテンツ').parentElement;
    expect(gridElement).toHaveClass('auto-rows');
    
    // autoRows=falseの場合
    rerender(
      <GridLayout autoRows={false}>
        <div>テストコンテンツ</div>
      </GridLayout>
    );
    
    gridElement = screen.getByText('テストコンテンツ').parentElement;
    expect(gridElement).not.toHaveClass('auto-rows');
  });
  
  it('applies additional className correctly', () => {
    render(
      <GridLayout className="custom-grid">
        <div>テストコンテンツ</div>
      </GridLayout>
    );
    
    const gridElement = screen.getByText('テストコンテンツ').parentElement;
    expect(gridElement).toHaveClass('custom-grid');
  });
});

describe('GridItem', () => {
  it('renders children correctly', () => {
    render(
      <GridLayout>
        <GridItem>
          <div>アイテムコンテンツ</div>
        </GridItem>
      </GridLayout>
    );
    
    expect(screen.getByText('アイテムコンテンツ')).toBeInTheDocument();
  });
  
  it('applies colSpan prop correctly to style when number', () => {
    render(
      <GridLayout>
        <GridItem colSpan={6}>
          <div>アイテムコンテンツ</div>
        </GridItem>
      </GridLayout>
    );
    
    const gridItemElement = screen.getByText('アイテムコンテンツ').closest('.grid-item');
    expect(gridItemElement).toHaveStyle('grid-column: span 6');
  });
  
  it('applies colSpan prop correctly when object', () => {
    render(
      <GridLayout>
        <GridItem colSpan={{ sm: 2, md: 4, lg: 6, xl: 8 }}>
          <div>アイテムコンテンツ</div>
        </GridItem>
      </GridLayout>
    );
    
    const gridItemElement = screen.getByText('アイテムコンテンツ').closest('.grid-item');
    
    // CSSカスタムプロパティの検証は難しいので、スタイル属性に設定されていることを確認
    const style = gridItemElement?.getAttribute('style');
    expect(style).toContain('--col-span-sm: 2');
    expect(style).toContain('--col-span-md: 4');
    expect(style).toContain('--col-span-lg: 6');
    expect(style).toContain('--col-span-xl: 8');
  });
  
  it('applies rowSpan prop correctly to style', () => {
    render(
      <GridLayout>
        <GridItem rowSpan={3}>
          <div>アイテムコンテンツ</div>
        </GridItem>
      </GridLayout>
    );
    
    const gridItemElement = screen.getByText('アイテムコンテンツ').closest('.grid-item');
    expect(gridItemElement).toHaveStyle('grid-row: span 3');
  });
  
  it('applies additional className correctly', () => {
    render(
      <GridLayout>
        <GridItem className="custom-item">
          <div>アイテムコンテンツ</div>
        </GridItem>
      </GridLayout>
    );
    
    const gridItemElement = screen.getByText('アイテムコンテンツ').closest('.grid-item');
    expect(gridItemElement).toHaveClass('custom-item');
  });
  
  it('combines colSpan and rowSpan correctly', () => {
    render(
      <GridLayout>
        <GridItem colSpan={4} rowSpan={2}>
          <div>アイテムコンテンツ</div>
        </GridItem>
      </GridLayout>
    );
    
    const gridItemElement = screen.getByText('アイテムコンテンツ').closest('.grid-item');
    expect(gridItemElement).toHaveStyle('grid-column: span 4');
    expect(gridItemElement).toHaveStyle('grid-row: span 2');
  });
});
