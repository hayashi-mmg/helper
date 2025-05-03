"""
JWTトークン生成・検証機能、パスワードハッシュ化機能のユニットテスト
"""
import pytest
from datetime import timedelta
from jose import JWTError
from app.core import auth

# JWTトークン生成・検証のテスト

def test_create_and_decode_access_token():
    """
    アクセストークンの生成とデコードが正常に動作することを確認
    """
    data = {"sub": "testuser"}
    token = auth.create_access_token(data)
    decoded = auth.decode_jwt_token(token)
    assert decoded["sub"] == "testuser"
    assert "exp" in decoded

def test_access_token_expiration():
    """
    有効期限切れトークンの検証で例外が発生することを確認
    """
    data = {"sub": "testuser"}
    token = auth.create_access_token(data, expires_delta=timedelta(seconds=-1))
    with pytest.raises(JWTError):
        auth.decode_jwt_token(token)

# パスワードハッシュ化・検証のテスト

def test_password_hash_and_verify():
    """
    パスワードのハッシュ化と検証が正常に動作することを確認
    """
    password = "secure_password_123"
    hashed = auth.get_password_hash(password)
    assert auth.verify_password(password, hashed)
    assert not auth.verify_password("wrong_password", hashed)
