# ヘルパー支援システム データベース設計書

## 1. ユーザー関連テーブル

### 1.1 `users` - ユーザーテーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| username | VARCHAR(50) | No | - | ユーザー名 |
| email | VARCHAR(100) | No | - | メールアドレス(ユニーク) |
| password_hash | VARCHAR(255) | No | - | パスワードハッシュ |
| role | VARCHAR(20) | No | 'user' | ロール(user, helper, admin) |
| is_active | BOOLEAN | No | TRUE | アクティブ状態 |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- `email` (ユニーク)
- `username` (ユニーク)

### 1.2 `user_profiles` - ユーザープロファイルテーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| user_id | INTEGER | No | - | ユーザーID(外部キー) |
| full_name | VARCHAR(100) | Yes | NULL | 氏名 |
| phone_number | VARCHAR(20) | Yes | NULL | 電話番号 |
| address | VARCHAR(255) | Yes | NULL | 住所 |
| preferences | JSON | Yes | NULL | 食事の好み・アレルギー情報など |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- `user_id` (外部キー)

### 1.3 `helper_profiles` - ヘルパープロファイルテーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| user_id | INTEGER | No | - | ユーザーID(外部キー) |
| qualification | VARCHAR(100) | Yes | NULL | 資格情報 |
| specialties | JSON | Yes | NULL | 得意料理・スキル情報 |
| availability | JSON | Yes | NULL | 稼働可能時間情報 |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- `user_id` (外部キー)

### 1.4 `user_helper_relationships` - ユーザーとヘルパーの関連テーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| user_id | INTEGER | No | - | ユーザーID(外部キー) |
| helper_id | INTEGER | No | - | ヘルパーID(外部キー) |
| status | VARCHAR(20) | No | 'active' | 状態(active, inactive, pending) |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- `user_id` (外部キー)
- `helper_id` (外部キー)
- `user_id, helper_id` (複合ユニーク)

## 2. リクエスト関連テーブル

### 2.1 `recipe_requests` - 料理リクエストテーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| user_id | INTEGER | No | - | 作成したユーザーID(外部キー) |
| title | VARCHAR(200) | No | - | 料理タイトル |
| description | TEXT | Yes | NULL | 詳細説明 |
| recipe_url | VARCHAR(512) | Yes | NULL | レシピURL(クックパッドなど) |
| recipe_content | TEXT | Yes | NULL | レシピ内容(オプション) |
| scheduled_date | DATE | Yes | NULL | 予定日 |
| status | VARCHAR(20) | No | 'pending' | 状態(pending, active, completed, cancelled) |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- `user_id` (外部キー)
- `status`
- `scheduled_date`

### 2.2 `task_requests` - お願いごとリクエストテーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| user_id | INTEGER | No | - | 作成したユーザーID(外部キー) |
| title | VARCHAR(200) | No | - | お願いごとタイトル |
| description | TEXT | No | - | 詳細説明 |
| priority | INTEGER | No | 3 | 優先度(1: 高 - 5: 低) |
| scheduled_date | DATE | Yes | NULL | 予定日 |
| status | VARCHAR(20) | No | 'pending' | 状態(pending, active, completed, cancelled) |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- `user_id` (外部キー)
- `status`
- `scheduled_date`
- `priority`

### 2.3 `request_assignments` - リクエスト割り当てテーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| request_type | VARCHAR(20) | No | - | リクエスト種別('recipe', 'task') |
| request_id | INTEGER | No | - | リクエストID |
| helper_id | INTEGER | No | - | 担当ヘルパーID(外部キー) |
| assigned_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 割り当て日時 |
| status | VARCHAR(20) | No | 'assigned' | 状態(assigned, in_progress, completed) |
| completed_at | TIMESTAMP | Yes | NULL | 完了日時 |
| notes | TEXT | Yes | NULL | メモ |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- `request_type, request_id` (複合インデックス)
- `helper_id` (外部キー)
- `status`

## 3. フィードバック関連テーブル

### 3.1 `recipe_feedbacks` - 料理フィードバックテーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| recipe_request_id | INTEGER | No | - | 料理リクエストID(外部キー) |
| user_id | INTEGER | No | - | フィードバック提供ユーザーID(外部キー) |
| taste_rating | INTEGER | No | - | 味付け評価(1-5) |
| texture_rating | INTEGER | No | - | 食感評価(1-5) |
| quantity_rating | INTEGER | No | - | 量の評価(1-5) |
| overall_rating | INTEGER | No | - | 総合評価(1-5) |
| comments | TEXT | Yes | NULL | コメント |
| request_for_next | TEXT | Yes | NULL | 次回への要望 |
| photo_url | VARCHAR(512) | Yes | NULL | 料理写真URL |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- `recipe_request_id` (外部キー)
- `user_id` (外部キー)

### 3.2 `feedback_responses` - フィードバック返信テーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| feedback_id | INTEGER | No | - | フィードバックID(外部キー) |
| helper_id | INTEGER | No | - | 返信ヘルパーID(外部キー) |
| response_text | TEXT | No | - | 返信内容 |
| cooking_notes | TEXT | Yes | NULL | 次回調理時のメモ |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- `feedback_id` (外部キー)
- `helper_id` (外部キー)

## 4. QRコード関連テーブル

### 4.1 `qr_codes` - QRコードテーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| target_type | VARCHAR(20) | No | - | 対象タイプ(RECIPE, TASK, FEEDBACK_FORM など) |
| target_id | INTEGER | No | - | 対象ID |
| url | VARCHAR(512) | No | - | QRコードが指すURL |
| title | VARCHAR(200) | No | - | QRコードのタイトル |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 作成日時 |
| expire_at | TIMESTAMP | Yes | NULL | 有効期限 |
| created_by | INTEGER | No | - | 作成者ID(外部キー) |
| access_count | INTEGER | No | 0 | アクセス回数 |

**インデックス**:
- `target_type, target_id` (複合インデックス)
- `created_by` (外部キー)
- `expire_at`

## 5. ログ関連テーブル

### 5.1 `application_logs` - アプリケーションログテーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| timestamp | TIMESTAMP | No | CURRENT_TIMESTAMP | タイムスタンプ |
| level | VARCHAR(20) | No | - | ログレベル(INFO, WARNING, ERROR, CRITICAL) |
| source | VARCHAR(50) | No | - | ログソース |
| message | TEXT | No | - | ログメッセージ |
| user_id | INTEGER | Yes | NULL | 関連ユーザーID |
| endpoint | VARCHAR(200) | Yes | NULL | APIエンドポイント |
| ip_address | VARCHAR(50) | Yes | NULL | IPアドレス |
| user_agent | VARCHAR(255) | Yes | NULL | ユーザーエージェント |
| request_id | VARCHAR(50) | Yes | NULL | リクエストID |
| additional_data | JSON | Yes | NULL | 追加データ |

**インデックス**:
- `timestamp`
- `level`
- `source`
- `user_id`

### 5.2 `audit_logs` - 監査ログテーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| timestamp | TIMESTAMP | No | CURRENT_TIMESTAMP | タイムスタンプ |
| user_id | INTEGER | No | - | 実行ユーザーID |
| action | VARCHAR(50) | No | - | 実行アクション(CREATE, UPDATE, DELETE など) |
| resource_type | VARCHAR(50) | No | - | リソースタイプ |
| resource_id | INTEGER | Yes | NULL | リソースID |
| previous_state | JSON | Yes | NULL | 変更前の状態 |
| new_state | JSON | Yes | NULL | 変更後の状態 |
| ip_address | VARCHAR(50) | Yes | NULL | IPアドレス |
| user_agent | VARCHAR(255) | Yes | NULL | ユーザーエージェント |
| additional_data | JSON | Yes | NULL | 追加データ |

**インデックス**:
- `timestamp`
- `user_id`
- `action`
- `resource_type, resource_id`

### 5.3 `performance_logs` - パフォーマンスログテーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| timestamp | TIMESTAMP | No | CURRENT_TIMESTAMP | タイムスタンプ |
| endpoint | VARCHAR(200) | No | - | エンドポイント |
| response_time | INTEGER | No | - | レスポンス時間(ミリ秒) |
| status_code | INTEGER | Yes | NULL | HTTPステータスコード |
| request_method | VARCHAR(10) | Yes | NULL | HTTPメソッド |
| request_size | INTEGER | Yes | NULL | リクエストサイズ |
| response_size | INTEGER | Yes | NULL | レスポンスサイズ |
| user_id | INTEGER | Yes | NULL | ユーザーID |
| ip_address | VARCHAR(50) | Yes | NULL | IPアドレス |
| additional_metrics | JSON | Yes | NULL | 追加メトリクス |

**インデックス**:
- `timestamp`
- `endpoint`
- `response_time`

## 6. 設定・システム関連テーブル

### 6.1 `system_settings` - システム設定テーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| setting_key | VARCHAR(100) | No | - | 設定キー |
| setting_value | TEXT | Yes | NULL | 設定値 |
| data_type | VARCHAR(20) | No | 'string' | データ型(string, number, boolean, json) |
| description | VARCHAR(255) | Yes | NULL | 設定の説明 |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- `setting_key` (ユニーク)

### 6.2 `notifications` - 通知テーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| user_id | INTEGER | No | - | 通知対象ユーザーID |
| type | VARCHAR(50) | No | - | 通知タイプ |
| title | VARCHAR(200) | No | - | 通知タイトル |
| content | TEXT | No | - | 通知内容 |
| read | BOOLEAN | No | FALSE | 既読フラグ |
| action_url | VARCHAR(512) | Yes | NULL | アクション用URL |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 作成日時 |

**インデックス**:
- `user_id` (外部キー)
- `read`
- `created_at`

## 7. 画像管理テーブル

### 7.1 `media_files` - メディアファイル管理テーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| file_name | VARCHAR(255) | No | - | ファイル名 |
| file_path | VARCHAR(512) | No | - | ファイルパス |
| file_type | VARCHAR(50) | No | - | ファイルタイプ(image/jpeg, image/png など) |
| file_size | INTEGER | No | - | ファイルサイズ(バイト) |
| entity_type | VARCHAR(50) | No | - | 関連エンティティタイプ(recipe, feedback など) |
| entity_id | INTEGER | No | - | 関連エンティティID |
| uploaded_by | INTEGER | No | - | アップロードユーザーID |
| title | VARCHAR(200) | Yes | NULL | タイトル |
| description | TEXT | Yes | NULL | 説明 |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- `entity_type, entity_id` (複合インデックス)
- `uploaded_by` (外部キー)
- `file_type`

## 8. スケジュール管理テーブル

### 8.1 `schedules` - スケジュールテーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| helper_id | INTEGER | No | - | ヘルパーID(外部キー) |
| user_id | INTEGER | No | - | ユーザーID(外部キー) |
| title | VARCHAR(200) | No | - | 予定タイトル |
| description | TEXT | Yes | NULL | 予定詳細 |
| start_datetime | TIMESTAMP | No | - | 開始日時 |
| end_datetime | TIMESTAMP | No | - | 終了日時 |
| all_day | BOOLEAN | No | FALSE | 終日フラグ |
| location | VARCHAR(255) | Yes | NULL | 場所 |
| status | VARCHAR(20) | No | 'scheduled' | 状態(scheduled, completed, cancelled) |
| request_type | VARCHAR(20) | Yes | NULL | 関連リクエストタイプ(recipe, task) |
| request_id | INTEGER | Yes | NULL | 関連リクエストID |
| recurrence_rule | TEXT | Yes | NULL | 繰り返しルール(iCal形式) |
| recurrence_parent_id | INTEGER | Yes | NULL | 繰り返し親ID |
| reminder_minutes | INTEGER | Yes | NULL | リマインダー時間(分前) |
| color | VARCHAR(20) | Yes | NULL | カラー表示設定 |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- `helper_id` (外部キー)
- `user_id` (外部キー)
- `start_datetime`
- `end_datetime`
- `request_type, request_id` (複合インデックス)
- `recurrence_parent_id` (外部キー)

### 8.2 `helper_availability` - ヘルパー稼働可能時間テーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| helper_id | INTEGER | No | - | ヘルパーID(外部キー) |
| day_of_week | INTEGER | No | - | 曜日(0:日〜6:土) |
| start_time | TIME | No | - | 開始時間 |
| end_time | TIME | No | - | 終了時間 |
| is_available | BOOLEAN | No | TRUE | 稼働可能フラグ |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- `helper_id` (外部キー)
- `day_of_week`
- `helper_id, day_of_week` (複合インデックス)

## 9. メッセージング機能テーブル

### 9.1 `conversations` - 会話テーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| title | VARCHAR(200) | Yes | NULL | 会話タイトル |
| user_id | INTEGER | No | - | ユーザーID(外部キー) |
| helper_id | INTEGER | No | - | ヘルパーID(外部キー) |
| status | VARCHAR(20) | No | 'active' | 状態(active, archived) |
| last_message_at | TIMESTAMP | Yes | NULL | 最終メッセージ日時 |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- `user_id` (外部キー)
- `helper_id` (外部キー)
- `user_id, helper_id` (複合インデックス)
- `last_message_at`

### 9.2 `messages` - メッセージテーブル

| カラム名 | データ型 | NULL許可 | デフォルト | 説明 |
|---------|---------|----------|------------|-----|
| id | INTEGER | No | - | 主キー、自動増分 |
| conversation_id | INTEGER | No | - | 会話ID(外部キー) |
| sender_id | INTEGER | No | - | 送信者ID(外部キー) |
| content | TEXT | No | - | メッセージ内容 |
| content_type | VARCHAR(20) | No | 'text' | 内容タイプ(text, image) |
| read | BOOLEAN | No | FALSE | 既読フラグ |
| read_at | TIMESTAMP | Yes | NULL | 既読日時 |
| reference_type | VARCHAR(20) | Yes | NULL | 参照タイプ(recipe, task, feedback) |
| reference_id | INTEGER | Yes | NULL | 参照ID |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- `conversation_id` (外部キー)
- `sender_id` (外部キー)
- `created_at`
- `reference_type, reference_id` (複合インデックス)

## 10. リレーション定義

1. `user_profiles` → `users` (多対一)
   - `user_profiles.user_id` → `users.id`

2. `helper_profiles` → `users` (多対一)
   - `helper_profiles.user_id` → `users.id`

3. `user_helper_relationships` → `users` (多対一)
   - `user_helper_relationships.user_id` → `users.id`
   - `user_helper_relationships.helper_id` → `users.id`

4. `recipe_requests` → `users` (多対一)
   - `recipe_requests.user_id` → `users.id`

5. `task_requests` → `users` (多対一)
   - `task_requests.user_id` → `users.id`

6. `request_assignments` → `users` (多対一)
   - `request_assignments.helper_id` → `users.id`

7. `recipe_feedbacks` → `recipe_requests` (多対一)
   - `recipe_feedbacks.recipe_request_id` → `recipe_requests.id`

8. `recipe_feedbacks` → `users` (多対一)
   - `recipe_feedbacks.user_id` → `users.id`

9. `feedback_responses` → `recipe_feedbacks` (多対一)
   - `feedback_responses.feedback_id` → `recipe_feedbacks.id`

10. `feedback_responses` → `users` (多対一)
    - `feedback_responses.helper_id` → `users.id`

11. `qr_codes` → `users` (多対一)
    - `qr_codes.created_by` → `users.id`

12. `notifications` → `users` (多対一)
    - `notifications.user_id` → `users.id`

13. `media_files` → `users` (多対一)
    - `media_files.uploaded_by` → `users.id`

14. `schedules` → `users` (多対一)
    - `schedules.helper_id` → `users.id`
    - `schedules.user_id` → `users.id`

15. `helper_availability` → `users` (多対一)
    - `helper_availability.helper_id` → `users.id`

16. `conversations` → `users` (多対一)
    - `conversations.user_id` → `users.id`
    - `conversations.helper_id` → `users.id`

17. `messages` → `conversations` (多対一)
    - `messages.conversation_id` → `conversations.id`

18. `messages` → `users` (多対一)
    - `messages.sender_id` → `users.id`

## 11. データベース設計の特徴と利点

1. **ユーザー種別の柔軟な管理**: 単一の`users`テーブルで異なるロールを管理し、プロファイル情報は別テーブルに分離

2. **リクエスト処理の効率化**: 料理リクエストとタスクリクエストを別テーブルに分け、割り当てを統一テーブルで管理

3. **フィードバック機能の充実**: 詳細なフィードバック情報とヘルパーの返信を記録

4. **QRコード機能のサポート**: QRコードの生成・管理情報を保持し、アクセス追跡も可能

5. **包括的なログ機能**: アプリケーションログ、監査ログ、パフォーマンスログの3種類に分類

6. **システム設定の柔軟性**: `system_settings`テーブルで様々な設定を動的に管理

7. **通知機能**: ユーザーとヘルパー間のコミュニケーションをサポート

8. **メディア管理**: 料理写真などのファイル管理のための専用テーブル

9. **スケジュール管理**: ヘルパーの稼働スケジュールと予定管理のための機能

10. **メッセージング機能**: ユーザーとヘルパー間の直接コミュニケーションをサポート

この設計により、ヘルパー支援システムの主要機能である「料理リクエスト管理」「お願いごと管理」「フィードバック機能」「QRコード機能」「多言語対応」などが効率的に実現できます。
