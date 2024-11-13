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

@Injectable()
export class PublicationService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
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
        message: 'success',
      };
    throw new ForbiddenException('Cannot update');
  }

  async updateTypes(orgId: number, types: string[]) {
    const updateRes = await this.orgRepository.update(orgId, {
      types,
    });

    if (updateRes.affected == 1)
      return {
        message: 'success',
      };
    throw new ForbiddenException('Cannot update');
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
    const { images } = uploadImages;
    const organization = await this.orgRepository.findOneBy({ id: orgId });
    const updateRes = await this.orgRepository.update(orgId, {
      images,
    });

    if (updateRes.affected === 1) {
      this.eventEmitter.emit('files.used', { ids: images });
      organization.images &&
        this.eventEmitter.emit('files.unused', { ids: organization.images });
      return {
        message: 'success',
      };
    }

    throw new ForbiddenException('Cannot update');
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
        message: 'success',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async publishOrganization(orgId: number) {
    const { address, latitude, images, name, types } =
      await this.orgRepository.findOneBy({ id: orgId });
    if (!address || !latitude || !images || !name || !types) {
      throw new ForbiddenException('Please complete setup first');
    }
    const updateRes = await this.orgRepository.update(orgId, {
      isPublished: true,
    });
    if (updateRes.affected == 1)
      return {
        message: 'success',
      };

    throw new ForbiddenException('Cannot publish');
  }
}
