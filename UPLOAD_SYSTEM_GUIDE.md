# File Upload System Documentation

## Overview

Complete file upload system with drag & drop, image compression, previews, progress tracking, and multiple reusable components.

## Features Implemented ✅

### 1. **Upload Utilities** (`src/utils/upload.ts`)

Core upload functions:
- ✅ `compressImage()` - Automatic image compression
- ✅ `uploadFile()` - Single file upload with progress
- ✅ `uploadFiles()` - Multiple file upload
- ✅ `validateFile()` - File validation (size, type)
- ✅ `generatePreview()` - Preview URL generation
- ✅ `formatFileSize()` - Human-readable file sizes
- ✅ Helper functions (isImage, isVideo, isPDF)

### 2. **FileUploader Component** (`src/components/FileUploader.tsx`)

General purpose file uploader:
- ✅ Drag & drop support
- ✅ File validation
- ✅ Image preview
- ✅ Upload progress bar
- ✅ Success/error states
- ✅ Remove file option
- ✅ Customizable file types and size limits

### 3. **AvatarUploader Component** (`src/components/AvatarUploader.tsx`)

Specialized for profile pictures:
- ✅ Circular preview
- ✅ Hover overlay
- ✅ Automatic compression (512x512, 0.5MB)
- ✅ Upload progress
- ✅ Remove avatar option
- ✅ Multiple sizes (sm, md, lg)

### 4. **PostMediaUploader Component** (`src/components/PostMediaUploader.tsx`)

For social media posts:
- ✅ Multiple files (up to 4)
- ✅ Grid layout
- ✅ Image & video support
- ✅ Individual upload progress
- ✅ Remove individual files
- ✅ Drag & drop

## Installation

```bash
npm install browser-image-compression react-dropzone
```

**Status**: ✅ Installed

## Usage Examples

### 1. FileUploader - General Files

```typescript
import { FileUploader } from '../components/FileUploader';

function MyForm() {
  const handleUploadComplete = (url: string, file: File) => {
    console.log('Uploaded:', url);
    // Save URL to form state
  };

  return (
    <FileUploader
      onUploadComplete={handleUploadComplete}
      maxSize={10} // 10MB
      allowedTypes={['application/pdf', 'image/*']}
      accept={{
        'application/pdf': ['.pdf'],
        'image/*': ['.png', '.jpg', '.jpeg'],
      }}
    />
  );
}
```

### 2. AvatarUploader - Profile Pictures

```typescript
import { AvatarUploader } from '../components/AvatarUploader';

function ProfileSettings() {
  const [avatarUrl, setAvatarUrl] = useState('');

  return (
    <div className="flex flex-col items-center">
      <AvatarUploader
        currentAvatar={avatarUrl}
        onUploadComplete={setAvatarUrl}
        size="lg"
      />
      <p className="mt-2">Click to change avatar</p>
    </div>
  );
}
```

### 3. PostMediaUploader - Social Posts

```typescript
import { PostMediaUploader } from '../components/PostMediaUploader';

function CreatePost() {
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  const handleSubmit = () => {
    // Submit post with mediaUrls
    console.log('Media URLs:', mediaUrls);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea placeholder="What's on your mind?" />
      
      <PostMediaUploader
        onMediaChange={setMediaUrls}
        maxFiles={4}
      />
      
      <button type="submit">Post</button>
    </form>
  );
}
```

### 4. CV/Resume Upload

```typescript
import { FileUploader } from '../components/FileUploader';

function JobApplication() {
  const [cvUrl, setCvUrl] = useState('');

  return (
    <div>
      <label>Upload CV/Resume</label>
      <FileUploader
        onUploadComplete={(url) => setCvUrl(url)}
        maxSize={5}
        accept={{
          'application/pdf': ['.pdf'],
          'application/msword': ['.doc'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        }}
      />
    </div>
  );
}
```

### 5. Multiple Images Upload

```typescript
import { PostMediaUploader } from '../components/PostMediaUploader';

function ProductGallery() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <div>
      <h3>Product Images</h3>
      <PostMediaUploader
        onMediaChange={setImages}
        maxFiles={6}
      />
      <p>{images.length} images uploaded</p>
    </div>
  );
}
```

## Component Props

### FileUploader

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onUploadComplete` | `(url: string, file: File) => void` | - | Callback when upload succeeds |
| `onUploadError` | `(error: Error) => void` | - | Callback when upload fails |
| `maxSize` | `number` | `10` | Max file size in MB |
| `allowedTypes` | `string[]` | - | Allowed MIME types |
| `accept` | `Record<string, string[]>` | - | File types for input |
| `multiple` | `boolean` | `false` | Allow multiple files |
| `className` | `string` | `''` | Additional CSS classes |

### AvatarUploader

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentAvatar` | `string` | - | Current avatar URL |
| `onUploadComplete` | `(url: string) => void` | - | Callback when upload succeeds |
| `onUploadError` | `(error: Error) => void` | - | Callback when upload fails |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Avatar size |
| `className` | `string` | `''` | Additional CSS classes |

### PostMediaUploader

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onMediaChange` | `(urls: string[]) => void` | - | Callback when media changes |
| `maxFiles` | `number` | `4` | Maximum number of files |
| `className` | `string` | `''` | Additional CSS classes |

## Upload States

All components manage these states:

1. **Idle**: No file selected
2. **Uploading**: File is being uploaded
3. **Success**: Upload completed
4. **Error**: Upload failed

## Image Compression

Automatic compression for images:

```typescript
// Default settings
{
  maxSizeMB: 1,           // Compress to max 1MB
  maxWidthOrHeight: 1920, // Max dimension 1920px
  useWebWorker: true,     // Use web worker for performance
}

// Avatar specific
{
  maxSizeMB: 0.5,         // Smaller for avatars
  maxWidthOrHeight: 512,  // 512x512 max
}
```

## File Validation

```typescript
import { validateFile } from '../utils/upload';

const validation = validateFile(file, {
  maxSize: 10 * 1024 * 1024, // 10MB in bytes
  allowedTypes: ['image/png', 'image/jpeg', 'application/pdf'],
});

if (!validation.valid) {
  console.error(validation.error);
}
```

## Backend Integration

### Upload Endpoint

The components expect a backend endpoint at `/api/upload`:

```typescript
// Backend (NestJS example)
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  // Upload to Cloudinary/S3
  const result = await this.cloudinaryService.upload(file);
  
  return {
    url: result.secure_url,
    publicId: result.public_id,
    filename: file.originalname,
    size: file.size,
    type: file.mimetype,
  };
}
```

### Cloudinary Integration

```typescript
// Backend service
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async upload(file: Express.Multer.File) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'uploads' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(file.buffer);
  });
}
```

### AWS S3 Integration

```typescript
// Backend service
import { S3 } from 'aws-sdk';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

async upload(file: Express.Multer.File) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  const result = await s3.upload(params).promise();
  return { url: result.Location };
}
```

## Progress Tracking

```typescript
const handleUpload = async (file: File) => {
  await uploadFile(file, {
    onProgress: (progress) => {
      console.log(`Upload progress: ${progress}%`);
      // Update UI
      setProgress(progress);
    },
  });
};
```

## Error Handling

```typescript
<FileUploader
  onUploadComplete={(url) => {
    console.log('Success:', url);
    toast.success('File uploaded!');
  }}
  onUploadError={(error) => {
    console.error('Error:', error);
    toast.error('Upload failed');
    // Log to error tracking service
    Sentry.captureException(error);
  }}
/>
```

## Styling

All components use Tailwind CSS and support dark mode:

```typescript
<FileUploader className="my-custom-class" />
```

## Best Practices

1. **Always validate files** before upload
2. **Compress images** to save bandwidth
3. **Show progress** for better UX
4. **Handle errors** gracefully
5. **Limit file sizes** to prevent abuse
6. **Use appropriate file types** for each use case
7. **Clean up previews** to prevent memory leaks
8. **Provide visual feedback** (loading, success, error)

## Security Considerations

1. **Backend Validation**: Always validate on backend
2. **File Type Checking**: Check MIME type and extension
3. **Size Limits**: Enforce on both frontend and backend
4. **Virus Scanning**: Scan uploaded files
5. **Access Control**: Verify user permissions
6. **Secure URLs**: Use signed URLs for private files

## Performance Optimization

1. **Web Workers**: Image compression uses web workers
2. **Lazy Loading**: Load previews only when needed
3. **Debounce**: Debounce upload triggers
4. **Chunked Upload**: For large files (future enhancement)
5. **CDN**: Serve uploaded files from CDN

## Troubleshooting

### Upload Fails

- Check backend endpoint is correct
- Verify file size is within limits
- Check CORS settings
- Verify authentication token

### Compression Too Slow

- Reduce `maxWidthOrHeight`
- Increase `maxSizeMB`
- Disable `useWebWorker` if issues

### Preview Not Showing

- Check file type is supported
- Verify `generatePreview` is called
- Check browser console for errors

## Future Enhancements

- [ ] Chunked upload for large files
- [ ] Resume interrupted uploads
- [ ] Batch upload optimization
- [ ] Video compression
- [ ] Image cropping tool
- [ ] Drag to reorder media
- [ ] Direct camera capture
- [ ] Paste from clipboard

## Resources

- Upload Utils: `src/utils/upload.ts`
- FileUploader: `src/components/FileUploader.tsx`
- AvatarUploader: `src/components/AvatarUploader.tsx`
- PostMediaUploader: `src/components/PostMediaUploader.tsx`
- [browser-image-compression](https://www.npmjs.com/package/browser-image-compression)
- [react-dropzone](https://react-dropzone.js.org/)
