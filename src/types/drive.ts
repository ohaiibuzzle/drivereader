export interface DriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
  thumbnailLink?: string
}

export type BreadcrumbEntry = {
  id: string
  name: string
}
