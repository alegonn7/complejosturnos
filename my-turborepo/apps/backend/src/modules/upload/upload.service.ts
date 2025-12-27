import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadsDir: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadsDir =
      this.configService.get('UPLOADS_DIR') ||
      path.join(process.cwd(), 'uploads');

    this.baseUrl =
      this.configService.get('CDN_URL') ||
      'http://localhost:4000/uploads';
  }

  // ---------- helpers ----------
  private async ensureDir(dir: string) {
    if (!fsSync.existsSync(dir)) {
      fsSync.mkdirSync(dir, { recursive: true });
    }
  }

  // ---------- uploads ----------
  async uploadLogo(
    file: Express.Multer.File,
    complejoId: string,
  ): Promise<string> {
    const filename = `${complejoId}_${Date.now()}.webp`;
    const dir = path.join(this.uploadsDir, 'logos');
    const filepath = path.join(dir, filename);

    await this.ensureDir(dir);

    await sharp(file.buffer)
      .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filepath);

    return `${this.baseUrl}/logos/${filename}`;
  }

  async uploadBanner(
    file: Express.Multer.File,
    complejoId: string,
  ): Promise<string> {
    const filename = `${complejoId}_${Date.now()}.webp`;
    const dir = path.join(this.uploadsDir, 'banners');
    const filepath = path.join(dir, filename);

    await this.ensureDir(dir);

    await sharp(file.buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(filepath);

    return `${this.baseUrl}/banners/${filename}`;
  }

  async uploadFavicon(
    file: Express.Multer.File,
    complejoId: string,
  ): Promise<string> {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${complejoId}_${Date.now()}${ext}`;
    const dir = path.join(this.uploadsDir, 'favicons');
    const filepath = path.join(dir, filename);

    await this.ensureDir(dir);

    if (ext === '.png') {
      await sharp(file.buffer)
        .resize(32, 32, { fit: 'cover' })
        .png({ quality: 80 })
        .toFile(filepath);
    } else {
      await fs.writeFile(filepath, file.buffer);
    }

    return `${this.baseUrl}/favicons/${filename}`;
  }

  // ---------- delete ----------
  async deleteFile(url: string): Promise<void> {
    try {
      const filename = url.split('/').pop();
      if (!filename) return;

      let folder = 'banners';
      if (url.includes('/logos/')) folder = 'logos';
      if (url.includes('/favicons/')) folder = 'favicons';

      const filepath = path.join(this.uploadsDir, folder, filename);
      await fs.unlink(filepath);
    } catch {
      // silencioso: archivo inexistente
    }
  }
}
