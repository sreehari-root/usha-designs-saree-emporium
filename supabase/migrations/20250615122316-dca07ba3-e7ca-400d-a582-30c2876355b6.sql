
-- Update the get_user_emails function to handle null parameter (get all users)
CREATE OR REPLACE FUNCTION public.get_user_emails(user_ids uuid[])
 RETURNS TABLE(id uuid, email text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- If user_ids is null or empty, return all users
  IF user_ids IS NULL OR array_length(user_ids, 1) IS NULL THEN
    RETURN QUERY
    SELECT au.id, au.email
    FROM auth.users au
    WHERE au.email IS NOT NULL;
  ELSE
    RETURN QUERY
    SELECT au.id, au.email
    FROM auth.users au
    WHERE au.id = ANY(user_ids);
  END IF;
END;
$function$
