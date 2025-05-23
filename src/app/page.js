'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import ThemeToggle from './components/ThemeToggle';

export default function Home() {
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [formParams, setFormParams] = useState({
    width: '',
    height: '',
    quality: '80',
    format: '',
  });
  
  const fileInputRef = useRef(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormParams((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const fileInput = fileInputRef.current;
    if (!fileInput.files || fileInput.files.length === 0) {
      setError('Please select an image to process');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('image', fileInput.files[0]);
      
      console.log('Uploading file:', {
        name: fileInput.files[0].name,
        size: fileInput.files[0].size,
        type: fileInput.files[0].type
      });
      
      // Build URL with query parameters
      let url = '/api/imagere';
      const params = new URLSearchParams();
      
      if (formParams.width) params.append('width', formParams.width);
      if (formParams.height) params.append('height', formParams.height);
      if (formParams.quality) params.append('quality', formParams.quality);
      if (formParams.format) params.append('format', formParams.format);
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      console.log('API URL:', url);

      // Make the API request
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = 'Failed to process image';
        
        // Get response text first, then try to parse as JSON
        const textResponse = await response.text();
        console.error('API Error Response:', textResponse);
        
        try {
          // Try to parse the text as JSON
          const errorData = JSON.parse(textResponse);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, extract meaningful error from text response
          if (textResponse.includes('Request Entity Too Large')) {
            errorMessage = 'Image file is too large. Please try a smaller image.';
          } else if (textResponse.includes('Function Timeout')) {
            errorMessage = 'Processing timeout. Please try a smaller image or reduce quality.';
          } else if (textResponse.includes('Memory')) {
            errorMessage = 'Out of memory. Please try a smaller image.';
          } else {
            errorMessage = `Server error (${response.status}): ${response.statusText}`;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Check if response is actually an image
      const contentType = response.headers.get('content-type');
      console.log('Response content-type:', contentType);
      
      if (!contentType || !contentType.startsWith('image/')) {
        // If not an image, try to read as JSON for error message
        const errorText = await response.text();
        console.error('Expected image but got:', errorText);
        throw new Error('Server returned invalid response format');
      }
      
      // Create a URL for the processed image blob
      const blob = await response.blob();
      console.log('Received blob:', { size: blob.size, type: blob.type });
      
      if (blob.size === 0) {
        throw new Error('Received empty image response');
      }
      
      const imageUrl = URL.createObjectURL(blob);
      console.log('Created blob URL:', imageUrl);
      setProcessedImage(imageUrl);
    } catch (err) {
      setError(err.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const resetForm = () => {
    if (processedImage) {
      URL.revokeObjectURL(processedImage);
    }
    setProcessedImage(null);
    setError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setFormParams({
      width: '',
      height: '',
      quality: '80',
      format: '',
    });
  };
  
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <ThemeToggle />
        <h1 className={styles.title}>Imagere</h1>
        <p className={styles.description}>
          Upload and process your images without losing quality
        </p>
        
        {!processedImage ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="image" className={styles.label}>
                Select Image
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                ref={fileInputRef}
                className={styles.fileInput}
                required
              />
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="width" className={styles.label}>
                  Width (px)
                </label>
                <input
                  type="number"
                  id="width"
                  name="width"
                  value={formParams.width}
                  onChange={handleInputChange}
                  placeholder="Original width"
                  min="1"
                  className={styles.input}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="height" className={styles.label}>
                  Height (px)
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formParams.height}
                  onChange={handleInputChange}
                  placeholder="Original height"
                  min="1"
                  className={styles.input}
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="quality" className={styles.label}>
                  Quality (1-100)
                </label>
                <input
                  type="number"
                  id="quality"
                  name="quality"
                  value={formParams.quality}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className={styles.input}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="format" className={styles.label}>
                  Format
                </label>
                <select
                  id="format"
                  name="format"
                  value={formParams.format}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">Original format</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
            </div>
            
            {error && <div className={styles.error}>{error}</div>}
            
            <button
              type="submit"
              className={styles.button}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Process Image'}
            </button>
          </form>
        ) : (
          <div className={styles.result}>
            <div className={styles.imageContainer}>
              <Image
                src={processedImage}
                alt="Processed"
                className={styles.processedImage}
                width={800}
                height={600}
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain'
                }}
                unoptimized={true}
              />
            </div>
            
            <div className={styles.buttonGroup}>
              <a
                href={processedImage}
                download="processed-image.jpg"
                className={styles.button}
              >
                Download
              </a>
              <button onClick={resetForm} className={styles.buttonOutline}>
                Process Another Image
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
