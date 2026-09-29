import {
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { RequestPriority, RequestStatus } from '@al-husseiniya/types';

export class CreateRequestDto {
  @IsUUID()
  categoryId: string;

  @IsString()
  @MinLength(5)
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}

export class UpdateRequestStatusDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
