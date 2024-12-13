import { ForbiddenException, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UpdateBasiceInfo } from './dto/update-basic-info.dto';
import { UpdateLocation } from './dto/update-location.dto';
import { UploadImages } from './dto/upload-images.dto';
import { Organization } from '../organizations/entities/organization.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateMultiScheduleDto } from '../org-schedule/dto/update-many.dto';
import { OrgSchedule } from '../org-schedule/entities/org-schedule.entity';
import { FilesService } from '../files/files.service';

@Injectable()
export class PublicationService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    private readonly dataSource: DataSource,
    private fileService: FilesService,
  ) {}

  async updateBasicInfo(orgId: number, updateBasiceInfo: UpdateBasiceInfo) {
    const { name, phones, notes } = updateBasiceInfo;
    const updateRes = await this.orgRepository.update(orgId, {
      name,
      phones,
      notes,
    });
    if (updateRes.affected == 1)
      return {
        message: 'Update your business info successfully.',
      };
    throw new ForbiddenException('Updating basic info failed!');
  }

  async updateTypes(orgId: number, types: string[]) {
    const updateRes = await this.orgRepository.update(orgId, {
      types,
    });

    if (updateRes.affected == 1)
      return {
        message: 'Set service type successfully.',
      };
    throw new ForbiddenException('Updating types failed!');
  }

  async updateLocation(orgId: number, updateLocation: UpdateLocation) {
    const { address, latitude, longitude } = updateLocation;
    await this.orgRepository.update(orgId, {
      address,
      latitude,
      longitude,
    });
  }

  async uploadImages(orgId: number, uploadImages: UploadImages) {
    try {
      const { images } = uploadImages;
      const organization = await this.orgRepository.findOneBy({ id: orgId });
      const updateRes = await this.orgRepository.update(orgId, {
        images,
      });

      if (updateRes.affected === 1) {
        this.fileService.updateFileAsUnused(organization.images, orgId);
        this.fileService.updateFileAsUnused(images, orgId);
        return {
          message: 'Upload images successfullt',
        };
      }
    } catch (error) {
      console.log(error);
      throw new ForbiddenException('Error uploading images');
    }
  }

  async updateManySchedule(
    orgId: number,
    updateMultiScheduleDto: UpdateMultiScheduleDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const { schedules } = updateMultiScheduleDto;
      const orgScheduleRepository = this.dataSource.getRepository(OrgSchedule);
      await orgScheduleRepository.delete({ organization: { id: orgId } });
      const createSchedule = orgScheduleRepository.create(
        schedules.map(({ startTime, endTime, dayOfWeek }) => ({
          startTime,
          endTime,
          dayOfWeek,
          organization: { id: orgId },
        })),
      );

      await orgScheduleRepository.save(createSchedule);
      await queryRunner.commitTransaction();
      return {
        message: 'Update schedule successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async publishOrganization(orgId: number) {
    const { address, latitude, images, name, types } = await this.orgRepository
      .createQueryBuilder('organization')
      .where('organization.id=:orgId', { orgId })
      .addSelect('organization.isPublished')
      .addSelect('organization.notes')
      .addSelect('organization.address')
      .getOne();
    if (!address || !latitude || !images || !name || !types) {
      throw new ForbiddenException('Please complete setup first');
    }
    const updateRes = await this.orgRepository.update(orgId, {
      isPublished: true,
    });
    if (updateRes.affected == 1)
      return {
        message: 'Publish your business successfully.',
      };

    throw new ForbiddenException('There is problem publishing your business!');
  }
}
