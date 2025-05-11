import { render, screen } from '../../../test-utils/providers';
import { RecentRequests } from '../dashboard/RecentRequests';
import { mockRequestArray } from '../../../test-utils/test-data';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// react-router-domのモック
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: jest.fn(({ to, children, ...rest }) => (
    <a href={to} {...rest}>{children}</a>
  )),
}));

describe('RecentRequests', () => {
  const requests = mockRequestArray(5);

  // 基本的なレンダリングのテスト
  it('renders with correct title', () => {
    render(
      <BrowserRouter>
        <RecentRequests requests={requests} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('最近の依頼')).toBeInTheDocument();
  });

  // カスタムタイトルのテスト
  it('renders with custom title', () => {
    render(
      <BrowserRouter>
        <RecentRequests requests={requests} title="カスタムタイトル" />
      </BrowserRouter>
    );
    
    expect(screen.getByText('カスタムタイトル')).toBeInTheDocument();
  });

  // テーブルヘッダーの表示確認
  it('renders table headers correctly', () => {
    render(
      <BrowserRouter>
        <RecentRequests requests={requests} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('タイトル')).toBeInTheDocument();
    expect(screen.getByText('依頼日')).toBeInTheDocument();
    expect(screen.getByText('予定日')).toBeInTheDocument();
    expect(screen.getByText('ステータス')).toBeInTheDocument();
  });

  // データリストの表示確認
  it('renders requests data correctly', () => {
    render(
      <BrowserRouter>
        <RecentRequests requests={requests} />
      </BrowserRouter>
    );
    
    // リクエストのタイトルが表示されているか確認
    requests.forEach((request) => {
      expect(screen.getByText(request.title)).toBeInTheDocument();
    });
  });

  // データ制限のテスト
  it('limits the number of requests based on limit prop', () => {
    const limit = 2;
    render(
      <BrowserRouter>
        <RecentRequests requests={requests} limit={limit} />
      </BrowserRouter>
    );
    
    // 最初の2件だけが表示されているか確認
    expect(screen.getByText(requests[0].title)).toBeInTheDocument();
    expect(screen.getByText(requests[1].title)).toBeInTheDocument();
    expect(screen.queryByText(requests[2].title)).not.toBeInTheDocument();
  });

  // ローディング状態のテスト
  it('renders loading state', () => {
    render(
      <BrowserRouter>
        <RecentRequests requests={[]} isLoading={true} />
      </BrowserRouter>
    );
    
    // スケルトンローダーが表示されるか確認
    // Chakra UIのSkeletonコンポーネントはdata-testidを持たないため、
    // コンテナ要素を確認します
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  // データがない場合のテスト
  it('renders empty state when no data', () => {
    render(
      <BrowserRouter>
        <RecentRequests requests={[]} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('依頼はありません')).toBeInTheDocument();
  });

  // 「すべて表示」ボタンの表示/非表示テスト
  it('shows view all button when showViewAll is true', () => {
    render(
      <BrowserRouter>
        <RecentRequests requests={requests} showViewAll={true} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('すべて表示')).toBeInTheDocument();
  });

  it('hides view all button when showViewAll is false', () => {
    render(
      <BrowserRouter>
        <RecentRequests requests={requests} showViewAll={false} />
      </BrowserRouter>
    );
    
    expect(screen.queryByText('すべて表示')).not.toBeInTheDocument();
  });
});
