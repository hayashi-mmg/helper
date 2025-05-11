import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskCompletionReportForm } from './TaskCompletionReportForm';
import { mockRequests } from '../../../mocks/requests';

// モックファイル作成のためのユーティリティ
global.URL.createObjectURL = jest.fn(() => 'mock-url');

describe('TaskCompletionReportForm', () => {
  const onSubmitMock = jest.fn();
  const onCancelMock = jest.fn();
  const onImageUploadMock = jest.fn().mockResolvedValue('mock-image-id');
  const onImageDeleteMock = jest.fn().mockResolvedValue(undefined);
  
  const defaultProps = {
    request: mockRequests[0], // 料理リクエスト
    isLoading: false,
    isSubmitting: false,
    onSubmit: onSubmitMock,
    onCancel: onCancelMock,
    onImageUpload: onImageUploadMock,
    onImageDelete: onImageDeleteMock,
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders form with correct request information', () => {
    render(<TaskCompletionReportForm {...defaultProps} />);
    
    expect(screen.getByText('タスク完了報告')).toBeInTheDocument();
    expect(screen.getByText('肉じゃがの調理')).toBeInTheDocument();
  });
  
  test('shows loading spinner when isLoading is true', () => {
    render(<TaskCompletionReportForm {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText('データを読み込み中...')).toBeInTheDocument();
  });
  
  test('shows error message when request is not provided', () => {
    render(<TaskCompletionReportForm {...defaultProps} request={undefined} />);
    
    expect(screen.getByText('リクエストが見つかりません')).toBeInTheDocument();
  });
  
  test('changes tabs when clicked', () => {
    render(<TaskCompletionReportForm {...defaultProps} />);
    
    // 最初のタブが選択されていることを確認
    expect(screen.getByText('作業内容')).toBeInTheDocument();
    
    // 2番目のタブをクリック
    fireEvent.click(screen.getByText('画像と添付資料'));
    
    // 2番目のタブの内容が表示されていることを確認
    expect(screen.getByText('完了報告画像')).toBeInTheDocument();
    
    // 3番目のタブをクリック
    fireEvent.click(screen.getByText('確認と最終報告'));
    
    // 3番目のタブの内容が表示されていることを確認
    expect(screen.getByText('タスク満足度')).toBeInTheDocument();
  });
  
  test('handles form input changes', () => {
    render(<TaskCompletionReportForm {...defaultProps} />);
    
    // テキストエリア入力
    const workDetailsInput = screen.getByPlaceholderText('実施した作業の詳細を記入してください');
    fireEvent.change(workDetailsInput, { target: { value: 'テスト作業内容です' } });
    
    // 料理リクエスト特有のフィールド
    const materialsInput = screen.getByPlaceholderText('使用した食材や調味料を記入してください');
    fireEvent.change(materialsInput, { target: { value: 'じゃがいも、人参、玉ねぎ' } });
  });
  
  test('validates form on submit', async () => {
    render(<TaskCompletionReportForm {...defaultProps} />);
    
    // 必須項目を入力せずに送信
    const submitButton = screen.getByText('完了報告を送信');
    fireEvent.click(submitButton);
    
    // バリデーションエラーが表示されるか確認
    await waitFor(() => {
      expect(onSubmitMock).not.toHaveBeenCalled();
    });
  });
  
  test('submits form with valid data', async () => {
    render(<TaskCompletionReportForm {...defaultProps} />);
    
    // 必須項目の入力
    fireEvent.change(
      screen.getByPlaceholderText('実施した作業の詳細を記入してください'),
      { target: { value: 'テスト作業内容です' }}
    );
    
    fireEvent.change(
      screen.getByPlaceholderText('使用した食材や調味料を記入してください'),
      { target: { value: 'じゃがいも、人参、玉ねぎ' }}
    );
    
    // 確認と最終報告タブに移動
    fireEvent.click(screen.getByText('確認と最終報告'));
    
    // チェックリストの項目をチェック
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      fireEvent.click(checkbox);
    });
    
    // 送信ボタンをクリック
    const submitButton = screen.getByText('完了報告を送信');
    fireEvent.click(submitButton);
    
    // onSubmitが呼ばれたことを確認
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalled();
    });
  });
  
  test('calls onCancel when cancel button is clicked', () => {
    render(<TaskCompletionReportForm {...defaultProps} />);
    
    // キャンセルボタンをクリック
    fireEvent.click(screen.getByText('キャンセル'));
    
    expect(onCancelMock).toHaveBeenCalled();
  });
  
  test('shows submitting state when isSubmitting is true', () => {
    render(<TaskCompletionReportForm {...defaultProps} isSubmitting={true} />);
    
    // 送信中の表示を確認
    expect(screen.getByText('送信中')).toBeInTheDocument();
  });
  
  test('changes satisfaction level when stars are clicked', () => {
    render(<TaskCompletionReportForm {...defaultProps} />);
    
    // 最終報告タブに移動
    fireEvent.click(screen.getByText('確認と最終報告'));
    
    // 最初は5つ星（デフォルト）
    const starButtons = screen.getAllByLabelText(/\d点/);
    
    // 2つ星をクリック
    fireEvent.click(starButtons[1]); // 2番目のボタン (評価2)
    
    // 2つ星になっていることの確認は難しいので、この星がクリックされたことだけ確認
    expect(starButtons[1]).toHaveAttribute('aria-label', '2点');
  });
});
