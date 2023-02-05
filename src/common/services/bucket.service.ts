import { S3 } from 'aws-sdk';

export async function uploadS3Image(
  bufferImage: Buffer,
  filename: string,
): Promise<string> {
  const s3 = new S3();

  const { Location: result } = await s3
    .upload({
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: bufferImage,
      Key: filename + Math.floor(1000 + Math.random() * 9000) + '.jpeg',
      ACL: 'public-read',
      ContentDisposition: 'inline',
      ContentType: 'image/jpeg',
    })
    .promise();

  return result;
}
