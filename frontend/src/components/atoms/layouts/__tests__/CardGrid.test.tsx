import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CardGrid } from '../CardGrid';

describe('CardGrid', () => {
  it('renders children correctly', () => {
    render(
      <CardGrid>
        <div>カード1</div>
        <div>カード2</div>
        <div>カード3</div>
      </CardGrid>
    );
    
    expect(screen.getByText('カード1')).toBeInTheDocument();
    expect(screen.getByText('カード2')).toBeInTheDocument();
    expect(screen.getByText('カード3')).toBeInTheDocument();
  });
  
  it('wraps children in card-grid__item elements', () => {
    render(
      <CardGrid>
        <div>カード1</div>
        <div>カード2</div>
      </CardGrid>
    );
    
    const itemElements = document.querySelectorAll('.card-grid__item');
    expect(itemElements.length).toBe(2);
    expect(itemElements[0]).toContainHTML('<div>カード1</div>');
    expect(itemElements[1]).toContainHTML('<div>カード2</div>');
  });
  
  it('applies gap prop correctly when number', () => {
    render(
      <CardGrid gap={24}>
        <div>カード1</div>
      </CardGrid>
    );
    
    const gridElement = screen.getByText('カード1').closest('.card-grid');
    const style = gridElement?.getAttribute('style');
    expect(style).toContain('--card-gap: 24px');
  });
  
  it('applies gap prop correctly when object', () => {
    render(
      <CardGrid gap={{ x: 16, y: 32 }}>
        <div>カード1</div>
      </CardGrid>
    );
    
    const gridElement = screen.getByText('カード1').closest('.card-grid');
    const style = gridElement?.getAttribute('style');
    expect(style).toContain('--card-gap: 32px 16px');
  });
  
  it('applies columns prop correctly', () => {
    render(
      <CardGrid columns={{ sm: 2, md: 3, lg: 4, xl: 6 }}>
        <div>カード1</div>
      </CardGrid>
    );
    
    const gridElement = screen.getByText('カード1').closest('.card-grid');
    const style = gridElement?.getAttribute('style');
    
    expect(style).toContain('--card-columns-sm: 2');
    expect(style).toContain('--card-columns-md: 3');
    expect(style).toContain('--card-columns-lg: 4');
    expect(style).toContain('--card-columns-xl: 6');
  });
  
  it('applies equalWidth prop correctly', () => {
    const { rerender } = render(
      <CardGrid>
        <div>カード1</div>
      </CardGrid>
    );
    
    // デフォルトではequal-widthクラスが適用されている
    let gridElement = screen.getByText('カード1').closest('.card-grid');
    expect(gridElement).toHaveClass('equal-width');
    
    // equalWidth=falseの場合
    rerender(
      <CardGrid equalWidth={false}>
        <div>カード1</div>
      </CardGrid>
    );
    
    gridElement = screen.getByText('カード1').closest('.card-grid');
    expect(gridElement).not.toHaveClass('equal-width');
  });
  
  it('applies equalHeight prop correctly', () => {
    const { rerender } = render(
      <CardGrid>
        <div>カード1</div>
      </CardGrid>
    );
    
    // デフォルトではequal-heightクラスが適用されていない
    let gridElement = screen.getByText('カード1').closest('.card-grid');
    expect(gridElement).not.toHaveClass('equal-height');
    
    // equalHeight=trueの場合
    rerender(
      <CardGrid equalHeight={true}>
        <div>カード1</div>
      </CardGrid>
    );
    
    gridElement = screen.getByText('カード1').closest('.card-grid');
    expect(gridElement).toHaveClass('equal-height');
  });
  
  it('applies additional className correctly', () => {
    render(
      <CardGrid className="custom-cards">
        <div>カード1</div>
      </CardGrid>
    );
    
    const gridElement = screen.getByText('カード1').closest('.card-grid');
    expect(gridElement).toHaveClass('custom-cards');
  });
  
  it('combines all props correctly', () => {
    render(
      <CardGrid
        gap={16}
        columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
        equalWidth={true}
        equalHeight={true}
        className="custom-cards"
      >
        <div>カード1</div>
      </CardGrid>
    );
    
    const gridElement = screen.getByText('カード1').closest('.card-grid');
    expect(gridElement).toHaveClass('card-grid');
    expect(gridElement).toHaveClass('equal-width');
    expect(gridElement).toHaveClass('equal-height');
    expect(gridElement).toHaveClass('custom-cards');
    
    const style = gridElement?.getAttribute('style');
    expect(style).toContain('--card-gap: 16px');
    expect(style).toContain('--card-columns-sm: 1');
    expect(style).toContain('--card-columns-md: 2');
    expect(style).toContain('--card-columns-lg: 3');
    expect(style).toContain('--card-columns-xl: 4');
  });
});
