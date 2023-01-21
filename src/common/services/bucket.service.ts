import { S3 } from 'aws-sdk';
import FileType from 'file-type';

export async function uploadS3Image(
  bufferImage: Buffer,
  filename: string,
): Promise<string> {
  const s3 = new S3();

  const fileType = await FileType.fromBuffer(bufferImage);

  const ext = fileType.ext === 'png' ? 'jpg' : fileType.ext;

  const { Location: result } = await s3
    .upload({
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: bufferImage,
      Key: filename + Math.floor(1000 + Math.random() * 9000) + '.' + ext,
      ACL: 'public-read',
      ContentDisposition: 'inline',
      ContentType: fileType.mime === 'image/png' ? 'image/jpeg' : fileType.mime,
    })
    .promise();

  return result;
}
