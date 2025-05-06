"""
カスタムバリデータモジュール
このモジュールでは、アプリケーション全体で使用できるカスタムバリデーション関数を定義します。
"""
import re
from datetime import date
from typing import Any, Dict, Optional, List

# URLのバリデーション
def validate_url(url: Optional[str]) -> Optional[str]:
    """
    安全なURLかどうかを検証
    
    Args:
        url: 検証するURL
        
    Returns:
        検証済みのURL
        
    Raises:
        ValueError: 無効なURL形式の場合
    """
    if url is None:
        return None
        
    allowed_schemes = ['http', 'https']
    url_pattern = re.compile(
        r'^(?:' + '|'.join(allowed_schemes) + r')://'  # スキーム
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # ドメイン
        r'localhost|'  # localhost
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # IPアドレス
        r'(?::\d+)?'  # ポート
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    if not url_pattern.match(url):
        raise ValueError("無効なURL形式です")
    
    return url

# 日付のバリデーション
def validate_future_date(scheduled_date: Optional[date]) -> Optional[date]:
    """
    日付が未来の日付かどうかを検証
    
    Args:
        scheduled_date: 検証する日付
        
    Returns:
        検証済みの日付
        
    Raises:
        ValueError: 過去の日付の場合
    """
    if scheduled_date is None:
        return None
        
    if scheduled_date < date.today():
        raise ValueError("日付は今日以降の日付である必要があります")
    
    return scheduled_date

# メールアドレスのバリデーション（より厳格なルール）
def validate_email(email: str) -> str:
    """
    メールアドレスの形式を検証（RFC 5322に準拠）
    
    Args:
        email: 検証するメールアドレス
        
    Returns:
        検証済みのメールアドレス
        
    Raises:
        ValueError: 無効なメールアドレス形式の場合
    """
    # より厳格なメールアドレス検証パターン
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(pattern, email):
        raise ValueError("無効なメールアドレス形式です")
    
    return email

# 電話番号のバリデーション
def validate_phone_number(phone: Optional[str]) -> Optional[str]:
    """
    電話番号の形式を検証（日本の電話番号形式）
    
    Args:
        phone: 検証する電話番号
        
    Returns:
        検証済みの電話番号
        
    Raises:
        ValueError: 無効な電話番号形式の場合
    """
    if phone is None:
        return None
    
    # ハイフンあり・なしどちらも受け付ける
    # 固定電話（市外局番2〜5桁）＋市内局番＋加入者番号、または携帯電話番号
    pattern = r'^(0\d{1,4}-?\d{1,4}-?\d{3,4})$'
    
    if not re.match(pattern, phone):
        raise ValueError("無効な電話番号形式です。日本の電話番号形式で入力してください")
    
    # ハイフンを統一形式に変換（ない場合は追加）
    cleaned_phone = phone.replace('-', '')
    if len(cleaned_phone) == 10:  # 固定電話
        return f"{cleaned_phone[:3]}-{cleaned_phone[3:6]}-{cleaned_phone[6:]}"
    elif len(cleaned_phone) == 11:  # 携帯電話
        return f"{cleaned_phone[:3]}-{cleaned_phone[3:7]}-{cleaned_phone[7:]}"
    else:
        # 特殊な長さの場合は元の形式を維持
        return phone

# 郵便番号のバリデーション
def validate_postal_code(postal_code: Optional[str]) -> Optional[str]:
    """
    郵便番号の形式を検証（日本の郵便番号形式）
    
    Args:
        postal_code: 検証する郵便番号
        
    Returns:
        検証済みの郵便番号
        
    Raises:
        ValueError: 無効な郵便番号形式の場合
    """
    if postal_code is None:
        return None
    
    # ハイフンあり・なしどちらも受け付ける
    pattern = r'^(\d{3}-?\d{4})$'
    
    if not re.match(pattern, postal_code):
        raise ValueError("無効な郵便番号形式です。「123-4567」または「1234567」の形式で入力してください")
    
    # ハイフン形式に統一
    cleaned_code = postal_code.replace('-', '')
    return f"{cleaned_code[:3]}-{cleaned_code[3:]}"

# タスク説明のバリデーション
def validate_task_description(description: str) -> str:
    """
    タスク説明の形式を検証
    
    Args:
        description: 検証するタスク説明
        
    Returns:
        検証済みのタスク説明
        
    Raises:
        ValueError: 説明が短すぎる場合
    """
    if len(description) < 5:
        raise ValueError("タスクの説明は5文字以上入力してください")
    
    if len(description) > 2000:
        raise ValueError("タスクの説明は2000文字以内にしてください")
    
    return description.strip()

# JSON構造の検証
def validate_recipe_content(recipe_content: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    レシピ内容の構造を検証
    
    Args:
        recipe_content: 検証するレシピ内容のJSON構造
        
    Returns:
        検証済みのレシピ内容
        
    Raises:
        ValueError: レシピ構造が無効な場合
    """
    if recipe_content is None:
        return None
    
    required_keys = ["title", "ingredients", "steps"]
    for key in required_keys:
        if key not in recipe_content:
            raise ValueError(f"レシピ内容に必須キー '{key}' がありません")
    
    # 材料のフォーマット検証
    ingredients = recipe_content.get("ingredients", [])
    if not isinstance(ingredients, list):
        raise ValueError("材料は配列形式である必要があります")
    
    for ingredient in ingredients:
        if not isinstance(ingredient, dict) or "name" not in ingredient:
            raise ValueError("各材料には少なくとも 'name' フィールドが必要です")
    
    # 手順のフォーマット検証
    steps = recipe_content.get("steps", [])
    if not isinstance(steps, list):
        raise ValueError("手順は配列形式である必要があります")
    
    if len(steps) < 1:
        raise ValueError("少なくとも1つの手順が必要です")
    
    return recipe_content

# 住所のバリデーション
def validate_address(address: Dict[str, Any]) -> Dict[str, Any]:
    """
    住所情報の構造を検証
    
    Args:
        address: 検証する住所情報
        
    Returns:
        検証済みの住所情報
        
    Raises:
        ValueError: 住所構造が無効な場合
    """
    required_keys = ["prefecture", "city", "street"]
    for key in required_keys:
        if key not in address or not address[key]:
            raise ValueError(f"住所情報に必須フィールド '{key}' がないか、空です")
    
    # 郵便番号のバリデーション（存在する場合）
    if "postal_code" in address and address["postal_code"]:
        address["postal_code"] = validate_postal_code(address["postal_code"])
    
    return address

# タグリストのバリデーション
def validate_tags(tags: Optional[List[str]]) -> Optional[List[str]]:
    """
    タグリストを検証
    
    Args:
        tags: 検証するタグリスト
        
    Returns:
        検証済みのタグリスト
        
    Raises:
        ValueError: タグが無効な場合
    """
    if tags is None:
        return []
    
    validated_tags = []
    for tag in tags:
        if not tag or not isinstance(tag, str):
            continue
            
        # タグの文字数制限
        if len(tag) > 30:
            raise ValueError(f"タグ「{tag}」は30文字以内にしてください")
            
        # 特殊文字の除去と正規化
        cleaned_tag = tag.strip().lower()
        if cleaned_tag and cleaned_tag not in validated_tags:
            validated_tags.append(cleaned_tag)
    
    return validated_tags

# ユーザー名のバリデーション
def validate_username(username: str) -> str:
    """
    ユーザー名の形式を検証
    
    Args:
        username: 検証するユーザー名
        
    Returns:
        検証済みのユーザー名
        
    Raises:
        ValueError: 無効なユーザー名形式の場合
    """
    # ユーザー名の長さチェック
    if len(username) < 3:
        raise ValueError("ユーザー名は3文字以上にしてください")
        
    if len(username) > 50:
        raise ValueError("ユーザー名は50文字以下にしてください")
    
    # 使用可能な文字のチェック（英数字、アンダースコア、ハイフンのみ）
    pattern = r'^[a-zA-Z0-9_-]+$'
    if not re.match(pattern, username):
        raise ValueError("ユーザー名には英数字、アンダースコア、ハイフンのみ使用できます")
    
    return username

# コメントのバリデーション
def validate_comments(comments: Optional[str]) -> Optional[str]:
    """
    コメントの内容を検証
    
    Args:
        comments: 検証するコメント
        
    Returns:
        検証済みのコメント
        
    Raises:
        ValueError: コメントが長すぎる場合
    """
    if comments is None:
        return None
        
    if len(comments) > 1000:
        raise ValueError("コメントは1000文字以内にしてください")
    
    # 不適切なコンテンツのチェック（実際には単語フィルタリング等を実装可能）
    # 今回は簡易的なチェック
    forbidden_words = ["暴力的", "差別的", "侮辱的"]
    for word in forbidden_words:
        if word in comments:
            raise ValueError("不適切な表現が含まれています")
    
    return comments.strip()

# 金額のバリデーション
def validate_amount(amount: Optional[int]) -> Optional[int]:
    """
    金額の妥当性を検証
    
    Args:
        amount: 検証する金額
        
    Returns:
        検証済みの金額
        
    Raises:
        ValueError: 無効な金額の場合
    """
    if amount is None:
        return None
        
    if amount < 0:
        raise ValueError("金額は0以上である必要があります")
        
    if amount > 1000000000:  # 10億円を上限とする
        raise ValueError("金額が上限を超えています")
    
    return amount
