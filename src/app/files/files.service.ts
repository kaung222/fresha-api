import { BadRequestException, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { storeObjectAWS, storeObjectsAWS } from '@/utils/store-obj-s3';
import { deleteObjectAWS } from '@/utils/delete-obj-s3';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    // private awsS3Service: AwsS3Service
  ) {}

  //store image
  async storeImage(file: Express.Multer.File) {
    try {
      const imageId = await storeObjectAWS(file);
      const imageUrls = this.generateImageUrls([imageId]);
      await this.saveImageUrlsToDatabase(imageUrls);
      return { imageUrl: imageUrls[0] };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  // store multiple images
  async storeMultipleImages(images: Express.Multer.File[]) {
    const imageIds = await storeObjectsAWS(images);
    const imageUrls = this.generateImageUrls(imageIds);
    await this.saveImageUrlsToDatabase(imageUrls);
    return { imageUrls };
  }

  private generateImageUrls(imageIds: string[]): string[] {
    // Generate CloudFront URLs based on image IDs
    return imageIds.map(
      (imageId) => `${process.env.ClOUDFRONT_BASEURL}/${imageId}`,
    );
  }

  private async saveImageUrlsToDatabase(imageUrls: string[]): Promise<void> {
    // Create an array of URL objects
    const urls = imageUrls.map((imageUrl) => {
      return { url: imageUrl };
    });
    await this.fileRepository.insert(urls);
  }

  // update file as used
  async updateFileAsUsed(fileUrls: string[]) {
    await this.fileRepository.update(
      { url: In(fileUrls), isUsed: false },
      { isUsed: true },
    );
  }

  // update file as unused
  async updateFileAsUnused(fileUrls: string[]) {
    await this.fileRepository.update(
      { url: In(fileUrls), isUsed: true },
      { isUsed: false },
    );
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
