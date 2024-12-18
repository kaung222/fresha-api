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

export async function updateObjectAsUsed(url?: string, isUsed?: boolean) {
  if (!url) return null;
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

export async function updateObjectsAsUsed(urls?: string[], isUsed?: boolean) {
  if (!urls) return null;
  const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    await Promise.all(
      urls.map(async (url) => {
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
      }),
    );
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
export async function deleteObjectAWS(userId: string | number, url?: string) {
  if (!url) return null;
  const s3Client = new S3Client({
    region: process.env?.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env?.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env?.AWS_SECRET_ACCESS_KEY,
    },
  });

  const fileOwnerId = getUserIdFromUrl(url);
  console.log(url, userId);
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
  userId: string | number,
  oldUrls: string[],
  newUrls: string[],
) {
  const commonUrls = oldUrls.filter((url) => newUrls.includes(url));
  const urlsToDelete = oldUrls.filter((url) => !commonUrls.includes(url));
  const urlsToUpdate = newUrls.filter((url) => !commonUrls.includes(url)); // New logic

  try {
    // Delete objects not present in newUrls
    if (urlsToDelete.length > 0) {
      await deleteObjectsAWS(userId, urlsToDelete);
    }

    // Update tags for newly added URLs
    if (urlsToUpdate.length > 0) {
      await Promise.all(
        urlsToUpdate.map((url) => updateObjectAsUsed(url, true)),
      );
    }
  } catch (error) {
    console.error('Error updating tags or deleting objects:', error);
    throw new Error('Error processing updates for S3 objects');
  }
}

export async function updateTagOfObject(
  userId: string | number,
  oldUrl?: string,
  newUrl?: string,
) {
  try {
    if (oldUrl === newUrl) return;
    oldUrl && (await deleteObjectAWS(userId, oldUrl));
    newUrl && (await updateObjectAsUsed(newUrl));
  } catch (error) {
    console.log(error);
  }
}

// delete multiple objects
export async function deleteObjectsAWS(
  userId: string | number,
  urls?: string[],
) {
  console.log('deleted urls', urls);
  const s3Client = new S3Client({
    region: process.env?.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env?.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env?.AWS_SECRET_ACCESS_KEY,
    },
  });
  try {
    const Objects = urls
      .filter((url) => {
        const fileOwnerId = getUserIdFromUrl(url);
        return fileOwnerId === userId;
      })
      .map((url) => {
        return { Key: getKeyFromUrl(url) };
      });
    const command = new DeleteObjectsCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Delete: {
        Objects,
      },
    });
    await s3Client.send(command);
  } catch (error) {
    console.log(error);
  }
}
