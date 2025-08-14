/**
 * Creates a data URL from base64 image data
 * @param {string} base64Data - The base64 encoded image data
 * @param {string} mimeType - The MIME type of the image
 * @returns {string|null} - Data URL or null if invalid data
 */
export function createImageSrc(base64Data, mimeType) {
    if (!base64Data || !mimeType) {
      return null;
    }
  
    // If it's already a complete data URL, return as is
    if (base64Data.startsWith('data:')) {
      return base64Data;
    }
  
    // Create data URL from base64 string and MIME type
    return `data:${mimeType};base64,${base64Data}`;
  }
  
  /**
   * Validates if the provided data can create a valid image source
   * @param {string} base64Data - The base64 encoded image data
   * @param {string} mimeType - The MIME type of the image
   * @returns {boolean} - True if valid, false otherwise
   */
  export function isValidImageData(base64Data, mimeType) {
    if (!base64Data || !mimeType) {
      return false;
    }
  
    // Check if it's a valid image MIME type
    const validMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];
  
    return validMimeTypes.includes(mimeType.toLowerCase());
  }
  
  /**
   * Extracts file extension from MIME type
   * @param {string} mimeType - The MIME type
   * @returns {string} - File extension
   */
  export function getFileExtensionFromMimeType(mimeType) {
    const mimeToExt = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif', 
      'image/webp': 'webp',
      'image/svg+xml': 'svg'
    };
  
    return mimeToExt[mimeType?.toLowerCase()] || 'jpg';
  }
  
  /**
   * Processes image data for display, with fallback handling
   * @param {Object} imageData - Image data object
   * @param {string} imageData.base64Data - Base64 image data
   * @param {string} imageData.mimeType - MIME type
   * @param {string} imageData.filename - Original filename
   * @returns {Object} - Processed image data with src
   */
  export function processImageForDisplay(imageData) {
    if (!imageData) {
      return null;
    }
  
    const { base64Data, mimeType, filename, alt, caption } = imageData;
  
    const src = createImageSrc(base64Data, mimeType);
    
    if (!src || !isValidImageData(base64Data, mimeType)) {
      return null;
    }
  
    return {
      src,
      alt: alt || caption || filename || 'Image',
      filename: filename || `image.${getFileExtensionFromMimeType(mimeType)}`,
      mimeType,
      isValid: true
    };
  }