import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { IStorageProvider } from './storage.interface';

@Injectable()
export class R2StorageProvider implements IStorageProvider {
  private readonly logger = new Logger(R2StorageProvider.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.getOrThrow<string>('storage.r2.accountId');
    const accessKeyId = this.configService.getOrThrow<string>('storage.r2.accessKeyId');
    const secretAccessKey = this.configService.getOrThrow<string>('storage.r2.secretAccessKey');
    this.bucketName = this.configService.getOrThrow<string>('storage.r2.bucketName');
    this.publicUrl = this.configService.getOrThrow<string>('storage.r2.publicUrl');

    const endpoint =
      this.configService.get<string>('storage.r2.endpoint') ??
      `https://${accountId}.r2.cloudflarestorage.com`;

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async upload(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; key: string; size: number; mimeType: string }> {
    const extension = path.extname(file.originalname).toLowerCase();
    const sanitizedOriginal = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase();
    const key = `${folder.replace(/\/$/, '')}/${uuidv4()}-${sanitizedOriginal}${extension}`;

    this.logger.log(`Uploading file to R2: ${key}`);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    });

    await this.s3Client.send(command);

    const url = this.getPublicUrl(key);
    this.logger.log(`Successfully uploaded file: ${key}`);

    return { url, key, size: file.size, mimeType: file.mimetype };
  }

  async delete(key: string): Promise<void> {
    this.logger.log(`Deleting file from R2: ${key}`);

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
    this.logger.log(`Successfully deleted file: ${key}`);
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
    return signedUrl;
  }

  getPublicUrl(key: string): string {
    const base = this.publicUrl.replace(/\/$/, '');
    return `${base}/${key}`;
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({ Bucket: this.bucketName, Key: key });
      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}
