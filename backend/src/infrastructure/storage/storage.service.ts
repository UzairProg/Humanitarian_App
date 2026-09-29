import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { SECURITY_CONFIG } from '@al-husseiniya/config';

export interface UploadedFileDto {
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  buffer: Buffer;
  isPrivate?: boolean;
}

export interface StoredFileResult {
  fileId: string;
  url: string;
  key: string;
  isPrivate: boolean;
}

export abstract class StorageService {
  abstract uploadFile(file: UploadedFileDto): Promise<StoredFileResult>;
  abstract getFileStream(key: string): Promise<NodeJS.ReadableStream>;
  abstract deleteFile(key: string): Promise<boolean>;
  abstract getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

@Injectable()
export class LocalStorageService implements StorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly storageRoot: string;

  constructor(private configService: ConfigService) {
    this.storageRoot = this.configService.get<string>(
      'STORAGE_LOCAL_ROOT',
      './uploads',
    );
    if (!fs.existsSync(this.storageRoot)) {
      fs.mkdirSync(this.storageRoot, { recursive: true });
    }
  }

  async uploadFile(file: UploadedFileDto): Promise<StoredFileResult> {
    // 1. Validate file size
    if (file.sizeBytes > SECURITY_CONFIG.maxUploadSizeBytes) {
      throw new BadRequestException(
        `File size exceeds maximum allowed limit of ${SECURITY_CONFIG.maxUploadSizeBytes / (1024 * 1024)}MB`,
      );
    }

    // 2. Validate MIME type
    if (
      !SECURITY_CONFIG.allowedUploadMimeTypes.includes(
        file.mimeType as any,
      )
    ) {
      throw new BadRequestException(
        `Unsupported MIME type: ${file.mimeType}. Allowed: ${SECURITY_CONFIG.allowedUploadMimeTypes.join(', ')}`,
      );
    }

    // 3. Sanitize and generate safe key
    const ext = path.extname(file.originalName).toLowerCase();
    const safeKey = `${uuidv4()}${ext}`;
    const destinationPath = path.join(this.storageRoot, safeKey);

    await fs.promises.writeFile(destinationPath, file.buffer);
    this.logger.log(`File uploaded securely: ${safeKey}`);

    return {
      fileId: safeKey,
      key: safeKey,
      url: `/api/v1/files/${safeKey}`,
      isPrivate: file.isPrivate ?? true,
    };
  }

  async getFileStream(key: string): Promise<NodeJS.ReadableStream> {
    const filePath = path.join(this.storageRoot, path.basename(key));
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }
    return fs.createReadStream(filePath);
  }

  async deleteFile(key: string): Promise<boolean> {
    const filePath = path.join(this.storageRoot, path.basename(key));
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    // For local driver, signed URL returns time-limited URL with token or proxy route
    return `/api/v1/files/signed/${encodeURIComponent(key)}?expires=${Date.now() + expiresInSeconds * 1000}`;
  }
}
