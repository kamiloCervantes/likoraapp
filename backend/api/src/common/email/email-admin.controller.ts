import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailConfig } from './entities/email-config.entity';

@Controller('admin/email')
export class EmailAdminController {
  constructor(private readonly emailService: EmailService) {}

  @Get('config')
  async getConfig() {
    return this.emailService.getConfig();
  }

  @Put('config')
  async updateConfig(@Body() dto: Partial<EmailConfig>) {
    return this.emailService.updateConfig(dto);
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async testEmail(
    @Body('to_email') toEmail: string,
    @Body('config') customConfig?: Partial<EmailConfig>,
  ) {
    const targetEmail = toEmail || 'soporte@gatewayit.co';
    return this.emailService.testConnection(targetEmail, customConfig);
  }
}
