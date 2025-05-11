import { render, screen, fireEvent } from '@testing-library/react';
import { UserRequestsList } from './UserRequestsList';
import { mockRequests } from '../../../mocks/requests';

// React Router のモック
jest.mock('react-router-dom', () => ({
  Link: jest.fn().mockImplementation(({ children, to, ...props }) => (
    <a href={to} {...props}>{children}</a>
  )),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/helper/requests',
    search: '',
    hash: '',
    state: null
  }),
}));

describe('UserRequestsList', () => {
  const onPageChangeMock = jest.fn();
  const onSearchMock = jest.fn();
  const onFilterMock = jest.fn();
  const onStatusChangeMock = jest.fn();
  const onRequestClickMock = jest.fn();
  
  const defaultProps = {
    requests: mockRequests,
    isLoading: false,
    totalItems: mockRequests.length,
    currentPage: 1,
    itemsPerPage: 10,
    onPageChange: onPageChangeMock,
    onSearch: onSearchMock,
    onFilter: onFilterMock,
    onStatusChange: onStatusChangeMock,
    onRequestClick: onRequestClickMock,
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders list with correct request count', () => {
    render(<UserRequestsList {...defaultProps} />);
    
    // リクエストが表示されるかチェック
    expect(screen.getByText('肉じゃがの調理')).toBeInTheDocument();
    expect(screen.getByText('カレーライスの調理')).toBeInTheDocument();
  });
  
  test('shows loading spinner when isLoading is true', () => {
    render(<UserRequestsList {...defaultProps} isLoading={true} />);
    
    // ローディングスピナーが表示されるかチェック
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  test('shows empty message when there are no requests', () => {
    render(<UserRequestsList {...defaultProps} requests={[]} totalItems={0} />);
    
    // 空のメッセージが表示されるかチェック
    expect(screen.getByText('リクエストがありません')).toBeInTheDocument();
  });
  
  test('triggers search when search button is clicked', () => {
    render(<UserRequestsList {...defaultProps} />);
    
    // 検索ワードの入力
    const searchInput = screen.getByPlaceholderText('リクエストを検索...');
    fireEvent.change(searchInput, { target: { value: 'カレー' } });
    
    // 検索ボタンをクリック
    const searchButton = screen.getByLabelText('Search');
    fireEvent.click(searchButton);
    
    // 検索コールバックが呼ばれるかチェック
    expect(onSearchMock).toHaveBeenCalledWith('カレー');
  });
  
  test('opens filter panel when filter button is clicked', () => {
    render(<UserRequestsList {...defaultProps} />);
    
    // 初期状態ではフィルターパネルは表示されていない
    expect(screen.queryByText('詳細検索')).not.toBeInTheDocument();
    
    // フィルターボタンをクリック
    fireEvent.click(screen.getByText('フィルター'));
    
    // フィルターパネルが表示されるか
    expect(screen.getByText('詳細検索')).toBeInTheDocument();
  });
  
  test('triggers status change when status button is clicked', () => {
    render(<UserRequestsList {...defaultProps} />);
    
    // 「未対応」状態のリクエストで「進行中にする」ボタンを見つける
    const pendingRequest = mockRequests.find(r => r.status === 'pending');
    if (pendingRequest) {
      // 進行中にするボタンをクリック
      const startButton = screen.getAllByLabelText('進行中にする')[0];
      fireEvent.click(startButton);
      
      // ステータス変更コールバックが呼ばれるかチェック
      expect(onStatusChangeMock).toHaveBeenCalledWith(pendingRequest.id, 'in_progress');
    }
  });
  
  test('triggers request click when row is clicked', () => {
    render(<UserRequestsList {...defaultProps} />);
    
    // 最初のリクエストの行をクリック
    fireEvent.click(screen.getByText('肉じゃがの調理'));
    
    // リクエストクリックコールバックが呼ばれるかチェック
    expect(onRequestClickMock).toHaveBeenCalledWith('req-001');
  });
  
  test('applies filters when filter apply button is clicked', () => {
    render(<UserRequestsList {...defaultProps} />);
    
    // フィルターボタンをクリック
    fireEvent.click(screen.getByText('フィルター'));
    
    // フィルターを選択
    fireEvent.click(screen.getByText('未対応'));
    fireEvent.click(screen.getByText('料理'));
    
    // フィルターを適用
    fireEvent.click(screen.getByText('適用'));
    
    // フィルター適用コールバックが呼ばれるかチェック
    expect(onFilterMock).toHaveBeenCalled();
    // パラメーターの値をチェック
    const filterParams = onFilterMock.mock.calls[0][0];
    expect(filterParams.status).toContain('pending');
    expect(filterParams.types).toContain('cooking');
  });
});
