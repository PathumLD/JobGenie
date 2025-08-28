import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { ProfileService } from '@/services/profileService';

interface ProfileImageUploadProps {
  currentImageUrl?: string | null;
  onImageUpdate: (newImageUrl: string) => void;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  onImageUpdate
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('profile_image', selectedFile);

      // Call the API to upload the image
      const response = await fetch('/api/candidate/profile/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      
      if (result.success) {
        // Update the profile image URL
        onImageUpdate(result.data.profile_image_url);
        
        // Reset the component state
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Show success message
        alert('Profile image updated successfully!');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Current Image Display */}
      <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-4 overflow-hidden">
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : currentImageUrl ? (
          <img 
            src={currentImageUrl} 
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl text-gray-600 font-semibold">
            ?
          </span>
        )}
      </div>

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Button */}
      {!selectedFile && (
        <Button 
          variant="outline" 
          className="w-full lg:w-auto border-gray-600 text-gray-600 hover:bg-gray-50"
          onClick={handleClickUpload}
        >
          <Upload size={16} className="mr-2" />
          Upload Photo
        </Button>
      )}

      {/* Preview Actions */}
      {selectedFile && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 text-center">
            {selectedFile.name}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Save Photo'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading}
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
