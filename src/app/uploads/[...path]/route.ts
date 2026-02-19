import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Legacy route for old uploaded files
 * Handles URLs like /uploads/filename.png
 * Serves file directly from /public/uploads/
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathStr = Array.isArray(path) ? path.join('/') : path;

    // Security check: prevent directory traversal
    const normalizedPath = pathStr.replace(/\.\./g, '');
    const filepath = join(process.cwd(), 'public', 'uploads', normalizedPath);

    // Check if file exists
    if (!existsSync(filepath)) {
      console.error('File not found:', filepath);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read file
    const file = await readFile(filepath);

    // Determine content type
    const ext = filepath.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      pdf: 'application/pdf',
      txt: 'text/plain',
      json: 'application/json',
      svg: 'image/svg+xml',
    };

    const contentType = contentTypes[ext || ''] || 'application/octet-stream';

    // Cache headers for better performance
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    };

    return new NextResponse(file as Buffer, { headers });
  } catch (error) {
    console.error('Serve file error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
