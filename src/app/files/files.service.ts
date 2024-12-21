import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { storeObjectAWS, storeObjectsAWS } from '@/utils/store-obj-s3';
import { deleteObjectAWS } from '@/utils/delete-obj-s3';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  //store image
  async storeImage(file: Express.Multer.File, userId: string | number) {
    try {
      const imageUrl = await storeObjectAWS(file, userId);
      return { imageUrl };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  // store multiple images
  async storeMultipleImages(images: Express.Multer.File[], userId) {
    return {
      message: 'Deprecated',
    };
    const imageIds = await storeObjectsAWS(images, userId);
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
  // async updateFileAsUsed(fileUrls: string[] | string, userId: string | number) {
  //   try {
  //     const urlsArray = Array.isArray(fileUrls) ? fileUrls : [fileUrls];
  //     await this.fileQueue.add('updateFileUsed', { urls: urlsArray, userId });
  //   } catch (error) {
  //     console.log('Error updating file as used');
  //   }
  // }

  // update file as unused
  // async updateFileAsUnused(
  //   fileUrls: string[] | string,
  //   userId: string | number,
  // ) {
  //   try {
  //     const urlsArray = Array.isArray(fileUrls) ? fileUrls : [fileUrls];
  //     await this.fileQueue.add('updateFileUnused', { urls: urlsArray, userId });
  //   } catch (error) {
  //     console.log('Error updating file as unused');
  //   }
  // }

  // get files for test
  getFiles() {
    return this.fileRepository.find();
  }

  async deleteUnusedFiles() {
    const files = await this.fileRepository.findBy({ isUsed: false });
    console.log(files);
    Promise.all([
      files.map(async (file) => {
        const url = new URL(file.url);
        const objectId = url.pathname.substring(1);
        await deleteObjectAWS(objectId);
      }),
      await this.fileRepository.delete({ isUsed: false }),
    ]);
  }
}
