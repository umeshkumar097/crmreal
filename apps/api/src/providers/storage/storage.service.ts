import {
  Injectable,
  Inject,
  BadRequestException,
  Logger,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IStorageProvider } from './storage.interface';
import { STORAGE_PROVIDER_TOKEN } from './storage.interface';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly maxFileSizeBytes: number;
  private readonly allowedMimeTypes: string[];

  constructor(
    @Inject(STORAGE_PROVIDER_TOKEN)
    private readonly storageProvider: IStorageProvider,
    private readonly configService: ConfigService,
  ) {
    const maxMb = this.configService.get<number>('app.maxFileSizeMb', 10);
    this.maxFileSizeBytes = maxMb * 1024 * 1024;
    this.allowedMimeTypes = this.configService.get<string[]>('app.allowedFileTypes', [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ]);
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; key: string; size: number; mimeType: string }> {
    this.validateFile(file);

    this.logger.log(
      `Uploading file: ${file.originalname} (${file.mimetype}, ${file.size} bytes) to folder: ${folder}`,
    );

    const result = await this.storageProvider.upload(file, folder);
    this.logger.log(`File uploaded successfully: ${result.key}`);
    return result;
  }

  async deleteFile(key: string): Promise<void> {
    this.logger.log(`Deleting file: ${key}`);
    await this.storageProvider.delete(key);
    this.logger.log(`File deleted: ${key}`);
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    return this.storageProvider.getSignedUrl(key, expiresIn);
  }

  getPublicUrl(key: string): string {
    return this.storageProvider.getPublicUrl(key);
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<Array<{ url: string; key: string; size: number; mimeType: string }>> {
    const uploads = await Promise.all(files.map((file) => this.uploadFile(file, folder)));
    return uploads;
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSizeBytes) {
      throw new PayloadTooLargeException(
        `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${this.maxFileSizeBytes / 1024 / 1024}MB`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type '${file.mimetype}' is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }
}
