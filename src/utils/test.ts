import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { HttpException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export async function storeObjectAWS(file: Express.Multer.File) {
  const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const tagString = 'isUsed=false';
  try {
    const key = generateKey(file.originalname);
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      Tagging: tagString,
    });
    await s3Client.send(command);
    return { key };
  } catch (error) {
    console.error(error);
    throw new HttpException('Error storing file in aws_s3', 403);
  }
}

// generate image key
function generateKey(originalName: string): string {
  const extension = originalName.split('.')[1];
  return `${uuidv4()}INBX_IMG.${extension}`;
}
