# フィードバック機能テスト

このディレクトリには、ヘルパーシステムのフィードバック機能に関するAPIテストが含まれています。

## 概要

フィードバック機能は、ユーザー（依頼者）がヘルパーの調理した料理に対して評価やコメントを提供し、ヘルパーがそれに対して返信できる機能です。この機能を通じて、サービス品質の向上と利用者満足度の向上を図ります。

## テスト対象API

このディレクトリには、以下のAPIエンドポイントに関するテストが含まれています：

1. `GET /api/v1/feedback` - フィードバック一覧取得
2. `POST /api/v1/feedback` - フィードバック作成
3. `GET /api/v1/feedback/{feedback_id}` - 特定フィードバック取得
4. `PUT /api/v1/feedback/{feedback_id}` - フィードバック更新
5. `POST /api/v1/feedback/{feedback_id}/response` - ヘルパー返信作成
6. `PUT /api/v1/feedback/{feedback_id}/response` - ヘルパー返信更新
7. `GET /api/v1/recipe-requests/{request_id}/feedback` - リクエストのフィードバック取得

## ファイル構成

- `test_get_feedback_list.md` - フィードバック一覧取得のテスト計画
- `test_post_feedback.md` - フィードバック作成のテスト計画
- `test_get_feedback_by_id.md` - 特定フィードバック取得のテスト計画
- `test_update_feedback.md` - フィードバック更新のテスト計画
- `test_post_feedback_response.md` - ヘルパー返信作成のテスト計画
- `test_update_feedback_response.md` - ヘルパー返信更新のテスト計画
- `test_get_request_feedback.md` - リクエストのフィードバック取得のテスト計画
- `feedback_test_fixtures.md` - テスト用フィクスチャ定義

## テスト実行方法

テストを実行するには、以下のコマンドを使用します：

```bash
# テストディレクトリに移動
cd backend

# フィードバック関連の全テストを実行
pytest tests/api/feedback/ -v

# 特定のテストファイルのみ実行
pytest tests/api/feedback/test_post_feedback.py -v

# 特定のテスト関数のみ実行
pytest tests/api/feedback/test_post_feedback.py::test_create_feedback_success -v
```

## テスト設計方針

フィードバック機能のテストでは、以下の点を重視しています：

1. **ユーザー種別ごとの権限検証**
   - 一般ユーザー、ヘルパー、管理者それぞれのアクセス権限を検証
   - 自分のデータ、担当データ、他者のデータへのアクセス制御を検証

2. **ビジネスルールの検証**
   - 完了した料理リクエストに対してのみフィードバック可能
   - 一つのリクエストに対して一つのフィードバックのみ作成可能
   - ヘルパーは担当ユーザーのフィードバックにのみ返信可能

3. **データの整合性検証**
   - 正しいデータ形式でのリクエスト・レスポンス
   - バリデーションルールの適用
   - 部分更新の正確な動作

4. **エラーケースの検証**
   - 不正な入力に対する適切なエラーレスポンス
   - リソースが見つからない場合の処理
   - 権限不足時の処理

## フィクスチャの活用

テストでは、共通のフィクスチャを活用して、テストデータの作成・管理を効率化しています。詳細は `feedback_test_fixtures.md` を参照してください。

## 注意事項

- テスト実行前に、テスト用データベースが適切に設定されていることを確認してください
- テストは互いに独立しており、テスト順序に依存しないように設計されています
- 各テスト終了後に、テストデータは自動的にクリーンアップされます
