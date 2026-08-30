import { IsUUID, IsInt, Min } from 'class-validator';

export class AddCartItemDto {
  @IsUUID('4', { message: 'El ID de producto debe ser un UUID válido' })
  productId: string;

  @IsInt()
  @Min(1, { message: 'La cantidad mínima es 1' })
  quantity: number;
}
