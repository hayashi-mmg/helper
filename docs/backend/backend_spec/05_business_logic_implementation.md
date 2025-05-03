## 5. ビジネスロジック実装

### 5.1 レシピ解析

クックパッドなどのレシピURLから情報を抽出するモジュールを実装します。

```python
# app/utils/recipe_parser.py
import httpx
from bs4 import BeautifulSoup
from typing import Dict, List, Optional, Any

async def parse_recipe_url(url: str) -> Optional[Dict[str, Any]]:
    """
    レシピURLからレシピ情報を抽出
    
    Args:
        url: レシピのURL（クックパッドなど）
        
    Returns:
        Dict[str, Any]: 抽出されたレシピ情報
            {
                "title": "レシピタイトル",
                "ingredients": [{"name": "材料名", "amount": "量"}],
                "steps": ["手順1", "手順2", ...],
                "servings": "〇人前",
                "cooking_time": "〇分"
            }
    """
    # URLが対応サイトかチェック
    supported_sites = ["cookpad.com", "recipe.rakuten.co.jp", "erecipe.woman.excite.co.jp"]
    if not any(site in url for site in supported_sites):
        return None
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            
            html = response.text
            soup = BeautifulSoup(html, 'html.parser')
            
            # サイトによって異なるパーサーを呼び出し
            if "cookpad.com" in url:
                return parse_cookpad(soup)
            elif "recipe.rakuten.co.jp" in url:
                return parse_rakuten_recipe(soup)
            elif "erecipe.woman.excite.co.jp" in url:
                return parse_excite_recipe(soup)
            
            return None
            
    except Exception as e:
        # エラーログを記録
        return None

def parse_cookpad(soup: BeautifulSoup) -> Dict[str, Any]:
    """クックパッドのHTMLからレシピ情報を抽出"""
    # 実装詳細...
    
def parse_rakuten_recipe(soup: BeautifulSoup) -> Dict[str, Any]:
    """楽天レシピのHTMLからレシピ情報を抽出"""
    # 実装詳細...
    
def parse_excite_recipe(soup: BeautifulSoup) -> Dict[str, Any]:
    """エキサイトレシピのHTMLからレシピ情報を抽出"""
    # 実装詳細...
```

### 5.2 QRコード生成

リクエストやフィードバックフォームへのアクセスを容易にするQRコード生成機能を実装します。

```python
# app/utils/qrcode_generator.py
import qrcode
from io import BytesIO
import base64
from datetime import datetime, timedelta
import os
from typing import Optional

def generate_qrcode(
    url: str,
    size: int = 200,
    file_path: Optional[str] = None
) -> str:
    """
    URLからQRコードを生成
    
    Args:
        url: QRコード化するURL
        size: QRコードのサイズ（ピクセル）
        file_path: 保存先パ
