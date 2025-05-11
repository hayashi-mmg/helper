import { render, screen } from '../../../test-utils/providers';
import { DashboardSummary } from '../dashboard/DashboardSummary';
import { mockUserSummary } from '../../../test-utils/test-data';

describe('DashboardSummary', () => {
  // 正常なデータでのレンダリングテスト
  it('renders with provided data', () => {
    const summary = mockUserSummary();
    render(<DashboardSummary summary={summary} />);

    // 各要素が存在することを確認
    expect(screen.getByText('総依頼数')).toBeInTheDocument();
    expect(screen.getByText(summary.totalRequests.toString())).toBeInTheDocument();
    
    expect(screen.getByText('進行中の依頼')).toBeInTheDocument();
    expect(screen.getByText(summary.activeRequests.toString())).toBeInTheDocument();
    
    expect(screen.getByText('完了した依頼')).toBeInTheDocument();
    expect(screen.getByText(summary.completedRequests.toString())).toBeInTheDocument();
    
    expect(screen.getByText('お気に入りヘルパー')).toBeInTheDocument();
    expect(screen.getByText(summary.favoriteHelpers.toString())).toBeInTheDocument();
  });

  // ローディング状態のテスト
  it('renders loading state', () => {
    render(<DashboardSummary summary={mockUserSummary()} isLoading={true} />);

    // ローディングプレースホルダーが表示されているか確認
    const loadingElements = screen.getAllByText('読込中...');
    expect(loadingElements.length).toBe(4); // 4つのカードすべてでローディング表示
  });

  // データがない場合のテスト
  it('renders with default values when no data is provided', () => {
    render(<DashboardSummary summary={null as any} />);

    // デフォルト値（0）が表示されていることを確認
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements.length).toBe(4); // 4つのカードすべてで0表示
  });
});
