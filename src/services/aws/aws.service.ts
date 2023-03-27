import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import FileType from 'file-type';

@Injectable()
export class AWSService {
  async uploadToS3(buffer: Buffer, filename: string): Promise<string> {
    const fileType = await FileType.fromBuffer(buffer);
    const s3 = new S3();
    const { Location: result } = await s3
      .upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: buffer,
        Key: filename + '.' + fileType.ext,
        ACL: 'public-read',
        ContentDisposition: 'inline',
        ContentType: fileType.mime,
      })
      .promise();

    return result;
  }
}
