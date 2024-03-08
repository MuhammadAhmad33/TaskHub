import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');
import { jwtConstants } from '../auth/constants';
import { Express } from 'express';

@Injectable()
export class UploadService {
  constructor() {
    v2.config({
      cloud_name: jwtConstants.cloud_name,  
      api_key: jwtConstants.api_key,
      api_secret: jwtConstants.api_secret,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file || !file.buffer) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    return new Promise<string>((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error: Error, result: UploadApiResponse) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new HttpException('Failed to upload file', HttpStatus.INTERNAL_SERVER_ERROR));
        } else {
          if (result && result.secure_url) {
            resolve(result.secure_url);
          } else {
            console.error('Cloudinary upload response error:', result);
            reject(new HttpException('Failed to upload file', HttpStatus.INTERNAL_SERVER_ERROR));
          }
        }
      });

      toStream(file.buffer).pipe(upload);
    });
  }
}
