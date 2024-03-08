import { join } from 'path';
import { Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';
import { jwtConstants } from '../auth/constants';

v2.config({ 
    cloud_name: jwtConstants.cloud_name, 
    api_key: jwtConstants.api_key, 
    api_secret: jwtConstants.api_secret, 
  });
  console.log(v2.config)
@Injectable()
export class CloudinaryService {
  async verifyConnection(): Promise<boolean> {
    try {
      const testImagePath = join(__dirname, '../../../src', 'images', '62.png'); 
      const uploadResponse = await v2.uploader.upload(testImagePath);

      // Check if the upload was successful
      if (uploadResponse && uploadResponse.secure_url) {
        console.log('Cloudinary connection verified.');
        return true;
      } else {
        console.log('Cloudinary connection failed. Unable to upload test image.');
        return false;
      }
    } catch (error) {
      console.log('Cloudinary connection failed. Error:', error);
      return false;
    }
  }
}
