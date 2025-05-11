import { Meta, StoryObj } from '@storybook/react';
import { RecipeInfoDisplay } from './RecipeInfoDisplay';

// モックレシピデータ
const mockRecipe = {
  id: 'recipe-001',
  title: '祖母直伝の肉じゃが',
  description: '甘めの味付けが特徴の、ほっとする味わいの肉じゃがです。じゃがいもはホクホク、にんじんは柔らかく、牛肉の旨味がしっかり染み込んでいます。',
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
    { name: '人参', amount: '1本', optional: false },
    { name: '牛肉（薄切り）', amount: '200g', optional: false },
    { name: 'ごま油', amount: '大さじ1', optional: false },
    { name: '醤油', amount: '大さじ3', optional: false },
    { name: 'みりん', amount: '大さじ3', optional: false },
    { name: '砂糖', amount: '大さじ2', optional: false },
    { name: '酒', amount: '大さじ2', optional: false },
    { name: '水', amount: '400ml', optional: false },
    { name: '絹さや', amount: '適量', optional: true, substitute: 'グリーンピース（冷凍）' },
  ],
  steps: [
    {
      order: 1,
      description: 'じゃがいもは皮をむいて4等分に切り、水にさらす。玉ねぎは楔切り、人参は乱切りにする。牛肉は食べやすい大きさに切る。',
      tip: 'じゃがいもはあらかじめ水にさらしておくとアクが抜けて色よく仕上がります。'
    },
    {
      order: 2,
      description: '鍋にごま油をひき、牛肉を炒める。肉の色が変わったら、玉ねぎ、人参を加えて炒める。',
      imageUrl: 'https://placehold.co/400x300?text=Step+2'
    },
    {
      order: 3,
      description: '水気を切ったじゃがいもを加え、全体に油が回るように炒める。',
    },
    {
      order: 4,
      description: '醤油、みりん、砂糖、酒、水を加えて強火で煮立てる。アクを取り除く。',
      tip: '最初は強火で煮立てることで具材に味が染み込みやすくなります。'
    },
    {
      order: 5,
      description: '落とし蓋をして中火で15分ほど煮る。途中で上下を返すと味が均一に染み込みます。',
      timer: 900
    },
    {
      order: 6,
      description: 'じゃがいもに火が通ったら絹さやを加え、ひと煮立ちさせたら火を止める。',
    },
    {
      order: 7,
      description: '器に盛り付けて完成。冷めても美味しく召し上がれます。',
      imageUrl: 'https://placehold.co/400x300?text=Final+Dish'
    }
  ],
  tips: [
    '牛肉の代わりに豚肉を使っても美味しく作れます。',
    '甘さ控えめが好みの場合は砂糖を大さじ1に減らしてください。',
    '冷蔵庫で2〜3日保存可能です。温め直す際は電子レンジで約2分（500W）が目安です。'
  ],
  nutrition: {
    calories: 420,
    protein: 18,
    carbs: 45,
    fat: 16,
    sugar: 8,
    sodium: 980
  }
};

const meta: Meta<typeof RecipeInfoDisplay> = {
  title: 'Molecules/RecipeInfoDisplay',
  component: RecipeInfoDisplay,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof RecipeInfoDisplay>;

export const Default: Story = {
  args: {
    recipe: mockRecipe,
    isLoading: false,
    onBack: () => console.log('Back button clicked'),
    onPrint: () => console.log('Print button clicked'),
    onOpenSource: (url) => console.log(`Opening source URL: ${url}`),
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    recipe: undefined,
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    ...Default.args,
    recipe: undefined,
    error: 'レシピ情報の取得中にエラーが発生しました。',
  },
};

export const NoRecipe: Story = {
  args: {
    ...Default.args,
    recipe: undefined,
  },
};

export const SimpleRecipe: Story = {
  args: {
    ...Default.args,
    recipe: {
      ...mockRecipe,
      description: undefined,
      imageUrl: undefined,
      tips: undefined,
      nutrition: undefined,
      steps: mockRecipe.steps.map(step => ({
        ...step,
        imageUrl: undefined,
        tip: undefined,
        timer: undefined
      }))
    },
  },
};
