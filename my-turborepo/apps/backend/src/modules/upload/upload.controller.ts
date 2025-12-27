import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('logo')
  @Roles('SUPERADMIN', 'DUENO', 'EMPLEADO')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp|svg\+xml)$/)) {
          return cb(new BadRequestException('Solo se permiten imágenes'), false);
        }
        cb(null, true);
      },
    })
  )
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    const complejoId = user.complejoId || user.id;
    const url = await this.uploadService.uploadLogo(file, complejoId);

    return { url };
  }

  @Post('favicon')
  @Roles('SUPERADMIN', 'DUENO', 'EMPLEADO')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1 * 1024 * 1024, // 1MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(x-icon|png)$/)) {
          return cb(new BadRequestException('Solo .ico o .png'), false);
        }
        cb(null, true);
      },
    })
  )
  async uploadFavicon(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    const complejoId = user.complejoId || user.id;
    const url = await this.uploadService.uploadFavicon(file, complejoId);

    return { url };
  }

  @Post('banner')
  @Roles('SUPERADMIN', 'DUENO', 'EMPLEADO')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
          return cb(new BadRequestException('Solo JPG, PNG o WebP'), false);
        }
        cb(null, true);
      },
    })
  )
  async uploadBanner(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    const complejoId = user.complejoId || user.id;
    const url = await this.uploadService.uploadBanner(file, complejoId);

    return { url };
  }
}