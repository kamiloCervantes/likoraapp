import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequireKyc } from '../common/decorators/require-kyc.decorator';
import { KycGuard } from '../common/guards/kyc.guard';
import { KycStatus } from '../common/enums/kyc-status.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Endpoint protegido de ejemplo: Solo accesible si el usuario tiene KYC VERIFIED.
   */
  @Get(':id/checkout-eligibility')
  @RequireKyc(KycStatus.VERIFIED)
  @UseGuards(KycGuard)
  checkEligibility(@Param('id') id: string) {
    return {
      status: 'eligible',
      message: 'Usuario verificado legalmente para comprar bebidas alcohólicas.',
    };
  }
}
