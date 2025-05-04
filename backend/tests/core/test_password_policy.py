"""
パスワードポリシーのテスト
"""
import pytest
from app.core.password_policy import PasswordPolicy

def test_password_policy_basic():
    """基本的なパスワードポリシー検証"""
    policy = PasswordPolicy()
    
    # 有効なパスワード
    valid, errors = policy.validate("Test1234!")
    assert valid is True
    assert len(errors) == 0
    
    # 短すぎるパスワード
    valid, errors = policy.validate("Abc123!")
    assert valid is False
    assert any("文字以上" in e for e in errors)
    
    # 大文字のない
    valid, errors = policy.validate("test1234!")
    assert valid is False
    assert any("大文字" in e for e in errors)
    
    # 小文字のない
    valid, errors = policy.validate("TEST1234!")
    assert valid is False
    assert any("小文字" in e for e in errors)
    
    # 数字のない
    valid, errors = policy.validate("TestAbcd!")
    assert valid is False
    assert any("数字" in e for e in errors)
    
    # 特殊文字のない
    valid, errors = policy.validate("TestAbcd1234")
    assert valid is False
    assert any("特殊文字" in e for e in errors)

def test_password_policy_unique_chars():
    """ユニーク文字数のテスト"""
    policy = PasswordPolicy(min_unique_chars=6)
    
    # 十分なユニーク文字
    valid, errors = policy.validate("Test1234!")
    assert valid is True
    assert len(errors) == 0
    
    # ユニーク文字が少ない
    valid, errors = policy.validate("Teeeest1!")
    assert valid is False
    assert any("種類" in e for e in errors)

def test_password_policy_sequential_chars():
    """連続文字のテスト"""
    policy = PasswordPolicy()
    
    # 連続する数字を含む
    valid, errors = policy.validate("Test123!")
    assert valid is True  # デフォルトでは3文字までOK
    
    # 連続する数字が多い
    valid, errors = policy.validate("Test1234!")
    assert valid is False
    assert any("連続した数字" in e for e in errors)
    
    # 連続するアルファベットが多い
    valid, errors = policy.validate("Testabcd1!")
    assert valid is False
    assert any("連続したアルファベット" in e for e in errors)

def test_password_policy_custom():
    """カスタムポリシーのテスト"""
    # より厳しいポリシー
    strict_policy = PasswordPolicy(
        min_length=12,
        min_unique_chars=8,
        max_sequential_chars=2
    )
    
    # 標準のポリシーでは有効だが厳しいポリシーでは無効
    valid, errors = policy.validate("Test1234!")
    assert valid is True
    
    valid, errors = strict_policy.validate("Test1234!")
    assert valid is False
    
    # 厳しいポリシーに適合
    valid, errors = strict_policy.validate("T3st!P@ssw0rd")
    assert valid is True

def test_policy_description():
    """ポリシー説明の取得テスト"""
    policy = PasswordPolicy(min_length=10)
    
    description = policy.get_policy_description()
    assert description["min_length"] == 10
    assert "require_uppercase" in description
    
    summary = policy.get_policy_summary()
    assert "10文字以上" in summary
    assert "大文字" in summary
