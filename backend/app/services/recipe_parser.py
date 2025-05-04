"""
レシピURL解析モジュール

このモジュールは、さまざまなレシピサイトのURLを解析し、
レシピ情報を抽出するための機能を提供します。
"""
import re
from typing import Optional, Dict, Any
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from abc import ABC, abstractmethod
from fastapi import HTTPException, status


class RecipeParser(ABC):
    """レシピ解析の基本クラス"""
    
    @abstractmethod
    async def parse(self, url: str) -> Dict[str, Any]:
        """
        レシピURLを解析し、構造化されたレシピ情報を返す
        
        Args:
            url: レシピページのURL
            
        Returns:
            構造化されたレシピ情報
        """
        pass
    
    async def fetch_content(self, url: str) -> str:
        """
        URLからHTMLコンテンツを取得
        
        Args:
            url: 取得するURL
            
        Returns:
            HTMLコンテンツ
            
        Raises:
            HTTPException: 取得に失敗した場合
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()
                return response.text
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"レシピURLを取得できませんでした: {str(e)}"
            )


class CookpadParser(RecipeParser):
    """クックパッドのレシピ解析クラス"""
    
    async def parse(self, url: str) -> Dict[str, Any]:
        """
        クックパッドのレシピURLを解析
        
        Args:
            url: クックパッドのレシピURL
            
        Returns:
            構造化されたレシピ情報
        """
        content = await self.fetch_content(url)
        soup = BeautifulSoup(content, 'html.parser')
        
        # レシピ名
        title_elem = soup.find('h1', class_='recipe-title')
        title = title_elem.text.strip() if title_elem else "不明なレシピ"
        
        # 材料
        ingredients = []
        ing_elems = soup.find_all('div', class_='ingredient-list-item')
        for ing in ing_elems:
            name_elem = ing.find('div', class_='ingredient-name')
            qty_elem = ing.find('div', class_='ingredient-quantity')
            
            name = name_elem.text.strip() if name_elem else ""
            quantity = qty_elem.text.strip() if qty_elem else ""
            
            if name:
                ingredients.append({
                    "name": name,
                    "quantity": quantity
                })
        
        # 手順
        steps = []
        step_elems = soup.find_all('div', class_='step')
        for i, step in enumerate(step_elems, 1):
            text_elem = step.find('p', class_='step-text')
            if text_elem:
                steps.append({
                    "number": i,
                    "text": text_elem.text.strip()
                })
        
        # 調理時間
        cooking_time = ""
        time_elem = soup.find('span', class_='cooking-time')
        if time_elem:
            cooking_time = time_elem.text.strip()
        
        return {
            "title": title,
            "ingredients": ingredients,
            "steps": steps,
            "cooking_time": cooking_time,
            "source_url": url,
            "source_site": "クックパッド"
        }


class RakutenRecipeParser(RecipeParser):
    """楽天レシピの解析クラス"""
    
    async def parse(self, url: str) -> Dict[str, Any]:
        """
        楽天レシピのURLを解析
        
        Args:
            url: 楽天レシピのURL
            
        Returns:
            構造化されたレシピ情報
        """
        content = await self.fetch_content(url)
        soup = BeautifulSoup(content, 'html.parser')
        
        # レシピ名
        title_elem = soup.find('h1', class_='recipe-title')
        title = title_elem.text.strip() if title_elem else "不明なレシピ"
        
        # 材料
        ingredients = []
        ing_container = soup.find('div', class_='ingredients-list')
        if ing_container:
            ing_elems = ing_container.find_all('li')
            for ing in ing_elems:
                name_elem = ing.find('span', class_='ingredient-name')
                qty_elem = ing.find('span', class_='ingredient-quantity')
                
                name = name_elem.text.strip() if name_elem else ""
                quantity = qty_elem.text.strip() if qty_elem else ""
                
                if name:
                    ingredients.append({
                        "name": name,
                        "quantity": quantity
                    })
        
        # 手順
        steps = []
        step_elems = soup.find_all('div', class_='procedure')
        for i, step in enumerate(step_elems, 1):
            text_elem = step.find('p')
            if text_elem:
                steps.append({
                    "number": i,
                    "text": text_elem.text.strip()
                })
        
        # 調理時間
        cooking_time = ""
        time_elem = soup.find('span', class_='cooking-time')
        if time_elem:
            cooking_time = time_elem.text.strip()
        
        return {
            "title": title,
            "ingredients": ingredients,
            "steps": steps,
            "cooking_time": cooking_time,
            "source_url": url,
            "source_site": "楽天レシピ"
        }


class ExciteRecipeParser(RecipeParser):
    """エキサイトレシピの解析クラス"""
    
    async def parse(self, url: str) -> Dict[str, Any]:
        """
        エキサイトレシピのURLを解析
        
        Args:
            url: エキサイトレシピのURL
            
        Returns:
            構造化されたレシピ情報
        """
        content = await self.fetch_content(url)
        soup = BeautifulSoup(content, 'html.parser')
        
        # レシピ名
        title_elem = soup.find('h1', class_='recipe-title')
        title = title_elem.text.strip() if title_elem else "不明なレシピ"
        
        # 材料
        ingredients = []
        ing_container = soup.find('div', class_='ingredients')
        if ing_container:
            ing_elems = ing_container.find_all('li')
            for ing in ing_elems:
                parts = ing.text.strip().split(" ")
                if len(parts) >= 2:
                    name = parts[0].strip()
                    quantity = " ".join(parts[1:]).strip()
                    
                    ingredients.append({
                        "name": name,
                        "quantity": quantity
                    })
        
        # 手順
        steps = []
        step_container = soup.find('div', class_='instructions')
        if step_container:
            step_elems = step_container.find_all('li')
            for i, step in enumerate(step_elems, 1):
                steps.append({
                    "number": i,
                    "text": step.text.strip()
                })
        
        # 調理時間
        cooking_time = ""
        time_elem = soup.find('span', class_='cooking-time')
        if time_elem:
            cooking_time = time_elem.text.strip()
        
        return {
            "title": title,
            "ingredients": ingredients,
            "steps": steps,
            "cooking_time": cooking_time,
            "source_url": url,
            "source_site": "エキサイトレシピ"
        }


class RecipeParserFactory:
    """レシピ解析クラスのファクトリー"""
    
    @staticmethod
    def get_parser(url: str) -> RecipeParser:
        """
        URLに適したレシピ解析クラスを返す
        
        Args:
            url: レシピのURL
            
        Returns:
            適切なRecipeParserの実装
            
        Raises:
            HTTPException: サポートされていないURLの場合
        """
        domain = urlparse(url).netloc.lower()
        
        if 'cookpad.com' in domain:
            return CookpadParser()
        elif 'recipe.rakuten.co.jp' in domain:
            return RakutenRecipeParser()
        elif 'excite.co.jp' in domain or 'erecipe.excite.co.jp' in domain:
            return ExciteRecipeParser()
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="サポートされていないレシピサイトです。クックパッド、楽天レシピ、エキサイトレシピのURLを使用してください。"
            )
    
    @staticmethod
    def is_supported_url(url: str) -> bool:
        """
        URLがサポートされているレシピサイトかどうかを確認
        
        Args:
            url: チェックするURL
            
        Returns:
            サポート対象の場合True
        """
        try:
            domain = urlparse(url).netloc.lower()
            return any(site in domain for site in [
                'cookpad.com',
                'recipe.rakuten.co.jp',
                'excite.co.jp',
                'erecipe.excite.co.jp'
            ])
        except:
            return False


class RecipeUrlValidator:
    """レシピURLのバリデーター"""
    
    @staticmethod
    def validate(url: str) -> bool:
        """
        URLが有効なレシピURLかどうかをチェック
        
        Args:
            url: チェックするURL
            
        Returns:
            URLが有効な場合True
        """
        # URLのフォーマット検証
        url_pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        if not re.match(url_pattern, url):
            return False
        
        # サポート対象のサイトかチェック
        return RecipeParserFactory.is_supported_url(url)
