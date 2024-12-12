import { BadRequestException, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { storeObjectAWS, storeObjectsAWS } from '@/utils/store-obj-s3';
import { deleteObjectAWS } from '@/utils/delete-obj-s3';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectQueue('FileQueue')
    private fileQueue: Queue,
  ) {}

  //store image
  async storeImage(file: Express.Multer.File, userId: any) {
    try {
      const imageId = await storeObjectAWS(file);
      const imageUrls = this.generateImageUrls([imageId]);
      await this.saveImageUrlsToDatabase(imageUrls, userId);
      return { imageUrl: imageUrls[0] };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  // store multiple images
  async storeMultipleImages(images: Express.Multer.File[], userId) {
    const imageIds = await storeObjectsAWS(images);
    const imageUrls = this.generateImageUrls(imageIds);
    await this.saveImageUrlsToDatabase(imageUrls, userId);
    return { imageUrls };
  }

  private generateImageUrls(imageIds: string[]): string[] {
    // Generate CloudFront URLs based on image IDs
    return imageIds.map(
      (imageId) => `${process.env.ClOUDFRONT_BASEURL}/${imageId}`,
    );
  }

  private async saveImageUrlsToDatabase(
    imageUrls: string[],
    userId,
  ): Promise<void> {
    // Create an array of URL objects
    const urls = imageUrls.map((imageUrl) => {
      return { url: imageUrl, userId };
    });
    await this.fileRepository.insert(urls);
  }

  // update file as used
  updateFileAsUsed(fileUrls: string[] | string, userId: string | number) {
    try {
      const urlsArray = Array.isArray(fileUrls) ? fileUrls : [fileUrls];
      this.fileQueue.add('updateFileUsed', { urls: urlsArray, userId });
    } catch (error) {
      console.log('Error updating file as used');
    }
  }

  // update file as unused
  updateFileAsUnused(fileUrls: string[] | string, userId: string | number) {
    try {
      const urlsArray = Array.isArray(fileUrls) ? fileUrls : [fileUrls];
      this.fileQueue.add('updateFileUnused', { urls: urlsArray, userId });
    } catch (error) {
      console.log('Error updating file as unused');
    }
  }

  // get files for test
  getFiles() {
    return this.fileRepository.find();
  }

  async deleteUnusedFiles() {
    const files = await this.fileRepository.findBy({ isUsed: false });
    Promise.all(
      files.map(async (file) => {
        const url = new URL(file.url);
        const objectId = url.pathname.substring(1);
        await deleteObjectAWS(objectId);
      }),
    );
    await this.fileRepository.delete({ isUsed: false });
  }
}
