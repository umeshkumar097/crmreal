export interface IStorageProvider {
  /**
   * Upload a file to storage
   * @param file - Multer file object
   * @param folder - Target folder/prefix in the bucket
   * @returns Object with public URL and storage key
   */
  upload(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; key: string; size: number; mimeType: string }>;

  /**
   * Delete a file from storage by its key
   * @param key - Storage key of the file
   */
  delete(key: string): Promise<void>;

  /**
   * Generate a pre-signed URL for temporary access
   * @param key - Storage key of the file
   * @param expiresIn - Expiry in seconds (default: 3600)
   */
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;

  /**
   * Get the public URL of a file (for publicly accessible buckets)
   * @param key - Storage key of the file
   */
  getPublicUrl(key: string): string;
}

export const STORAGE_PROVIDER_TOKEN = 'STORAGE_PROVIDER_TOKEN';
