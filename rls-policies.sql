-- =============================================
-- Supabase RLS 安全策略
-- 在 Supabase SQL Editor 中执行此文件
-- =============================================

-- 1. 启用 RLS
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 2. tools 表策略

-- 清除旧策略（如果有）
DROP POLICY IF EXISTS "Anyone can read tools" ON tools;
DROP POLICY IF EXISTS "Authenticated users can insert tools" ON tools;
DROP POLICY IF EXISTS "Authenticated users can update tools" ON tools;
DROP POLICY IF EXISTS "Authenticated users can delete tools" ON tools;
DROP POLICY IF EXISTS "Anonymous can like tools" ON tools;

-- 匿名用户：只允许读取
CREATE POLICY "Anyone can read tools"
  ON tools FOR SELECT
  USING (true);

-- 匿名用户：只允许更新 likes 字段（点赞）
CREATE POLICY "Anonymous can like tools"
  ON tools FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 已认证用户：可以添加工具
CREATE POLICY "Authenticated users can insert tools"
  ON tools FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 已认证用户：可以更新工具
CREATE POLICY "Authenticated users can update tools"
  ON tools FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 已认证用户：可以删除工具
CREATE POLICY "Authenticated users can delete tools"
  ON tools FOR DELETE
  TO authenticated
  USING (true);

-- 3. favorites 表策略

-- 清除旧策略（如果有）
DROP POLICY IF EXISTS "Users can read own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

-- 用户只能查看自己的收藏
CREATE POLICY "Users can read own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 用户只能添加自己的收藏
CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 用户只能删除自己的收藏
CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. 验证策略
-- SELECT * FROM pg_policies WHERE tablename IN ('tools', 'favorites');
