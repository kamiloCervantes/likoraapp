import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_KYC_KEY } from '../decorators/require-kyc.decorator';
import { KycStatus } from '../enums/kyc-status.enum';
import { UserStatus } from '../enums/user-status.enum';

@Injectable()
export class KycGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredStatus = this.reflector.getAllAndOverride<KycStatus>(
      REQUIRE_KYC_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no se requiere KYC en esta ruta, permitir acceso
    if (!requiredStatus) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Bloqueo inmediato para usuarios menores de edad detectados
    if (user.status === UserStatus.BLOCKED_UNDERAGE) {
      throw new ForbiddenException({
        statusCode: 403,
        errorCode: 'USER_UNDERAGE_BLOCKED',
        message:
          'Acceso denegado: El usuario ha sido bloqueado por no cumplir con la mayoría de edad legal para la compra de alcohol.',
      });
    }

    // Verificación estricta del estado de KYC para compras / checkout
    if (user.kyc_status !== requiredStatus) {
      throw new ForbiddenException({
        statusCode: 403,
        errorCode: 'KYC_VERIFICATION_REQUIRED',
        message:
          'Cumplimiento legal: La compra y checkout de bebidas alcohólicas requiere validación oficial de identidad y mayoría de edad.',
        currentKycStatus: user.kyc_status,
        requiredKycStatus: requiredStatus,
      });
    }

    return true;
  }
}
