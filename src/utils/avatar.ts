/**
 * Get the full URL for an avatar image
 */
export const getAvatarUrl = (avatar?: string): string | null => {
  // Handle null, undefined, or empty string
  if (!avatar || avatar.trim() === '') return null;
  
  // If it's already a full URL (http/https), return as is
  if (avatar.startsWith('http')) {
    return avatar;
  }
  
  // If it starts with /uploads, construct the full URL
  // Static files are served from root, not /api, so we need to extract base URL
  if (avatar.startsWith('/uploads')) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    // Remove /api from the URL since static files are served from root
    const baseUrl = apiUrl.replace('/api', '');
    const fullUrl = `${baseUrl}${avatar}`;
    return fullUrl;
  }
  
  // If it doesn't match any pattern, return as is (might be a relative path)
  return avatar;
};

