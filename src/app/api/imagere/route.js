import { NextResponse } from 'next/server';
import sharp from 'sharp';

/**
 * Process the incoming image with sharp
 * @param {Buffer} buffer - The image buffer
 * @param {Object} options - Processing options
 * @returns {Promise<Buffer>} Processed image buffer
 */
async function processImage(buffer, options) {
  const { width, height, quality, format } = options;
  
  let image = sharp(buffer);
  
  // Get image metadata
  const metadata = await image.metadata();
  
  // Apply resize if width or height is provided
  if (width || height) {
    image = image.resize({
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      withoutEnlargement: true, // Don't enlarge small images
      fit: 'inside',
    });
  }
  
  // Apply format conversion if requested
  if (format) {
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        image = image.jpeg({ quality: quality ? parseInt(quality) : 80 });
        break;
      case 'png':
        image = image.png();
        break;
      case 'webp':
        image = image.webp({ quality: quality ? parseInt(quality) : 80 });
        break;
      default:
        // Keep original format
        break;
    }
  } else {
    // If no format specified, keep original but apply quality if available
    const originalFormat = metadata.format;
    if (quality && (originalFormat === 'jpeg' || originalFormat === 'webp')) {
      if (originalFormat === 'jpeg') {
        image = image.jpeg({ quality: parseInt(quality) });
      } else if (originalFormat === 'webp') {
        image = image.webp({ quality: parseInt(quality) });
      }
    }
  }
  
  return image.toBuffer();
}

export async function POST(request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const width = url.searchParams.get('width');
    const height = url.searchParams.get('height');
    const quality = url.searchParams.get('quality');
    const format = url.searchParams.get('format');
    
    // Parse the multipart form data - in App Router this is built-in
    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }
    
    // Convert the file to buffer
    let buffer;
    if (file instanceof Blob) {
      buffer = Buffer.from(await file.arrayBuffer());
    } else {
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      );
    }
    
    // Process the image
    const processedBuffer = await processImage(buffer, {
      width,
      height,
      quality,
      format,
    });
    
    // Determine the output format
    let contentType = 'image/jpeg'; // Default
    if (format) {
      switch (format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          contentType = 'image/jpeg';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
      }
    } else {
      // Try to get the original format from metadata
      const metadata = await sharp(buffer).metadata();
      switch (metadata.format) {
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
      }
    }
    
    // Set cache headers
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    };
    
    // Return the processed image
    return new NextResponse(processedBuffer, { headers });
  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json(
      { error: 'Image processing error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload an image.' },
    { status: 405 }
  );
} 