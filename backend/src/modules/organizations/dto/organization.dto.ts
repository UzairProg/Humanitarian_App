import {
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { VerificationStatus } from '@al-husseiniya/types';

export class CreateOrganizationDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsString()
  location: string;

  @IsEmail()
  contactEmail: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  // Verification status cannot be provided in creation DTO!
}

export class VerifyOrganizationDto {
  @IsEnum(VerificationStatus)
  status: VerificationStatus;

  @IsOptional()
  @IsString()
  decision?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddMemberDto {
  @IsString()
  userId: string;

  @IsString()
  role: 'ADMIN' | 'STAFF';
}
