import { Request } from '../types/request';

/**
 * モックのリクエストデータ
 */
export const mockRequests: Request[] = [
  {
    id: 'req-001',
    title: '肉じゃがの調理',
    description: '祖母の味を再現した肉じゃがを作ってください。特に味付けは甘めでお願いします。',
    type: 'cooking',
    userId: 'user-1',
    userName: '田中 太郎',
    status: 'pending',
    priority: 'high',
    createdAt: '2025-05-01T09:00:00Z',
    dueDate: '2025-05-15T18:00:00Z',
    recipeUrl: 'https://cookpad.com/recipe/123456',
    ingredients: ['じゃがいも', '玉ねぎ', '牛肉', '人参', 'ごま油', '醤油', 'みりん', '砂糖'],
    comments: [
      {
        id: 'comment-001',
        requestId: 'req-001',
        userId: 'user-1',
        userName: '田中 太郎',
        userType: 'user',
        content: '前回よりも少し甘めにしていただけると嬉しいです。',
        createdAt: '2025-05-01T09:30:00Z'
      }
    ]
  },
  {
    id: 'req-002',
    title: 'カレーライスの調理',
    description: '辛さ控えめでお願いします。玉ねぎは大きめに切ってください。',
    type: 'cooking',
    userId: 'user-2',
    userName: '佐藤 花子',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2025-05-02T10:15:00Z',
    dueDate: '2025-05-14T17:30:00Z',
    recipeUrl: 'https://cookpad.com/recipe/789012',
    ingredients: ['玉ねぎ', '人参', 'じゃがいも', '豚肉', 'カレールー', '米'],
    images: ['https://placehold.co/600x400?text=Curry+Sample'],
    comments: [
      {
        id: 'comment-002',
        requestId: 'req-002',
        userId: 'helper-1',
        userName: '山田 太郎',
        userType: 'helper',
        content: '準備を始めました。材料は揃っていますね。',
        createdAt: '2025-05-10T08:30:00Z'
      }
    ]
  },
  {
    id: 'req-003',
    title: '郵便物の投函',
    description: '封筒に入った手紙を近くの郵便ポストに投函してください。切手は貼ってあります。',
    type: 'errand',
    userId: 'user-1',
    userName: '田中 太郎',
    status: 'completed',
    priority: 'low',
    createdAt: '2025-05-03T14:20:00Z',
    dueDate: '2025-05-06T12:00:00Z',
    comments: [
      {
        id: 'comment-003',
        requestId: 'req-003',
        userId: 'helper-1',
        userName: '山田 太郎',
        userType: 'helper',
        content: '本日12時に最寄りの郵便ポストに投函完了しました。',
        createdAt: '2025-05-06T12:10:00Z'
      }
    ]
  },
  {
    id: 'req-004',
    title: '野菜の買い物',
    description: '近くのスーパーでじゃがいも、にんじん、玉ねぎを購入してください。',
    type: 'errand',
    userId: 'user-3',
    userName: '鈴木 一郎',
    status: 'pending',
    priority: 'medium',
    createdAt: '2025-05-04T16:30:00Z',
    dueDate: '2025-05-13T10:00:00Z'
  },
  {
    id: 'req-005',
    title: 'アジの塩焼き',
    description: 'アジを3匹、塩焼きにしてください。シンプルに塩だけで焼いてください。',
    type: 'cooking',
    userId: 'user-4',
    userName: '高橋 真理',
    status: 'completed',
    priority: 'high',
    createdAt: '2025-05-05T11:45:00Z',
    dueDate: '2025-05-08T19:00:00Z',
    ingredients: ['アジ', '塩'],
    feedbackId: 'feedback-001',
    comments: [
      {
        id: 'comment-004',
        requestId: 'req-005',
        userId: 'helper-1',
        userName: '山田 太郎',
        userType: 'helper',
        content: '完了しました。食べやすいように骨も取り除いておきました。',
        createdAt: '2025-05-08T18:30:00Z'
      },
      {
        id: 'comment-005',
        requestId: 'req-005',
        userId: 'user-4',
        userName: '高橋 真理',
        userType: 'user',
        content: 'ありがとうございます。とても美味しかったです。',
        createdAt: '2025-05-08T20:15:00Z'
      }
    ]
  },
  {
    id: 'req-006',
    title: '照り焼きチキンの調理',
    description: '甘めの味付けでお願いします。付け合わせにブロッコリーも茹でてください。',
    type: 'cooking',
    userId: 'user-5',
    userName: '伊藤 健太',
    status: 'pending',
    priority: 'high',
    createdAt: '2025-05-07T08:20:00Z',
    dueDate: '2025-05-12T18:30:00Z',
    recipeUrl: 'https://cookpad.com/recipe/345678',
    ingredients: ['鶏もも肉', '醤油', 'みりん', '砂糖', 'ブロッコリー']
  },
  {
    id: 'req-007',
    title: '部屋の換気',
    description: '10時から12時の間に10分ほど窓を開けて換気をお願いします。',
    type: 'other',
    userId: 'user-2',
    userName: '佐藤 花子',
    status: 'cancelled',
    priority: 'medium',
    createdAt: '2025-05-08T09:00:00Z',
    dueDate: '2025-05-10T10:00:00Z',
    comments: [
      {
        id: 'comment-006',
        requestId: 'req-007',
        userId: 'user-2',
        userName: '佐藤 花子',
        userType: 'user',
        content: '天気予報で雨とのことなので、キャンセルさせてください。',
        createdAt: '2025-05-09T18:00:00Z'
      }
    ]
  },
  {
    id: 'req-008',
    title: '豚汁の調理',
    description: '具だくさんの豚汁をお願いします。味噌は赤味噌を使ってください。',
    type: 'cooking',
    userId: 'user-1',
    userName: '田中 太郎',
    status: 'pending',
    priority: 'medium',
    createdAt: '2025-05-09T15:30:00Z',
    dueDate: '2025-05-16T19:00:00Z',
    ingredients: ['豚肉', '大根', 'にんじん', 'ごぼう', '里芋', '長ネギ', '豆腐', '赤味噌']
  }
];
