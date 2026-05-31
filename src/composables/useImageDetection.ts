import type { DriveFile } from '../types/drive'

const FOLDER_MIME = 'application/vnd.google-apps.folder'

export function isMostlyImages(files: DriveFile[]): boolean {
  const nonFolders = files.filter((f) => f.mimeType !== FOLDER_MIME)
  if (nonFolders.length === 0) return false
  const imageCount = nonFolders.filter((f) => f.mimeType.startsWith('image/')).length
  return imageCount / nonFolders.length > 0.5
}
