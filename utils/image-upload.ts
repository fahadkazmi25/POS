import { storage } from "@/firebase/config"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

/**
 * Uploads an image to Firebase Storage with fallback options
 * @param file The file to upload
 * @param path The storage path (e.g., 'products')
 * @param fallbackUrl The fallback URL to use if upload fails
 * @returns The URL of the uploaded image or fallback URL
 */
export async function uploadImage(
  file: File | null,
  path = "images",
  fallbackUrl = "/placeholder.svg",
): Promise<string> {
  if (!file) return fallbackUrl

  try {
    // Sanitize filename to avoid storage path issues
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, "_")
    const storageRef = ref(storage, `${path}/${Date.now()}_${sanitizedName}`)

    // Upload the file
    await uploadBytes(storageRef, file)

    // Get the download URL
    const downloadUrl = await getDownloadURL(storageRef)
    return downloadUrl
  } catch (error) {
    console.error("Error uploading image:", error)

    // If we have a data URL from FileReader, use that as fallback
    if (fallbackUrl && fallbackUrl.startsWith("data:")) {
      return fallbackUrl
    }

    return fallbackUrl
  }
}
