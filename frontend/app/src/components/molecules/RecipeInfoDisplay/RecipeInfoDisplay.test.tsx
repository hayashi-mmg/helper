import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeInfoDisplay } from './RecipeInfoDisplay';

// モックレシピデータ
const mockRecipe = {
  id: 'recipe-001',
  title: '祖母直伝の肉じゃが',
  description: '甘めの味付けが特徴の、ほっとする味わいの肉じゃがです。',
  imageUrl: 'https://placehold.co/800x600?text=Nikujaga',
  servings: 4,
  cookingTime: 45,
  difficultyLevel: 'medium',
  calories: 420,
  sourceUrl: 'https://cookpad.com/recipe/123456',
  author: '田中 花子',
  ingredients: [
    { name: 'じゃがいも', amount: '4個', optional: false },
    { name: '玉ねぎ', amount: '1個', optional: false },
    { name: '絹さや', amount: '適量', optional: true, substitute: 'グリーンピース（冷凍）' },
  ],
  steps: [
    {
      order: 1,
      description: 'じゃがいもは皮をむいて4等分に切り、水にさらす。',
      tip: 'じゃがいもはあらかじめ水にさらしておくとアクが抜けて色よく仕上がります。'
    },
    {
      order: 2,
      description: '鍋にごま油をひき、牛肉を炒める。',
      imageUrl: 'https://placehold.co/400x300?text=Step+2'
    },
  ],
  tips: ['牛肉の代わりに豚肉を使っても美味しく作れます。'],
  nutrition: {
    calories: 420,
    protein: 18,
    carbs: 45,
    fat: 16,
  }
};

describe('RecipeInfoDisplay', () => {
  const onBackMock = jest.fn();
  const onPrintMock = jest.fn();
  const onOpenSourceMock = jest.fn();
  
  const defaultProps = {
    recipe: mockRecipe,
    isLoading: false,
    onBack: onBackMock,
    onPrint: onPrintMock,
    onOpenSource: onOpenSourceMock,
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders recipe details correctly', () => {
    render(<RecipeInfoDisplay {...defaultProps} />);
    
    expect(screen.getByText('祖母直伝の肉じゃが')).toBeInTheDocument();
    expect(screen.getByText('甘めの味付けが特徴の、ほっとする味わいの肉じゃがです。')).toBeInTheDocument();
    expect(screen.getByText('45分')).toBeInTheDocument();
    expect(screen.getByText('4人分')).toBeInTheDocument();
    expect(screen.getByText('普通')).toBeInTheDocument();
  });
  
  test('renders ingredients list correctly', () => {
    render(<RecipeInfoDisplay {...defaultProps} />);
    
    expect(screen.getByText('じゃがいも')).toBeInTheDocument();
    expect(screen.getByText('4個')).toBeInTheDocument();
    expect(screen.getByText('玉ねぎ')).toBeInTheDocument();
    expect(screen.getByText('絹さや')).toBeInTheDocument();
    expect(screen.getByText('(任意)')).toBeInTheDocument();
    expect(screen.getByText('・絹さや → グリーンピース（冷凍）')).toBeInTheDocument();
  });
  
  test('renders cooking steps correctly', () => {
    render(<RecipeInfoDisplay {...defaultProps} />);
    
    expect(screen.getByText('じゃがいもは皮をむいて4等分に切り、水にさらす。')).toBeInTheDocument();
    expect(screen.getByText('鍋にごま油をひき、牛肉を炒める。')).toBeInTheDocument();
  });
  
  test('renders nutritional information when available', () => {
    render(<RecipeInfoDisplay {...defaultProps} />);
    
    expect(screen.getByText('栄養情報')).toBeInTheDocument();
    expect(screen.getByText('420kcal')).toBeInTheDocument();
    expect(screen.getByText('18g')).toBeInTheDocument();
  });
  
  test('shows cooking tips when available', () => {
    render(<RecipeInfoDisplay {...defaultProps} />);
    
    expect(screen.getByText('調理のコツ')).toBeInTheDocument();
    expect(screen.getByText('牛肉の代わりに豚肉を使っても美味しく作れます。')).toBeInTheDocument();
  });
  
  test('calls onBack when back button is clicked', () => {
    render(<RecipeInfoDisplay {...defaultProps} />);
    
    fireEvent.click(screen.getByLabelText('戻る'));
    expect(onBackMock).toHaveBeenCalled();
  });
  
  test('calls onPrint when print button is clicked', () => {
    render(<RecipeInfoDisplay {...defaultProps} />);
    
    fireEvent.click(screen.getByLabelText('印刷'));
    expect(onPrintMock).toHaveBeenCalled();
  });
  
  test('calls onOpenSource when source button is clicked', () => {
    render(<RecipeInfoDisplay {...defaultProps} />);
    
    fireEvent.click(screen.getByText('元のレシピを開く'));
    expect(onOpenSourceMock).toHaveBeenCalledWith('https://cookpad.com/recipe/123456');
  });
  
  test('shows error message when error is provided', () => {
    render(<RecipeInfoDisplay {...defaultProps} recipe={undefined} error="エラーメッセージ" />);
    
    expect(screen.getByText('レシピ情報の読み込みに失敗しました')).toBeInTheDocument();
    expect(screen.getByText('エラーメッセージ')).toBeInTheDocument();
  });
  
  test('shows loading state when isLoading is true', () => {
    render(<RecipeInfoDisplay {...defaultProps} recipe={undefined} isLoading={true} />);
    
    // タイトルや説明文が表示されていないことを確認
    expect(screen.queryByText('祖母直伝の肉じゃが')).not.toBeInTheDocument();
  });
  
  test('shows no recipe message when recipe is undefined', () => {
    render(<RecipeInfoDisplay {...defaultProps} recipe={undefined} />);
    
    expect(screen.getByText('レシピ情報がありません')).toBeInTheDocument();
    expect(screen.getByText('このリクエストにはレシピ情報が登録されていません。')).toBeInTheDocument();
  });
  
  test('toggles step details when a step is clicked', () => {
    render(<RecipeInfoDisplay {...defaultProps} />);
    
    // 初期状態ではヒントは表示されていない
    expect(screen.queryByText('じゃがいもはあらかじめ水にさらしておくとアクが抜けて色よく仕上がります。')).not.toBeInTheDocument();
    
    // Step 1をクリック
    fireEvent.click(screen.getByText('じゃがいもは皮をむいて4等分に切り、水にさらす。'));
    
    // ヒントが表示されるはず
    expect(screen.getByText('じゃがいもはあらかじめ水にさらしておくとアクが抜けて色よく仕上がります。')).toBeInTheDocument();
    
    // もう一度クリックすると非表示になるはず
    fireEvent.click(screen.getByText('じゃがいもは皮をむいて4等分に切り、水にさらす。'));
    
    // ヒントが非表示になるはず
    expect(screen.queryByText('じゃがいもはあらかじめ水にさらしておくとアクが抜けて色よく仕上がります。')).not.toBeInTheDocument();
  });
});
