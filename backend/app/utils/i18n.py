"""
多言語対応（i18n）のためのユーティリティ
"""
from typing import Dict, Any, Optional
import json
import os
from fastapi import Request
from app.config import settings

class I18n:
    """
    多言語対応クラス
    """
    def __init__(self):
        self.translations: Dict[str, Dict[str, str]] = {}
        self.default_language = settings.DEFAULT_LANGUAGE
        self.load_translations()
    
    def load_translations(self):
        """
        翻訳ファイルを読み込む
        """
        translations_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "locales")
        
        # ディレクトリ内の言語ファイルを読み込み
        if os.path.exists(translations_dir):
            for filename in os.listdir(translations_dir):
                if filename.endswith(".json"):
                    language_code = filename.split(".")[0]
                    file_path = os.path.join(translations_dir, filename)
                    
                    with open(file_path, "r", encoding="utf-8") as f:
                        self.translations[language_code] = json.load(f)
    
    def get_language(self, request: Optional[Request] = None) -> str:
        """
        リクエストから使用言語を取得する
        
        Args:
            request: FastAPIリクエスト
            
        Returns:
            言語コード
        """
        if request:
            # ヘッダーからAccept-Languageを取得
            accept_language = request.headers.get("Accept-Language", "")
            
            # 言語コードを解析（例: ja,en-US;q=0.9,en;q=0.8）
            if accept_language:
                languages = accept_language.split(",")
                for lang in languages:
                    code = lang.split(";")[0].strip()
                    if code in self.translations:
                        return code
                    # 例: en-US -> en
                    main_code = code.split("-")[0]
                    if main_code in self.translations:
                        return main_code
        
        return self.default_language
    
    def translate(self, key: str, language: Optional[str] = None, params: Optional[Dict[str, Any]] = None) -> str:
        """
        テキストを翻訳する
        
        Args:
            key: 翻訳キー
            language: 言語コード（指定しない場合はデフォルト言語）
            params: 置換用パラメータ
            
        Returns:
            翻訳されたテキスト
        """
        lang = language or self.default_language
        
        # 言語が存在しない場合はデフォルト言語にフォールバック
        if lang not in self.translations:
            lang = self.default_language
        
        # 翻訳キーが存在しない場合はキー自体を返す
        text = self.translations.get(lang, {}).get(key, key)
        
        # パラメータ置換（例: "Hello, {name}!" -> "Hello, World!"）
        if params:
            for param_key, param_value in params.items():
                text = text.replace(f"{{{param_key}}}", str(param_value))
        
        return text

# グローバルなインスタンス
i18n = I18n()

def _(key: str, params: Optional[Dict[str, Any]] = None, language: Optional[str] = None) -> str:
    """
    翻訳用のヘルパー関数
    
    Usage:
        _("welcome_message", {"name": "World"})
        
    Returns:
        翻訳されたテキスト
    """
    return i18n.translate(key, language, params)
