# Imagere

<div align="center">
  <img src="./public/imagere-logo.svg" width="300" alt="Imagere logo" />
</div>

Imagere is a powerful and efficient image processing tool built with Next.js and Sharp. It allows you to resize and optimize images without losing quality.

## Features

- **Resize images** while maintaining aspect ratio
- **Change image format** (JPEG, PNG, WebP)
- **Adjust quality** for JPEG and WebP images
- **Prevent enlargement** of small images to avoid quality loss
- **Cache optimized images** for better performance
- **Simple API** for easy integration with any application
- **Dark mode support** with system preference detection
- **Modern responsive UI** that works on all devices

## About

Imagere is a self-hosted image processing tool that can be deployed to your own server or cloud provider. Once deployed, it provides an easy-to-use interface for resizing and optimizing images, as well as a simple API for programmatic access.

## Screenshots

To see the application in action, you can clone the repository and run it locally following the installation instructions below.

## Tech Stack

- **Next.js 14** - React framework with API routes and App Router
- **Sharp** - High-performance image processing library
- **React** - UI components and state management
- **CSS Modules** - For component-scoped styling
- **CSS Variables** - For theming support (dark/light mode)

## API Usage

The API is accessible at `/api/imagere` and accepts `POST` requests with the following parameters:

### Request

- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `image`: Image file (required)
- **Query Parameters**:
  - `width`: Target width in pixels (optional)
  - `height`: Target height in pixels (optional)
  - `quality`: Compression quality (1-100) for JPEG and WebP (optional, default: 80)
  - `format`: Output format (`jpeg`, `png`, or `webp`) (optional, default: original format)

### Response

- **Content-Type**: Based on the output format
- **Body**: The processed image file
- **Cache-Control**: `public, max-age=31536000, immutable`

### Example API Usage

Using fetch:

```js
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('/api/imagere?width=800&format=webp&quality=85', {
  method: 'POST',
  body: formData,
});

if (response.ok) {
  const blob = await response.blob();
  const imageUrl = URL.createObjectURL(blob);
  // Use the imageUrl in your application
}
```

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/onurtaskirancom/imagere.git
cd imagere
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

The application can be deployed on Vercel, Netlify, or any other hosting service that supports Next.js applications.

```bash
npm run build
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

[Onur Taşkıran](https://onurtaskiran.com)
