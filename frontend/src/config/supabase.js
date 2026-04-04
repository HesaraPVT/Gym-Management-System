import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sqfedwwiuycymeyqvtdh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZmVkd3dpdXljeW1leXF2dGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyOTQ0NzcsImV4cCI6MjA5MDg3MDQ3N30.4Dc_9saptkP9eCxgqxk6GiF84GSHi6PMJy7KvyXH4IA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Upload product image to Supabase Storage
 * @param {File} file - Image file to upload
 * @param {string} productName - Product name for file naming
 * @returns {Promise<{url: string, error: null} | {url: null, error: string}>}
 */
export const uploadProductImage = async (file, productName) => {
  try {
    if (!file) {
      return { url: null, error: 'No file provided' };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${productName}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
    const filePath = `product-images/${fileName}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('gym-products')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { url: null, error: uploadError.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('gym-products')
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (error) {
    console.error('Image upload error:', error);
    return { url: null, error: error.message };
  }
};

/**
 * Delete product image from Supabase Storage
 * @param {string} imageUrl - Public URL of the image
 * @returns {Promise<{success: boolean, error: null} | {success: false, error: string}>}
 */
export const deleteProductImage = async (imageUrl) => {
  try {
    if (!imageUrl) {
      return { success: false, error: 'No URL provided' };
    }

    // Extract file path from URL
    const urlParts = imageUrl.split('/storage/v1/object/public/gym-products/');
    if (urlParts.length !== 2) {
      return { success: false, error: 'Invalid image URL' };
    }

    const filePath = urlParts[1];

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from('gym-products')
      .remove([filePath]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return { success: false, error: deleteError.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Image delete error:', error);
    return { success: false, error: error.message };
  }
};
