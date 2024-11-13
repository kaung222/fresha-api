import { Controller, Patch } from '@nestjs/common';
import { PublicationService } from './publication.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateBasiceInfo, UpdateTypes } from './dto/update-basic-info.dto';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';
import { UploadImages } from './dto/upload-images.dto';
import { UpdateLocation } from './dto/update-location.dto';
import { UpdateMultiScheduleDto } from '../org-schedule/dto/update-many.dto';

@Controller('publication')
@Role(Roles.org)
@ApiTags(' Publish organization to user for online booking')
export class PublicationController {
  constructor(private readonly publicationService: PublicationService) {}

  @Patch(':orgId/basic-info')
  @ApiOperation({ summary: 'Update basic info' })
  updateBasiceInfo(
    @User('orgId') orgId: number,
    updateBasiceInfo: UpdateBasiceInfo,
  ) {
    return this.publicationService.updateBasicInfo(orgId, updateBasiceInfo);
  }

  @Patch(':orgId/types')
  @ApiOperation({ summary: 'Update types' })
  updateTypes(@User('orgId') orgId: number, { types }: UpdateTypes) {
    return this.publicationService.updateTypes(orgId, types);
  }

  @Patch(':orgId/location')
  @ApiOperation({ summary: 'Update location' })
  updateLocation(@User('orgId') orgId: number, updateLocation: UpdateLocation) {
    return this.publicationService.updateLocation(orgId, updateLocation);
  }

  @Patch(':orgId/opening-hours')
  updateOpeningHours(
    @User('orgId') orgId: number,
    updateOrgScheduleDto: UpdateMultiScheduleDto,
  ) {
    return this.publicationService.updateManySchedule(
      orgId,
      updateOrgScheduleDto,
    );
  }

  @Patch(':orgId/images')
  @ApiOperation({ summary: 'Upload showcase images' })
  updateImages(@User('orgId') orgId: number, uploadImages: UploadImages) {
    return this.publicationService.uploadImages(orgId, uploadImages);
  }

  @Patch(':orgId/publish')
  publishOrg(@User('orgId') orgId: number) {
    return this.publicationService.publishOrganization(orgId);
  }
}
