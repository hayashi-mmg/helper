import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelperDashboardLayout } from './HelperDashboardLayout';

// モックコンポーネントの定義
jest.mock('./Header', () => ({
  Header: ({ title }: { title: string }) => <div data-testid="header">{title}</div>,
}));

jest.mock('./Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

describe('HelperDashboardLayout', () => {
  const renderComponent = (title?: string) => {
    return render(
      <BrowserRouter>
        <HelperDashboardLayout title={title}>
          <div data-testid="content">Test Content</div>
        </HelperDashboardLayout>
      </BrowserRouter>
    );
  };

  test('renders sidebar, header, and content', () => {
    renderComponent();
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  test('passes correct title to header', () => {
    renderComponent('テストタイトル');
    
    expect(screen.getByTestId('header')).toHaveTextContent('テストタイトル');
  });

  test('uses default title when not provided', () => {
    renderComponent();
    
    expect(screen.getByTestId('header')).toHaveTextContent('ダッシュボード');
  });
});
