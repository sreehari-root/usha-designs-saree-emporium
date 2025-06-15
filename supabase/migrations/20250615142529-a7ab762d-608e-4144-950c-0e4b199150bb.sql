
-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_user_emails(uuid[]);

-- Create the updated function with correct return types
CREATE OR REPLACE FUNCTION public.get_user_emails(user_ids uuid[] DEFAULT '{}')
RETURNS TABLE(id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If user_ids array is empty, return all users
  IF array_length(user_ids, 1) IS NULL OR array_length(user_ids, 1) = 0 THEN
    RETURN QUERY
    SELECT au.id, au.email::text
    FROM auth.users au
    WHERE au.email IS NOT NULL;
  ELSE
    -- Return specific users
    RETURN QUERY
    SELECT au.id, au.email::text
    FROM auth.users au
    WHERE au.id = ANY(user_ids)
      AND au.email IS NOT NULL;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_emails(uuid[]) TO authenticated;
