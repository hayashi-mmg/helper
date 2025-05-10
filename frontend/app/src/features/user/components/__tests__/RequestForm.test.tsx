import { render, screen, fireEvent, act, waitFor } from '../../../test-utils/providers';
import { RequestForm } from '../request/RequestForm';
import { RequestType } from '../../types';
import userEvent from '@testing-library/user-event';

describe('RequestForm', () => {
  const mockOnSubmit = jest.fn();
  const testChild = <div data-testid="test-child">Test Child Content</div>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // 基本的なレンダリングテスト
  it('renders form elements correctly', () => {
    render(<RequestForm onSubmit={mockOnSubmit} />);
    
    // フォーム要素が表示されているか確認
    expect(screen.getByText('依頼情報')).toBeInTheDocument();
    expect(screen.getByLabelText('タイトル')).toBeInTheDocument();
    expect(screen.getByLabelText('依頼タイプ')).toBeInTheDocument();
    expect(screen.getByLabelText('予定日')).toBeInTheDocument();
    expect(screen.getByLabelText('予想所要時間（分）')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByText('送信')).toBeInTheDocument();
  });
  
  // カスタム送信ボタンラベルのテスト
  it('renders custom submit button label', () => {
    render(<RequestForm onSubmit={mockOnSubmit} submitLabel="保存する" />);
    expect(screen.getByText('保存する')).toBeInTheDocument();
  });
  
  // 子要素レンダリングテスト
  it('renders children content', () => {
    render(
      <RequestForm onSubmit={mockOnSubmit}>
        {testChild}
      </RequestForm>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });
  
  // 初期データ表示テスト
  it('displays initial form values', () => {
    const initialData = {
      title: 'テストリクエスト',
      description: 'これはテスト用のリクエストです',
      type: RequestType.CLEANING,
      scheduledDate: '2025-05-15',
      estimatedDuration: 120,
    };
    
    render(<RequestForm onSubmit={mockOnSubmit} initialData={initialData} />);
    
    expect(screen.getByLabelText('タイトル')).toHaveValue(initialData.title);
    expect(screen.getByLabelText('依頼タイプ')).toHaveValue(initialData.type);
    expect(screen.getByLabelText('予定日')).toHaveValue(initialData.scheduledDate);
    expect(screen.getByLabelText('説明')).toHaveValue(initialData.description);
  });
  
  // フォーム送信テスト
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    
    render(<RequestForm onSubmit={mockOnSubmit} />);
    
    // フォームに値を入力
    await user.type(screen.getByLabelText('タイトル'), 'テストリクエスト');
    await user.selectOptions(screen.getByLabelText('依頼タイプ'), RequestType.CLEANING);
    await user.type(screen.getByLabelText('予定日'), '2025-05-15');
    await user.type(screen.getByLabelText('説明'), 'これはテスト用のリクエストです。長めの説明文を入力します。');
    
    // フォーム送信
    await user.click(screen.getByText('送信'));
    
    // 送信ハンドラーが呼ばれたことを確認
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'テストリクエスト',
        type: RequestType.CLEANING,
        scheduledDate: '2025-05-15',
        description: 'これはテスト用のリクエストです。長めの説明文を入力します。',
        estimatedDuration: 60, // デフォルト値
      });
    });
  });
  
  // バリデーションテスト
  it('shows validation errors for invalid data', async () => {
    const user = userEvent.setup();
    
    render(<RequestForm onSubmit={mockOnSubmit} />);
    
    // タイトルと説明を入力せずに送信
    await user.click(screen.getByText('送信'));
    
    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
      expect(screen.getByText('説明は必須です')).toBeInTheDocument();
    });
    
    // 短すぎる説明を入力
    await user.type(screen.getByLabelText('説明'), '短い');
    await user.click(screen.getByText('送信'));
    
    // 説明の長さに関するエラーが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('10文字以上入力してください')).toBeInTheDocument();
    });
    
    // 送信ハンドラーが呼ばれていないことを確認
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  // ローディング状態のテスト
  it('disables form controls when loading', () => {
    render(<RequestForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    // 全てのフォーム要素が無効化されているか確認
    expect(screen.getByLabelText('タイトル')).toBeDisabled();
    expect(screen.getByLabelText('依頼タイプ')).toBeDisabled();
    expect(screen.getByLabelText('予定日')).toBeDisabled();
    expect(screen.getByLabelText('説明')).toBeDisabled();
    
    // 送信ボタンが無効化され、ローディング表示になっているか確認
    const submitButton = screen.getByText('送信中...');
    expect(submitButton).toBeDisabled();
  });
});
