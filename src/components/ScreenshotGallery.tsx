'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import type { ScrapedAsset } from '@/types'

interface ScreenshotGalleryProps {
  scrapedData: ScrapedAsset[]
  onSelectionChange: (selectedScreenshots: string[]) => void
}

export function ScreenshotGallery({ scrapedData, onSelectionChange }: ScreenshotGalleryProps) {
  const [selectedScreenshots, setSelectedScreenshots] = useState<Set<string>>(() => {
    // By default, select all screenshots
    const allScreenshots = new Set<string>()
    scrapedData.forEach(asset => {
      asset.screenshots.forEach(screenshot => {
        allScreenshots.add(screenshot)
      })
    })
    return allScreenshots
  })

  const toggleScreenshot = (screenshot: string) => {
    const newSelected = new Set(selectedScreenshots)
    if (newSelected.has(screenshot)) {
      newSelected.delete(screenshot)
    } else {
      newSelected.add(screenshot)
    }
    setSelectedScreenshots(newSelected)
    onSelectionChange(Array.from(newSelected))
  }

  const selectAll = () => {
    const allScreenshots = new Set<string>()
    scrapedData.forEach(asset => {
      asset.screenshots.forEach(screenshot => {
        allScreenshots.add(screenshot)
      })
    })
    setSelectedScreenshots(allScreenshots)
    onSelectionChange(Array.from(allScreenshots))
  }

  const deselectAll = () => {
    setSelectedScreenshots(new Set())
    onSelectionChange([])
  }

  const totalScreenshots = scrapedData.reduce((sum, asset) => sum + asset.screenshots.length, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Screenshot Gallery</CardTitle>
            <CardDescription>
              Select screenshots to include in your video ({selectedScreenshots.size} / {totalScreenshots} selected)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={selectAll} variant="outline" size="sm">
              <Check className="w-4 h-4 mr-1" />
              Select All
            </Button>
            <Button onClick={deselectAll} variant="outline" size="sm">
              <X className="w-4 h-4 mr-1" />
              Deselect All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {scrapedData.map((asset, assetIndex) => (
            <div key={assetIndex} className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">{asset.title}</h3>
                <span className="text-sm text-gray-500">({asset.screenshots.length} screenshots)</span>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {asset.screenshots.map((screenshot, screenshotIndex) => {
                  const isSelected = selectedScreenshots.has(screenshot)
                  return (
                    <div
                      key={screenshotIndex}
                      className={`relative aspect-video cursor-pointer rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-2'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      onClick={() => toggleScreenshot(screenshot)}
                    >
                      <Image
                        src={screenshot}
                        alt={`${asset.title} - Screenshot ${screenshotIndex + 1}`}
                        fill
                        className="rounded-lg object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
