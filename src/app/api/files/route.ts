import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import connectDB from '@/lib/db';
import FileAsset from '@/models/FileAsset.model';
import User from '@/models/User';
import Project from '@/models/Project.model';
import Notification from '@/models/Notification';
import { Types } from 'mongoose';
import path from 'path';

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
    const projectId = url.searchParams.get('projectId');
    const userId = url.searchParams.get('userId');
    const q = url.searchParams.get('q')?.trim().toLowerCase() || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (projectId && Types.ObjectId.isValid(projectId)) {
      filter.forProject = new Types.ObjectId(projectId);
    }

    if (userId && Types.ObjectId.isValid(userId)) {
      filter.$or = [
        { uploader: new Types.ObjectId(userId) },
        { forClient: new Types.ObjectId(userId) },
      ];
    }

    if (q) {
      filter.originalName = { $regex: new RegExp(q, 'i') };
    }

    const total = await FileAsset.countDocuments(filter);
    const archivos = await FileAsset.find(filter)
      .populate('uploader', 'name lastname email role')
      .populate('forProject', 'title')
      .populate('forClient', 'name lastname')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const salida = archivos.map((d: any) => ({
      _id: d._id.toString(),
      originalName: d.originalName,
      title: d.title || null,
      url: d.url,
      fileType: d.fileType,
      isAdminUpload: d.isAdminUpload,
      uploader: d.uploader
        ? {
            _id: d.uploader._id.toString(),
            name: d.uploader.name,
            lastname: d.uploader.lastname || '',
            email: d.uploader.email,
            role: d.uploader.role,
          }
        : null,
      forClient: d.forClient
        ? {
            _id: d.forClient._id.toString(),
            name: d.forClient.name,
            lastname: d.forClient.lastname || '',
          }
        : null,
      forProject: d.forProject
        ? {
            _id: d.forProject._id.toString(),
            title: d.forProject.title,
          }
        : null,
      createdAt: d.createdAt.toISOString(),
    }));

    return NextResponse.json(
      {
        docs: salida,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[API][GET] Error al listar archivos:', err);
    return NextResponse.json({ error: 'Error al listar archivos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log('[POST] Iniciando carga de archivo');
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error('[POST] Usuario no autenticado');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[POST] Usuario autenticado:', session.user.id);

  await connectDB();
  console.log('[POST] Conectado a la base de datos');

  const formData = await req.formData();
  const rawUploader = formData.get('uploaderId');
  const rawProject = formData.get('projectId');
  const rawFileType = formData.get('fileType');
  const rawIsAdmin = formData.get('isAdmin');
  const rawTitle = formData.get('title');
  const rawForClient = formData.get('forClientId');
  const file = formData.get('file');

  console.log('[POST] FormData:', {
    rawUploader,
    rawProject,
    rawFileType,
    rawIsAdmin,
    rawTitle,
    rawForClient,
    file: file instanceof File ? file.name : 'No válido',
  });

  const uploaderId = typeof rawUploader === 'string' ? rawUploader : '';
  const projectId = typeof rawProject === 'string' ? rawProject : '';
  const fileType = typeof rawFileType === 'string' ? rawFileType : '';
  const isAdminUpload = rawIsAdmin === 'true';
  const title = typeof rawTitle === 'string' && rawTitle.trim() ? rawTitle.trim() : undefined;
  const forClientId =
    typeof rawForClient === 'string' && Types.ObjectId.isValid(rawForClient) ? rawForClient : null;

  console.log('[POST] Datos procesados:', {
    uploaderId,
    projectId,
    fileType,
    isAdminUpload,
    title,
    forClientId,
  });

  if (!Types.ObjectId.isValid(uploaderId)) {
    console.error('[POST] uploaderId inválido:', uploaderId);
    return NextResponse.json({ error: 'Uploader inválido' }, { status: 400 });
  }

  if (!Types.ObjectId.isValid(projectId)) {
    console.error('[POST] projectId inválido:', projectId);
    return NextResponse.json({ error: 'Proyecto inválido' }, { status: 400 });
  }

  const validTypes = ['document', 'image', 'video', 'screenshot'];
  if (!validTypes.includes(fileType)) {
    console.error('[POST] fileType inválido:', fileType);
    return NextResponse.json({ error: 'fileType inválido' }, { status: 400 });
  }

  if (!file || !(file instanceof File)) {
    console.error('[POST] Archivo no proporcionado o inválido');
    return NextResponse.json({ error: 'Archivo no proporcionado' }, { status: 400 });
  }

  const userExists = await User.exists({ _id: uploaderId });
  if (!userExists) {
    console.error('[POST] Usuario no encontrado:', uploaderId);
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  const projectExists = await Project.exists({ _id: projectId });
  if (!projectExists) {
    console.error('[POST] Proyecto no encontrado:', projectId);
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  if (isAdminUpload && !forClientId) {
    console.error('[POST] Falta forClientId para admin');
    return NextResponse.json({ error: 'Falta forClientId para admin' }, { status: 400 });
  }

  if (isAdminUpload && forClientId) {
    const clientExists = await User.exists({ _id: forClientId, role: 'client' });
    if (!clientExists) {
      console.error('[POST] Cliente inválido:', forClientId);
      return NextResponse.json({ error: 'Cliente inválido' }, { status: 404 });
    }
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const extension = path.extname(file.name);
  const key = `uploads/${uploaderId}/${Date.now()}${extension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || '',
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  const s3Url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  const nuevo = await FileAsset.create({
    originalName: file.name,
    title,
    url: s3Url,
    uploader: new Types.ObjectId(uploaderId),
    forClient: isAdminUpload ? new Types.ObjectId(forClientId!) : undefined,
    forProject: new Types.ObjectId(projectId),
    fileType,
    isAdminUpload,
  });

  const newId = (nuevo._id as any).toString();
  const shortId = newId.slice(-4);
  const actor = isAdminUpload ? 'Admin' : 'Cliente';
  const message = `${actor} subió “${file.name}” (#${shortId})`;

  if (isAdminUpload) {
    await Notification.create({
      userId: forClientId,
      message,
      link: '/client/files',
      read: false,
    });
  } else {
    const admins = await User.find({ role: 'admin' }).select('_id').lean<{ _id: Types.ObjectId }[]>();
    const toInsert = admins.map((a) => ({
      userId: a._id.toString(),
      message,
      link: '/admin/files',
      read: false,
    }));
    await Notification.insertMany(toInsert);
  }

  console.log('[POST] Archivo subido y registrado con ID:', newId);

  return NextResponse.json({ _id: newId, url: s3Url }, { status: 201 });
}
