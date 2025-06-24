// src/app/api/files/download/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import connectDB from '@/lib/db';
import FileAsset, { IFileAsset } from '@/models/FileAsset.model';
import { Types } from 'mongoose';

export const config = {
  api: {
    bodyParser: false,
  },
};

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const fileId = url.searchParams.get('fileId');
    if (!fileId || !Types.ObjectId.isValid(fileId)) {
      return NextResponse.json({ error: 'fileId inválido' }, { status: 400 });
    }

    // findById con lean<IFileAsset>() para que TS reconozca las propiedades
    const fileDoc = await FileAsset.findById(fileId).lean<IFileAsset>();
    if (!fileDoc) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
    }

    // Extraer key de la URL de S3 (se asume la forma: https://bucket.s3.region.amazonaws.com/KEY)
    const s3Url = new URL(fileDoc.url);
    const key = s3Url.pathname.startsWith('/') ? s3Url.pathname.slice(1) : s3Url.pathname;

    // Generar URL presignada
    const getCmd = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET || '',
      Key: key,
    });
    const signedUrl = await getSignedUrl(s3, getCmd, { expiresIn: 300 }); // 5 minutos

    return NextResponse.json({ downloadUrl: signedUrl }, { status: 200 });
  } catch (err) {
    console.error('[API][DOWNLOAD] Error al generar URL de descarga:', err);
    return NextResponse.json({ error: 'Error al generar URL de descarga' }, { status: 500 });
  }
}
