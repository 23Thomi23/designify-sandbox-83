
-- Function to decrement available_images by 1
CREATE OR REPLACE FUNCTION public.decrement_available_images()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN GREATEST(0, available_images - 1);
END;
$$;

-- Function to increment used_images by 1
CREATE OR REPLACE FUNCTION public.increment_used_images()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN used_images + 1;
END;
$$;

-- Make sure access is restricted to authenticated users only
GRANT EXECUTE ON FUNCTION public.decrement_available_images() TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_used_images() TO authenticated;
