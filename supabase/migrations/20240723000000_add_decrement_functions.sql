
-- Function to decrement available_images by 1
CREATE OR REPLACE FUNCTION public.decrement_available_images(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.image_consumption
  SET available_images = GREATEST(0, available_images - 1),
      updated_at = now()
  WHERE user_id = decrement_available_images.user_id;
END;
$$;

-- Function to increment used_images by 1
CREATE OR REPLACE FUNCTION public.increment_used_images(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.image_consumption
  SET used_images = used_images + 1,
      updated_at = now()
  WHERE user_id = increment_used_images.user_id;
END;
$$;

-- Make sure access is restricted to authenticated users only
GRANT EXECUTE ON FUNCTION public.decrement_available_images(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_used_images(uuid) TO authenticated;
