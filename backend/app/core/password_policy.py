"""
パスワードポリシー実装
"""
import re
from typing import Dict, List, Tuple

class PasswordPolicy:
    """
    パスワードポリシーの検証を行うクラス
    """
    def __init__(
        self,
        min_length: int = 8,
        require_uppercase: bool = True,
        require_lowercase: bool = True,
        require_digit: bool = True,
        require_special: bool = True,
        min_unique_chars: int = 4,
        max_sequential_chars: int = 3
    ):
        self.min_length = min_length
        self.require_uppercase = require_uppercase
        self.require_lowercase = require_lowercase
        self.require_digit = require_digit
        self.require_special = require_special
        self.min_unique_chars = min_unique_chars
        self.max_sequential_chars = max_sequential_chars
        
        # 特殊文字の正規表現
        self.special_pattern = r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>/?\\|]'
    
    def validate(self, password: str) -> Tuple[bool, List[str]]:
        """
        パスワードがポリシーに適合するか検証
        
        Args:
            password: 検証するパスワード
            
        Returns:
            Tuple[bool, List[str]]: (有効か, エラーメッセージのリスト)
        """
        errors = []
        
        # 長さのチェック
        if len(password) < self.min_length:
            errors.append(f"パスワードは{self.min_length}文字以上である必要があります。")
        
        # 大文字のチェック
        if self.require_uppercase and not any(c.isupper() for c in password):
            errors.append("パスワードには少なくとも1つの大文字を含める必要があります。")
        
        # 小文字のチェック
        if self.require_lowercase and not any(c.islower() for c in password):
            errors.append("パスワードには少なくとも1つの小文字を含める必要があります。")
        
        # 数字のチェック
        if self.require_digit and not any(c.isdigit() for c in password):
            errors.append("パスワードには少なくとも1つの数字を含める必要があります。")
        
        # 特殊文字のチェック
        if self.require_special and not re.search(self.special_pattern, password):
            errors.append("パスワードには少なくとも1つの特殊文字を含める必要があります。")
        
        # ユニーク文字数のチェック
        if len(set(password)) < self.min_unique_chars:
            errors.append(f"パスワードには少なくとも{self.min_unique_chars}種類の異なる文字を含める必要があります。")
        
        # 連続する文字のチェック
        for i in range(len(password) - self.max_sequential_chars + 1):
            substring = password[i:i+self.max_sequential_chars]
            # 連続する数字（123, 321など）
            if substring.isdigit() and self._is_sequential(substring):
                errors.append(f"{self.max_sequential_chars}文字以上の連続した数字は使用できません。")
                break
            # 連続するアルファベット（abc, cbaなど）
            if substring.isalpha() and self._is_sequential(substring.lower()):
                errors.append(f"{self.max_sequential_chars}文字以上の連続したアルファベットは使用できません。")
                break
        
        return len(errors) == 0, errors
    
    def _is_sequential(self, string: str) -> bool:
        """連続した文字かどうか判定"""
        # 昇順チェック
        asc_diff = sum(ord(string[i+1]) - ord(string[i]) == 1 for i in range(len(string)-1))
        # 降順チェック
        desc_diff = sum(ord(string[i]) - ord(string[i+1]) == 1 for i in range(len(string)-1))
        
        # すべての文字が連続している場合
        return asc_diff == len(string) - 1 or desc_diff == len(string) - 1
    
    def get_policy_description(self) -> Dict[str, any]:
        """パスワードポリシーの説明を取得"""
        return {
            "min_length": self.min_length,
            "require_uppercase": self.require_uppercase,
            "require_lowercase": self.require_lowercase,
            "require_digit": self.require_digit,
            "require_special": self.require_special,
            "min_unique_chars": self.min_unique_chars,
            "max_sequential_chars": self.max_sequential_chars,
        }
    
    def get_policy_summary(self) -> str:
        """パスワードポリシーの要約を取得"""
        rules = []
        rules.append(f"・{self.min_length}文字以上")
        
        if self.require_uppercase:
            rules.append("・大文字を含む")
        if self.require_lowercase:
            rules.append("・小文字を含む")
        if self.require_digit:
            rules.append("・数字を含む")
        if self.require_special:
            rules.append("・特殊文字を含む")
        
        rules.append(f"・{self.min_unique_chars}種類以上の文字を使用")
        rules.append(f"・{self.max_sequential_chars}文字以上の連続した文字を含まない")
        
        return "\n".join(rules)
