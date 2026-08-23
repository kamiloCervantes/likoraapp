import {
  Controller,
  Get,
  Put,
  Query,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StorageService } from './storage.service';
import * as fs from 'fs';

@Controller('storage')
export class StorageController {
  private readonly logger = new Logger(StorageController.name);

  constructor(private readonly storageService: StorageService) {}

  @Put('upload')
  @HttpCode(HttpStatus.OK)
  async uploadFile(
    @Query('key') key: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!key) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Clave de archivo requerida' });
    }

    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      this.storageService.saveLocalFile(key, buffer);
      return res.status(HttpStatus.OK).json({ success: true, key, size: buffer.length });
    });
    req.on('error', (err) => {
      this.logger.error(`Error en subida de archivo local: ${err}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error al subir archivo' });
    });
  }

  @Get('view')
  async viewFile(
    @Query('key') key: string,
    @Res() res: Response,
  ) {
    if (!key) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Clave de archivo requerida' });
    }

    const filePath = this.storageService.getLocalFilePath(key);
    if (filePath) {
      res.setHeader('Content-Type', 'image/jpeg');
      return fs.createReadStream(filePath).pipe(res);
    }

    // Fallback visual SVG en modo desarrollo si la foto previa no existe
    const svgBadge = `
      <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0f172a" />
        <rect x="20" y="20" width="560" height="360" rx="16" fill="#1e293b" stroke="#7f17e6" stroke-width="2" stroke-dasharray="6,6" />
        <circle cx="300" cy="160" r="50" fill="#7f17e6" opacity="0.2" />
        <text x="300" y="170" font-size="40" text-anchor="middle" fill="#a855f7">📷</text>
        <text x="300" y="240" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#ffffff">Documento en Modo Desarrollo</text>
        <text x="300" y="270" font-family="sans-serif" font-size="13" text-anchor="middle" fill="#94a3b8">${key}</text>
        <text x="300" y="310" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#10b981">✓ Verificación Legal +18 Habilitada</text>
      </svg>
    `;
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(svgBadge);
  }
}
