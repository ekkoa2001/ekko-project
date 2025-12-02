-- Supabase 辅助函数
-- 在 Supabase SQL Editor 中执行

-- 函数：增加用户下载次数
CREATE OR REPLACE FUNCTION increment_download_count(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET download_count = download_count + 1 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 函数：检查用户是否购买了课程
CREATE OR REPLACE FUNCTION check_user_purchase(p_user_id UUID, p_course_id UUID)
RETURNS boolean AS $$
DECLARE
  purchase_exists boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM orders 
    WHERE user_id = p_user_id 
      AND course_id = p_course_id 
      AND status = 'paid'
  ) INTO purchase_exists;
  
  RETURN purchase_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 函数：获取用户的下载历史
CREATE OR REPLACE FUNCTION get_user_downloads(p_user_id UUID, p_limit INT DEFAULT 10)
RETURNS TABLE (
  course_title VARCHAR,
  download_time TIMESTAMP WITH TIME ZONE,
  ip_address INET
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.title,
    dl.created_at,
    dl.ip_address
  FROM download_logs dl
  JOIN courses c ON dl.course_id = c.id
  WHERE dl.user_id = p_user_id
  ORDER BY dl.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 函数：获取课程的下载统计
CREATE OR REPLACE FUNCTION get_course_download_stats(p_course_id UUID)
RETURNS TABLE (
  total_downloads BIGINT,
  unique_users BIGINT,
  last_download TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_downloads,
    COUNT(DISTINCT user_id)::BIGINT as unique_users,
    MAX(created_at) as last_download
  FROM download_logs
  WHERE course_id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 测试函数
DO $$
BEGIN
  RAISE NOTICE '✅ Supabase 辅助函数创建完成！';
  RAISE NOTICE '📝 已创建函数:';
  RAISE NOTICE '  - increment_download_count(user_id)';
  RAISE NOTICE '  - check_user_purchase(user_id, course_id)';
  RAISE NOTICE '  - get_user_downloads(user_id, limit)';
  RAISE NOTICE '  - get_course_download_stats(course_id)';
END $$;
