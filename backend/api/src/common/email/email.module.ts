import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailConfig } from './entities/email-config.entity';
import { EmailService } from './email.service';
import { EmailAdminController } from './email-admin.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([EmailConfig])],
  controllers: [EmailAdminController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
