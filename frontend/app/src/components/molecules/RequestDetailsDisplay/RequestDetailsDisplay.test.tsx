import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RequestDetailsDisplay } from './RequestDetailsDisplay';
import { mockRequests } from '../../../mocks/requests';

describe('RequestDetailsDisplay', () => {
  const onStatusChangeMock = jest.fn();
  const onAddCommentMock = jest.fn();
  const onBackMock = jest.fn();
  const onViewRecipeMock = jest.fn();
  const onCompleteTaskMock = jest.fn();
  
  const defaultProps = {
    request: mockRequests[0], // 最初のリクエスト（料理リクエスト）
    isLoading: false,
    isUpdating: false,
    isSendingComment: false,
    onStatusChange: onStatusChangeMock,
    onAddComment: onAddCommentMock,
    onBack: onBackMock,
    onViewRecipe: onViewRecipeMock,
    onCompleteTask: onCompleteTaskMock,
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders request details correctly', () => {
    render(<RequestDetailsDisplay {...defaultProps} />);
    
    expect(screen.getByText('肉じゃがの調理')).toBeInTheDocument();
    expect(screen.getByText('祖母の味を再現した肉じゃがを作ってください。特に味付けは甘めでお願いします。')).toBeInTheDocument();
    expect(screen.getByText('材料:')).toBeInTheDocument();
    expect(screen.getByText('じゃがいも')).toBeInTheDocument();
  });
  
  test('displays loading state correctly', () => {
    render(<RequestDetailsDisplay {...defaultProps} isLoading={true} />);
    
    // ローディングスケルトンが表示されていることを確認
    expect(screen.queryByText('肉じゃがの調理')).not.toBeInTheDocument();
  });
  
  test('shows error message when request is not found', () => {
    render(<RequestDetailsDisplay {...defaultProps} request={undefined} />);
    
    expect(screen.getByText('リクエストが見つかりません')).toBeInTheDocument();
  });
  
  test('handles status change button click', () => {
    render(<RequestDetailsDisplay {...defaultProps} />);
    
    // 未対応状態のリクエストの「作業開始」ボタンをクリック
    fireEvent.click(screen.getByText('作業開始'));
    
    expect(onStatusChangeMock).toHaveBeenCalledWith('req-001', 'in_progress');
  });
  
  test('handles comment submission', () => {
    render(<RequestDetailsDisplay {...defaultProps} />);
    
    // コメントを入力
    const commentInput = screen.getByPlaceholderText('コメントを入力...');
    fireEvent.change(commentInput, { target: { value: 'テストコメントです' } });
    
    // 送信ボタンをクリック
    fireEvent.click(screen.getByText('コメント送信'));
    
    expect(onAddCommentMock).toHaveBeenCalledWith('req-001', 'テストコメントです');
  });
  
  test('shows recipe information for cooking requests', () => {
    const cookingRequest = mockRequests.find(r => r.type === 'cooking' && r.recipeUrl);
    render(<RequestDetailsDisplay {...defaultProps} request={cookingRequest} />);
    
    expect(screen.getByText('料理リクエスト情報')).toBeInTheDocument();
    expect(screen.getByText('レシピを開く')).toBeInTheDocument();
  });
  
  test('does not show recipe information for non-cooking requests', () => {
    const errandRequest = mockRequests.find(r => r.type === 'errand');
    render(<RequestDetailsDisplay {...defaultProps} request={errandRequest} />);
    
    expect(screen.queryByText('料理リクエスト情報')).not.toBeInTheDocument();
  });
  
  test('shows correct actions based on request status', () => {
    // 進行中のリクエスト
    const inProgressRequest = mockRequests.find(r => r.status === 'in_progress');
    render(<RequestDetailsDisplay {...defaultProps} request={inProgressRequest} />);
    
    // 完了報告ボタンが表示されている
    expect(screen.getByText('完了報告フォームを開く')).toBeInTheDocument();
    // 作業開始ボタンは表示されていない
    expect(screen.queryByText('作業開始')).not.toBeInTheDocument();
    
    // 再レンダリング
    // 完了済みのリクエスト
    const completedRequest = mockRequests.find(r => r.status === 'completed');
    render(<RequestDetailsDisplay {...defaultProps} request={completedRequest} />);
    
    // 完了メッセージが表示されている
    expect(screen.getByText('このタスクは完了しています')).toBeInTheDocument();
    // アクションボタンは表示されていない
    expect(screen.queryByText('作業開始')).not.toBeInTheDocument();
    expect(screen.queryByText('完了報告フォームを開く')).not.toBeInTheDocument();
  });
  
  test('calls onBack when back button is clicked', () => {
    render(<RequestDetailsDisplay {...defaultProps} />);
    
    // 戻るボタンをクリック
    fireEvent.click(screen.getByLabelText('戻る'));
    
    expect(onBackMock).toHaveBeenCalled();
  });
  
  test('calls onViewRecipe when recipe link is clicked', () => {
    const cookingRequest = mockRequests.find(r => r.type === 'cooking' && r.recipeUrl);
    render(<RequestDetailsDisplay {...defaultProps} request={cookingRequest} />);
    
    // レシピボタンをクリック
    fireEvent.click(screen.getByLabelText('レシピを見る'));
    
    expect(onViewRecipeMock).toHaveBeenCalledWith(cookingRequest?.recipeUrl);
  });
  
  test('calls onCompleteTask when complete task button is clicked', () => {
    const inProgressRequest = mockRequests.find(r => r.status === 'in_progress');
    render(<RequestDetailsDisplay {...defaultProps} request={inProgressRequest} />);
    
    // 完了報告ボタンをクリック
    fireEvent.click(screen.getByText('完了報告フォームを開く'));
    
    expect(onCompleteTaskMock).toHaveBeenCalledWith(inProgressRequest?.id);
  });
});
