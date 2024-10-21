import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ForbiddenException } from '@nestjs/common';

export async function deleteObjectAWS(Key: string) {
  const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key,
    });

    return await s3Client.send(command);
  } catch (error) {
    console.log(error);
    throw new ForbiddenException(error);
  }
}
