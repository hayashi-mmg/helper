## 3. データモデル設計

### 3.1 エンティティ関連図

```
User (ユーザー) 1 --- * Helper (ヘルパー)
      |
      | 1
      ↓
      * 
Recipe Request (料理リクエスト) --- * Tag (タグ)
      |
      | 1
      ↓
      *
Feedback (フィードバック)
```

### 3.2 データベースモデル

#### 3.2.1 User (ユーザー)

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    address = Column(String)
    phone = Column(String)
    role = Column(String, default="user")  # user, helper, admin
    is_active = Column(Boolean, default=True)
    preferences = Column(JSONB, nullable=True)  # 好みや制限（アレルギー等）
    language = Column(String, default="ja")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
```

#### 3.2.2 Helper (ヘルパー)

```python
class Helper(Base):
    __tablename__ = "helpers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    certification = Column(String, nullable=True)  # 資格情報
    specialties = Column(ARRAY(String), nullable=True)  # 得意な料理等
    introduction = Column(Text, nullable=True)
    working_days = Column(JSONB, nullable=True)  # 稼働曜日・時間帯
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # リレーションシップ
    user = relationship("User", back_populates="helper")
    assigned_users = relationship("UserHelperAssignment", back_populates="helper")
```

#### 3.2.3 UserHelperAssignment (ユーザー・ヘルパー割り当て)

```python
class UserHelperAssignment(Base):
    __tablename__ = "user_helper_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    helper_id = Column(Integer, ForeignKey("helpers.id"), nullable=False)
    is_primary = Column(Boolean, default=False)  # 主担当フラグ
    created_at = Column(DateTime, default=func.now())
    
    # リレーションシップ
    user = relationship("User", back_populates="assigned_helpers")
    helper = relationship("Helper", back_populates="assigned_users")
```

#### 3.2.4 RecipeRequest (料理リクエスト)

```python
class RecipeRequest(Base):
    __tablename__ = "recipe_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    recipe_url = Column(String, nullable=True)  # クックパッド等のURL
    recipe_content = Column(JSONB, nullable=True)  # 解析されたレシピ情報
    notes = Column(Text, nullable=True)  # 特記事項（アレルギー対応等）
    priority = Column(Integer, default=0)  # 優先度
    scheduled_date = Column(Date, nullable=True)  # 予定日
    status = Column(String, default="requested")  # requested, in_progress, completed, cancelled
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # リレーションシップ
    user = relationship("User", back_populates="recipe_requests")
    tags = relationship("RecipeTag", secondary=recipe_tags, back_populates="recipes")
    feedback = relationship("Feedback", back_populates="recipe_request", uselist=False)
```

#### 3.2.5 Task (お願いごと)

```python
class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=True)  # 掃除、買い物等
    priority = Column(Integer, default=0)
    scheduled_date = Column(Date, nullable=True)
    status = Column(String, default="requested")  # requested, in_progress, completed, cancelled
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # リレーションシップ
    user = relationship("User", back_populates="tasks")
```

#### 3.2.6 Tag (タグ)

```python
class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    category = Column(String, nullable=True)  # 料理カテゴリ等
    created_at = Column(DateTime, default=func.now())
    
    # リレーションシップ
    recipes = relationship("RecipeRequest", secondary=recipe_tags, back_populates="tags")
```

#### 3.2.7 Feedback (フィードバック)

```python
class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    recipe_request_id = Column(Integer, ForeignKey("recipe_requests.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    taste_rating = Column(Integer, nullable=True)  # 味付け評価(1-5)
    texture_rating = Column(Integer, nullable=True)  # 食感評価(1-5)
    amount_rating = Column(Integer, nullable=True)  # 量の評価(1-5)
    comment = Column(Text, nullable=True)
    next_request = Column(Text, nullable=True)  # 次回への要望
    image_url = Column(String, nullable=True)  # 料理写真URL
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # リレーションシップ
    recipe_request = relationship("RecipeRequest", back_populates="feedback")
    user = relationship("User")
    helper_response = relationship("HelperResponse", back_populates="feedback", uselist=False)
```

#### 3.2.8 HelperResponse (ヘルパー返信)

```python
class HelperResponse(Base):
    __tablename__ = "helper_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(Integer, ForeignKey("feedback.id"), nullable=False)
    helper_id = Column(Integer, ForeignKey("helpers.id"), nullable=False)
    response = Column(Text, nullable=False)
    next_note = Column(Text, nullable=True)  # 次回調理時のメモ
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # リレーションシップ
    feedback = relationship("Feedback", back_populates="helper_response")
    helper = relationship("Helper")
```

#### 3.2.9 QRCode (QRコード)

```python
class QRCode(Base):
    __tablename__ = "qrcodes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_type = Column(String, nullable=False)  # RECIPE, FEEDBACK_FORM等
    target_id = Column(Integer, nullable=True)
    url = Column(String, nullable=False)
    title = Column(String, nullable=False)
    image_path = Column(String, nullable=True)
    expire_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    access_count = Column(Integer, default=0)
    
    # リレーションシップ
    user = relationship("User")
```

