import { PipeTransform, HttpStatus, BadRequestException } from '@nestjs/common';

export class TransformToBufferPipe implements PipeTransform<any> {
  async transform(payload: any): Promise<any> {
    if (payload.image) {
      const mbValue = 1024;
      const maxMbBufferSize = 3;
      const bufferSizeLimt = maxMbBufferSize * mbValue;

      payload.buffer = Buffer.from(payload.image, 'base64');

      const bufferMbSize = payload.buffer.length / mbValue;

      if (bufferMbSize > bufferSizeLimt) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Bad Request',
          errors: [
            {
              property: 'image',
              children: [],
              constraints: {
                IMAGE_SIZE_LIMIT:
                  'The image provided is too big. The image must not be bigger than 3mb',
              },
            },
          ],
        });
      }

      return payload;
    }
  }
}
