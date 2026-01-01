import { supabase } from '@/lib/supabase';
import { ImageGenerationInput } from './types';

export const generateImage = async (payload: ImageGenerationInput) => {
  const { data, error } = await supabase.functions.invoke('generate-image', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (error) {
    throw error;
  }

  return data;
};
