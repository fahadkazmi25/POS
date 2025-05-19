/**
 * Utility functions for handling images without Firebase Storage
 */

/**
 * Converts an image file to a base64 string
 * @param file The image file to convert
 * @returns Promise resolving to the base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }
  
  /**
   * Compresses an image to reduce its size
   * @param base64 The base64 string of the image
   * @param maxWidth Maximum width of the compressed image
   * @param quality Compression quality (0-1)
   * @returns Promise resolving to the compressed base64 string
   */
  export const compressImage = (base64: string, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = base64
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height
  
        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
  
        canvas.width = width
        canvas.height = height
  
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }
  
        ctx.drawImage(img, 0, 0, width, height)
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality)
        resolve(compressedBase64)
      }
      img.onerror = () => reject(new Error("Failed to load image"))
    })
  }
  
  /**
   * Validates if a base64 string is within size limits
   * @param base64 The base64 string to validate
   * @param maxSizeInMB Maximum size in MB
   * @returns Boolean indicating if the image is within size limits
   */
  export const validateImageSize = (base64: string, maxSizeInMB = 0.5): boolean => {
    // Base64 string length in bytes is approximately 3/4 of the string length
    const sizeInBytes = Math.round((base64.length * 3) / 4)
    const sizeInMB = sizeInBytes / (1024 * 1024)
    return sizeInMB <= maxSizeInMB
  }
  
  /**
   * Processes an image file for storage in Firestore
   * - Converts to base64
   * - Compresses the image
   * - Validates the size
   * @param file The image file to process
   * @returns Promise resolving to the processed base64 string or null if invalid
   */
  export const processImageForFirestore = async (file: File): Promise<string | null> => {
    try {
      // Convert file to base64
      const base64 = await fileToBase64(file)
  
      // Compress the image
      const compressedBase64 = await compressImage(base64)
  
      // Validate the size
      if (!validateImageSize(compressedBase64)) {
        console.error("Image too large after compression")
        return null
      }
  
      return compressedBase64
    } catch (error) {
      console.error("Error processing image:", error)
      return null
    }
  }
  