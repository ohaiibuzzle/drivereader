import type { DriveFile } from '../types/drive'

const BASE = 'https://www.googleapis.com/drive/v3'

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` }
}

async function driveGet<T>(token: string, path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString(), { headers: authHeaders(token) })
  if (!res.ok) throw new Error(`Drive API error ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

type FilePage = { files: DriveFile[]; nextPageToken?: string }

async function fetchAllPages(
  token: string,
  baseParams: Record<string, string>,
): Promise<DriveFile[]> {
  const all: DriveFile[] = []
  let pageToken: string | undefined
  do {
    const params = pageToken ? { ...baseParams, pageToken } : baseParams
    const page = await driveGet<FilePage>(token, '/files', params)
    all.push(...(page.files ?? []))
    pageToken = page.nextPageToken
  } while (pageToken)
  return all
}

export function listFolder(
  token: string,
  folderId: string,
  orderBy = 'modifiedTime desc',
): Promise<DriveFile[]> {
  return fetchAllPages(token, {
    q: `'${folderId}' in parents and trashed=false`,
    orderBy,
    fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,thumbnailLink)',
    pageSize: '200',
    supportsAllDrives: 'true',
    includeItemsFromAllDrives: 'true',
  })
}

export function listSharedWithMe(
  token: string,
  orderBy = 'modifiedTime desc',
): Promise<DriveFile[]> {
  return fetchAllPages(token, {
    q: 'sharedWithMe=true and trashed=false',
    orderBy,
    fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,thumbnailLink)',
    pageSize: '200',
    supportsAllDrives: 'true',
    includeItemsFromAllDrives: 'true',
  })
}

export async function getFileMetadata(token: string, fileId: string): Promise<DriveFile> {
  return driveGet<DriveFile>(token, `/files/${fileId}`, {
    fields: 'id,name,mimeType,modifiedTime,thumbnailLink',
    supportsAllDrives: 'true',
  })
}

export async function fetchImageBlob(token: string, fileId: string): Promise<string> {
  const url = `${BASE}/files/${fileId}?alt=media&supportsAllDrives=true`
  const res = await fetch(url, { headers: authHeaders(token) })
  if (!res.ok) throw new Error(`Failed to fetch image ${fileId}: ${res.status}`)
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

/** Extract a file/folder ID from any Google Drive share URL */
export function extractDriveId(url: string): string | null {
  const match = url.match(/(?:\/folders\/|\/file\/d\/|\/document\/d\/|\/spreadsheets\/d\/|\/presentation\/d\/|[?&]id=)([a-zA-Z0-9_-]{10,})/)
  return match?.[1] ?? null
}
