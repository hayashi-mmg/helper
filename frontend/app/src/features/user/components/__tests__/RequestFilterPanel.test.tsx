import { render, screen, fireEvent } from '../../../test-utils/providers';
import { RequestFilterPanel } from '../request/RequestFilterPanel';
import { RequestStatus, RequestType } from '../../types';

describe('RequestFilterPanel', () => {
  const mockOnFilterChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // 基本的なレンダリングテスト
  it('renders correctly with default state', () => {
    render(<RequestFilterPanel onFilterChange={mockOnFilterChange} />);
    
    // パネルのタイトルが表示されていること
    expect(screen.getByText('フィルター条件')).toBeInTheDocument();
    
    // デフォルトは閉じた状態であることを確認
    // パネルを開くためにタイトル部分をクリック
    fireEvent.click(screen.getByText('フィルター条件'));
    
    // 開くとフォーム要素が表示されることを確認
    expect(screen.getByText('ステータス')).toBeInTheDocument();
    expect(screen.getByText('タイプ')).toBeInTheDocument();
    expect(screen.getByText('開始日')).toBeInTheDocument();
    expect(screen.getByText('終了日')).toBeInTheDocument();
  });
  
  // 初期フィルター値の表示テスト
  it('displays initial filter values', () => {
    const initialFilter = {
      status: RequestStatus.INPROGRESS,
      type: RequestType.COOKING,
      startDate: '2025-05-01',
      endDate: '2025-05-31'
    };
    
    render(
      <RequestFilterPanel 
        initialFilter={initialFilter} 
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    // パネルを開く
    fireEvent.click(screen.getByText('フィルター条件'));
    
    // 初期値が正しく表示されていることを確認
    const statusSelect = screen.getByLabelText('ステータス');
    const typeSelect = screen.getByLabelText('タイプ');
    const startDateInput = screen.getByLabelText('開始日');
    const endDateInput = screen.getByLabelText('終了日');
    
    expect(statusSelect).toHaveValue(RequestStatus.INPROGRESS);
    expect(typeSelect).toHaveValue(RequestType.COOKING);
    expect(startDateInput).toHaveValue('2025-05-01');
    expect(endDateInput).toHaveValue('2025-05-31');
  });
  
  // フィルター適用ボタンのテスト
  it('calls onFilterChange when apply filter button is clicked', () => {
    render(<RequestFilterPanel onFilterChange={mockOnFilterChange} />);
    
    // パネルを開く
    fireEvent.click(screen.getByText('フィルター条件'));
    
    // ステータスフィルターを設定
    const statusSelect = screen.getByLabelText('ステータス');
    fireEvent.change(statusSelect, { target: { value: RequestStatus.COMPLETED } });
    
    // タイプフィルターを設定
    const typeSelect = screen.getByLabelText('タイプ');
    fireEvent.change(typeSelect, { target: { value: RequestType.ERRAND } });
    
    // 開始日を設定
    const startDateInput = screen.getByLabelText('開始日');
    fireEvent.change(startDateInput, { target: { value: '2025-05-01' } });
    
    // 終了日を設定
    const endDateInput = screen.getByLabelText('終了日');
    fireEvent.change(endDateInput, { target: { value: '2025-05-31' } });
    
    // フィルター適用ボタンをクリック
    const applyButton = screen.getByText('フィルター適用');
    fireEvent.click(applyButton);
    
    // onFilterChangeが正しく呼び出されたことを確認
    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      status: RequestStatus.COMPLETED,
      type: RequestType.ERRAND,
      startDate: '2025-05-01',
      endDate: '2025-05-31'
    });
  });
  
  // リセットボタンのテスト
  it('resets filters when reset button is clicked', () => {
    const initialFilter = {
      status: RequestStatus.INPROGRESS,
      type: RequestType.COOKING
    };
    
    render(
      <RequestFilterPanel 
        initialFilter={initialFilter} 
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    // パネルを開く
    fireEvent.click(screen.getByText('フィルター条件'));
    
    // リセットボタンをクリック
    const resetButton = screen.getByText('リセット');
    fireEvent.click(resetButton);
    
    // onFilterChangeが空のフィルターで呼び出されたことを確認
    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(mockOnFilterChange).toHaveBeenCalledWith({});
  });
  
  // ローディング状態のテスト
  it('disables controls when isLoading is true', () => {
    render(
      <RequestFilterPanel 
        onFilterChange={mockOnFilterChange} 
        isLoading={true}
      />
    );
    
    // パネルを開く
    fireEvent.click(screen.getByText('フィルター条件'));
    
    // コントロールが無効化されていることを確認
    const statusSelect = screen.getByLabelText('ステータス');
    const applyButton = screen.getByText('フィルター適用');
    const resetButton = screen.getByText('リセット');
    
    expect(statusSelect).toBeDisabled();
    expect(applyButton).toBeDisabled();
    expect(resetButton).toBeDisabled();
  });
});
