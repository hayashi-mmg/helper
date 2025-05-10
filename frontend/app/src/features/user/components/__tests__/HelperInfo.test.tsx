import { render, screen } from '../../../test-utils/providers';
import { HelperInfo } from '../helper/HelperInfo';
import { mockHelper } from '../../../test-utils/test-data';
import { HelperStatus, HelperSkill } from '../../types';

describe('HelperInfo', () => {
  const helper = mockHelper();
  
  // 基本的なレンダリングのテスト
  it('renders helper information correctly', () => {
    render(<HelperInfo helper={helper} />);
    
    // 基本情報の表示を確認
    expect(screen.getByText(`${helper.firstName} ${helper.lastName}`)).toBeInTheDocument();
    expect(screen.getByText(helper.email)).toBeInTheDocument();
    expect(screen.getByText(helper.phoneNumber as string)).toBeInTheDocument();
  });
  
  // スキルの表示テスト
  it('renders helper skills correctly', () => {
    const testHelper = mockHelper({
      skills: [HelperSkill.COOKING, HelperSkill.CHILDCARE, HelperSkill.ERRAND]
    });
    
    render(<HelperInfo helper={testHelper} />);
    
    // スキルの日本語表示を確認
    expect(screen.getByText('料理')).toBeInTheDocument();
    expect(screen.getByText('子育て支援')).toBeInTheDocument();
    expect(screen.getByText('買い物')).toBeInTheDocument();
  });
  
  // ステータスバッジのテスト
  it('renders status badge with correct color and label', () => {
    // アクティブ状態
    const activeHelper = mockHelper({ status: HelperStatus.ACTIVE });
    const { rerender } = render(<HelperInfo helper={activeHelper} />);
    expect(screen.getByText('活動中')).toBeInTheDocument();
    
    // 非アクティブ状態
    rerender(<HelperInfo helper={mockHelper({ status: HelperStatus.INACTIVE })} />);
    expect(screen.getByText('非活動')).toBeInTheDocument();
    
    // 休暇中状態
    rerender(<HelperInfo helper={mockHelper({ status: HelperStatus.ONLEAVE })} />);
    expect(screen.getByText('休暇中')).toBeInTheDocument();
  });
  
  // 評価の表示テスト
  it('renders rating correctly', () => {
    // 評価ありの場合
    const ratedHelper = mockHelper({ rating: 4.5 });
    const { rerender } = render(<HelperInfo helper={ratedHelper} />);
    expect(screen.getByText('4.5 / 5.0')).toBeInTheDocument();
    
    // 評価なしの場合
    rerender(<HelperInfo helper={mockHelper({ rating: undefined })} />);
    expect(screen.getByText('未評価')).toBeInTheDocument();
  });
  
  // 電話番号がない場合のテスト
  it('does not render phone number when not provided', () => {
    const noPhoneHelper = mockHelper({ phoneNumber: undefined });
    render(<HelperInfo helper={noPhoneHelper} />);
    
    // 電話アイコンが表示されていないことを確認
    // 注: この方法は実装に依存するため、コンポーネントの変更に合わせて調整が必要
    expect(screen.queryByText(noPhoneHelper.phoneNumber as string)).not.toBeInTheDocument();
  });
  
  // 稼働スケジュールの表示テスト
  it('renders availability info when provided', () => {
    const helperWithAvailability = mockHelper({
      availability: {
        monday: [{ start: '09:00', end: '17:00' }]
      }
    });
    
    render(<HelperInfo helper={helperWithAvailability} />);
    expect(screen.getByText('稼働スケジュール有り')).toBeInTheDocument();
  });
});
