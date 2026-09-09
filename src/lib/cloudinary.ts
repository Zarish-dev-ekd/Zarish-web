import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'sjo0iipf',
  api_key: process.env.CLOUDINARY_API_KEY || '534799893232994',
  api_secret: process.env.CLOUDINARY_API_SECRET || '3BCy9uZbOYcaPfWDC2UximiUZtY',
  secure: true,
});

export async function uploadImage(
  fileBuffer: Buffer | string,
  folder: string = 'zarish'
): Promise<{
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'image' as const,
      transformation: [
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ]
    };

    if (typeof fileBuffer === 'string') {
      // Data URI / Base64 or remote URL
      cloudinary.uploader.upload(fileBuffer, uploadOptions, (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload failed with no result'));
        }
        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      });
    } else {
      // Buffer stream upload
      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload stream failed'));
        }
        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      });
      stream.end(fileBuffer);
    }
  });
}

export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (err) {
    console.error('Cloudinary delete error:', err);
    return false;
  }
}

export default cloudinary;
