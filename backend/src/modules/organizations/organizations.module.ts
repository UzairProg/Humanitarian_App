import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { Organization, OrganizationSchema } from '../../database/schemas/organization.schema';
import { OrganizationMember, OrganizationMemberSchema } from '../../database/schemas/organization-member.schema';
import { OrganizationVerification, OrganizationVerificationSchema } from '../../database/schemas/organization-verification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: OrganizationMember.name, schema: OrganizationMemberSchema },
      { name: OrganizationVerification.name, schema: OrganizationVerificationSchema },
    ]),
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
