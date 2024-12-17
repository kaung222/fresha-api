import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  PutObjectTaggingCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ForbiddenException, HttpException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// store single file
export async function storeObjectAWS(
  file: Express.Multer.File,
  userId: string | number,
): Promise<string> {
  const s3Client = new S3Client({
    region: process.env?.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env?.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env?.AWS_SECRET_ACCESS_KEY,
    },
  });
  try {
    const key = generateKey(file.originalname, userId);
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      Tagging: 'isUsed=false',
    });
    await s3Client.send(command);
    return generateUrl(key);
  } catch (error) {
    console.error(error);
    throw new HttpException('Error storing file in aws_s3', 403);
  }
}

export async function updateObject(url: string, isUsed?: boolean) {
  const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    const Key = getKeyFromUrl(url);

    // Update the tags for the object
    const command = new PutObjectTaggingCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key,
      Tagging: {
        TagSet: [
          {
            Key: 'isUsed',
            Value: isUsed ? isUsed.toString() : 'true',
          },
        ],
      },
    });

    await s3Client.send(command);
    return { message: 'Updated object tags successfully' };
  } catch (error) {
    console.error(error);
    throw new HttpException('Error updating object tags in aws_s3', 403);
  }
}

// generate image key
function generateKey(originalName: string, userId: string | number): string {
  const extension = originalName.split('.')[1];
  return `user_${userId}_${uuidv4()}_INBX_IMG.${extension}`;
}

function getUserIdFromUrl(url: string) {
  const key = getKeyFromUrl(url);
  return key.split('_')[1];
}

function getKeyFromUrl(url: string) {
  return url.split('.net/')[1];
}

function generateUrl(imageId: string) {
  return `${process.env.ClOUDFRONT_BASEURL}/${imageId}`;
}

//store multiple files
export async function storeObjectsAWS(
  files: Express.Multer.File[],
  userId: string | number,
) {
  const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  try {
    const keys = Promise.all(
      files.map(async (file) => {
        const key = generateKey(file.originalname, userId);
        const command = new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
        });
        await s3Client.send(command);
        return key;
      }),
    );
    return keys;
  } catch (error) {
    console.error(error);
    throw new HttpException('Error storing file in aws_s3', 403);
  }
}

// delete single object
export async function deleteObjectAWS(url: string, userId: string | number) {
  if (!url) return null;
  const s3Client = new S3Client({
    region: process.env?.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env?.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env?.AWS_SECRET_ACCESS_KEY,
    },
  });

  const fileOwnerId = getUserIdFromUrl(url);
  if (fileOwnerId !== userId) return;
  const Key = getKeyFromUrl(url);
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

// update and delete in two or more files update
export async function updateTagsOfObjects(
  oldUrls: string[],
  newUrls: string[],
  userId: string | number,
) {
  const commonUrls = oldUrls.filter((url) => newUrls.includes(url));
  const urlsToDelete = oldUrls.filter((url) => !commonUrls.includes(url));
  const urlsToUpdate = newUrls.filter((url) => !commonUrls.includes(url)); // New logic

  try {
    // Delete objects not present in newUrls
    if (urlsToDelete.length > 0) {
      await deleteObjectsAWS(urlsToDelete, userId);
    }

    // Update tags for newly added URLs
    if (urlsToUpdate.length > 0) {
      await Promise.all(urlsToUpdate.map((url) => updateObject(url, true)));
    }
  } catch (error) {
    console.error('Error updating tags or deleting objects:', error);
    throw new Error('Error processing updates for S3 objects');
  }
}

// delete multiple objects
export async function deleteObjectsAWS(
  urls: string[],
  userId: string | number,
) {
  const s3Client = new S3Client({
    region: process.env?.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env?.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env?.AWS_SECRET_ACCESS_KEY,
    },
  });
  try {
    const Objects = urls.map((url) => {
      const fileOwnerId = getUserIdFromUrl(url);
      if (fileOwnerId !== userId) return;
      return { Key: getKeyFromUrl(url) };
    });
    const command = new DeleteObjectsCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Delete: {
        Objects,
      },
    });
    return await s3Client.send(command);
  } catch (error) {
    console.log(error);
  }
}
