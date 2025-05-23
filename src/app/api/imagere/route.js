import { NextResponse } from 'next/server';
import sharp from 'sharp';

// Configure Sharp for Vercel deployment
if (process.env.VERCEL) {
  sharp.cache(false);
  sharp.simd(false);
}

/**
 * Process the incoming image with sharp
 * @param {Buffer} buffer - The image buffer
 * @param {Object} options - Processing options
 * @returns {Promise<Buffer>} Processed image buffer
 */
async function processImage(buffer, options) {
  try {
    const { width, height, quality, format } = options;
    
    let image = sharp(buffer);
    
    // Get image metadata
    const metadata = await image.metadata();
    
    // Check file size limits (10MB for Vercel)
    if (buffer.length > 10 * 1024 * 1024) {
      throw new Error('Image file too large. Maximum size is 10MB.');
    }
    
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
    
    return await image.toBuffer();
  } catch (error) {
    console.error('Sharp processing error:', error);
    throw new Error(`Image processing failed: ${error.message}`);
  }
}

export async function POST(request) {
  try {
    console.log('API called - processing image');
    
    // Get query parameters
    const url = new URL(request.url);
    const width = url.searchParams.get('width');
    const height = url.searchParams.get('height');
    const quality = url.searchParams.get('quality');
    const format = url.searchParams.get('format');
    
    console.log('Parameters:', { width, height, quality, format });
    
    // Parse the multipart form data - in App Router this is built-in
    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file) {
      console.error('No image file provided');
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }
    
    console.log('File received:', { 
      name: file.name, 
      size: file.size, 
      type: file.type 
    });
    
    // Check file size before processing
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image file too large. Maximum size is 10MB.' },
        { status: 413 }
      );
    }
    
    // Convert the file to buffer
    let buffer;
    if (file instanceof Blob) {
      buffer = Buffer.from(await file.arrayBuffer());
      console.log('Buffer created, size:', buffer.length);
    } else {
      console.error('Invalid file format received');
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      );
    }
    
    // Process the image
    console.log('Starting image processing...');
    const processedBuffer = await processImage(buffer, {
      width,
      height,
      quality,
      format,
    });
    console.log('Image processing completed, output size:', processedBuffer.length);
    
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
      try {
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
      } catch (metadataError) {
        console.warn('Could not determine original format, using JPEG');
      }
    }
    
    // Set cache headers
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    };
    
    console.log('Returning processed image');
    // Return the processed image
    return new NextResponse(processedBuffer, { headers });
  } catch (error) {
    console.error('Image processing error:', error);
    
    // Return appropriate error based on error type
    if (error.message.includes('too large')) {
      return NextResponse.json(
        { error: error.message },
        { status: 413 }
      );
    } else if (error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Processing timeout. Please try a smaller image.' },
        { status: 408 }
      );
    } else {
      return NextResponse.json(
        { error: `Image processing error: ${error.message}` },
        { status: 500 }
      );
    }
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload an image.' },
    { status: 405 }
  );
} 