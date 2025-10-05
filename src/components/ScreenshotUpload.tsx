'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ScreenshotUploadProps {
  onUploadComplete: (screenshots: string[]) => void
}

export function ScreenshotUpload({ onUploadComplete }: ScreenshotUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    if (selectedFiles.length === 0) return

    // Limit to 10 files
    const limitedFiles = selectedFiles.slice(0, 10)

    // Create preview URLs
    const newPreviews = limitedFiles.map(file => URL.createObjectURL(file))

    setPreviews(newPreviews)
    setFiles(limitedFiles)
  }

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index))
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('screenshots', file)
      })

      const response = await fetch('/api/upload-screenshots', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        onUploadComplete(data.data.screenshots)
        // Clear previews after successful upload
        setPreviews([])
        setFiles([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        alert(`Upload failed: ${data.error}`)
      }
    } catch (error) {
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Screenshots</CardTitle>
        <CardDescription>
          Upload your own screenshots (up to 10 images, max 10MB each)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="screenshot-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
            {files.length > 0 && (
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Upload {files.length} {files.length === 1 ? 'Image' : 'Images'}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Preview Grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-video group">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="rounded-lg border shadow-sm object-cover"
                  />
                  <button
                    onClick={() => removePreview(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* File info */}
          {files.length > 0 && (
            <p className="text-sm text-gray-500">
              {files.length} {files.length === 1 ? 'file' : 'files'} selected
              {' • '}
              {(files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB total
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
