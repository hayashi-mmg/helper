import { render, screen, fireEvent } from '../../../test-utils/providers';
import { RequestList } from '../request/RequestList';
import { mockRequestArray } from '../../../test-utils/test-data';
import { RequestStatus, RequestType, RequestFilter } from '../../types';
import { BrowserRouter } from 'react-router-dom';

// react-router-domのモック
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: jest.fn(({ to, children, ...rest }) => (
    <a href={to} {...rest}>{children}</a>
  )),
}));

describe('RequestList', () => {
  const requests = mockRequestArray(5);
  const mockOnFilterChange = jest.fn();
  const mockOnPageChange = jest.fn();
  const mockOnViewRequest = jest.fn();
  const mockOnEditRequest = jest.fn();
  const mockOnDeleteRequest = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // 基本的なレンダリングのテスト
  it('renders request list correctly', () => {
    render(
      <BrowserRouter>
        <RequestList 
          requests={requests} 
          totalItems={10}
          page={1}
          totalPages={2}
        />
      </BrowserRouter>
    );
    
    // リストのタイトルが表示されていることを確認
    expect(screen.getByText('依頼一覧')).toBeInTheDocument();
    
    // テーブルヘッダーが表示されていることを確認
    expect(screen.getByText('タイトル')).toBeInTheDocument();
    expect(screen.getByText('タイプ')).toBeInTheDocument();
    expect(screen.getByText('予定日')).toBeInTheDocument();
    expect(screen.getByText('ステータス')).toBeInTheDocument();
    
    // 各リクエストのタイトルが表示されていることを確認
    requests.forEach(request => {
      expect(screen.getByText(request.title)).toBeInTheDocument();
    });
  });
  
  // フィルター変更のテスト
  it('calls onFilterChange when filter is changed', () => {
    render(
      <BrowserRouter>
        <RequestList 
          requests={requests} 
          onFilterChange={mockOnFilterChange}
        />
      </BrowserRouter>
    );
    
    // タイプフィルターを変更
    const typeFilter = screen.getAllByRole('combobox')[1]; // 2番目のセレクトがタイプフィルター
    fireEvent.change(typeFilter, { target: { value: RequestType.COOKING } });
    
    // フィルター変更コールバックが呼ばれたことを確認
    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      type: RequestType.COOKING
    }));
    
    // リセットボタンをクリック
    const resetButton = screen.getByText('リセット');
    fireEvent.click(resetButton);
    
    // フィルターリセット時にコールバックが呼ばれたことを確認
    expect(mockOnFilterChange).toHaveBeenCalledTimes(2);
  });
  
  // ページネーションのテスト
  it('calls onPageChange when pagination buttons are clicked', () => {
    render(
      <BrowserRouter>
        <RequestList 
          requests={requests} 
          totalItems={20}
          page={2}
          totalPages={4}
          limit={5}
          onPageChange={mockOnPageChange}
        />
      </BrowserRouter>
    );
    
    // 前へボタンをクリック
    const prevButton = screen.getByText('前へ');
    fireEvent.click(prevButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
    
    // 次へボタンをクリック
    const nextButton = screen.getByText('次へ');
    fireEvent.click(nextButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });
  
  // 操作メニューのテスト
  it('shows operation menu and calls corresponding handlers', () => {
    render(
      <BrowserRouter>
        <RequestList 
          requests={requests} 
          onViewRequest={mockOnViewRequest}
          onEditRequest={mockOnEditRequest}
          onDeleteRequest={mockOnDeleteRequest}
        />
      </BrowserRouter>
    );
    
    // 最初の操作メニューを開く
    const operationButtons = screen.getAllByText('操作');
    fireEvent.click(operationButtons[0]);
    
    // 詳細ボタンをクリック
    const viewButton = screen.getByText('詳細を見る');
    fireEvent.click(viewButton);
    expect(mockOnViewRequest).toHaveBeenCalledWith(requests[0].id);
    
    // 再度メニューを開く
    fireEvent.click(operationButtons[0]);
    
    // 編集ボタンをクリック
    const editButton = screen.getByText('編集する');
    fireEvent.click(editButton);
    expect(mockOnEditRequest).toHaveBeenCalledWith(requests[0].id);
    
    // 再度メニューを開く
    fireEvent.click(operationButtons[0]);
    
    // 削除ボタンをクリック
    const deleteButton = screen.getByText('削除する');
    fireEvent.click(deleteButton);
    expect(mockOnDeleteRequest).toHaveBeenCalledWith(requests[0].id);
  });
  
  // データがない場合のテスト
  it('renders empty state when no requests', () => {
    render(
      <BrowserRouter>
        <RequestList requests={[]} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('依頼はありません')).toBeInTheDocument();
  });
  
  // ローディング状態のテスト
  it('renders loading state', () => {
    render(
      <BrowserRouter>
        <RequestList requests={[]} isLoading={true} />
      </BrowserRouter>
    );
    
    // テーブルが表示されないことを確認
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
