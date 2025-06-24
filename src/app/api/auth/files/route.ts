// src/app/api/files/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import connectDB from '@/lib/db'
import FileAsset from '@/models/FileAsset.model'
import User from '@/models/User'
import Project from '@/models/Project.model'
import { Types } from 'mongoose'
import path from 'path'
import nodemailer from 'nodemailer'

export const config = {
  api: {
    bodyParser: false,
  },
}

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const sendNotificationEmail = async ({
  recipientEmail,
  recipientName,
  projectTitle,
  fileName,
  uploaderRole,
}: {
  recipientEmail: string
  recipientName: string
  projectTitle: string
  fileName: string
  uploaderRole: 'admin' | 'client'
}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const html = `
    <div style="font-family:Arial, sans-serif; background:#f3f4f6; padding:40px;">
      <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        <div style="padding:30px;">
          <h2 style="color:#2563eb;">Hola, ${recipientName} 👋</h2>
          <p style="font-size:16px; color:#333;">
            Se ha subido un nuevo archivo <strong>(${fileName})</strong> al proyecto <strong>${projectTitle}</strong>.
          </p>
          <p style="font-size:16px; color:#333;">
            Este archivo fue cargado por un ${uploaderRole === 'admin' ? 'administrador' : 'cliente'}.
          </p>
          <p style="font-size:14px; color:#666; margin-top:20px;">
            Puedes ver el archivo iniciando sesión en tu panel de cliente.
          </p>
          <div style="margin-top:30px; text-align:center;">
            <a href="${process.env.NEXTAUTH_URL}/login" style="background:#2563eb; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold;">
              Ir al panel
            </a>
          </div>
        </div>
        <div style="padding:20px; background:#f9fafb; text-align:center; font-size:13px; color:#777;">
          <p>¿Necesitas ayuda? <a href="mailto:info@rivasdev.com" style="color:#2563eb;">Contáctanos</a></p>
          <p style="margin-top:10px;">© ${new Date().getFullYear()} Rivas Technologies LLC</p>
          <p style="color:#bbb; font-size:12px;">Este es un mensaje automático. No respondas a este correo.</p>
        </div>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: recipientEmail,
    subject: '📎 Nuevo archivo subido a tu proyecto',
    html,
  })
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const formData = await req.formData()

    const rawUploader = formData.get('uploaderId')
    const uploaderId =
      typeof rawUploader === 'string'
        ? rawUploader
        : Array.isArray(rawUploader)
        ? rawUploader[0]
        : ''
    if (!uploaderId || !Types.ObjectId.isValid(uploaderId)) {
      return NextResponse.json({ error: 'Uploader inválido' }, { status: 400 })
    }

    const user = await User.findById(uploaderId).lean()
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const rawProject = formData.get('projectId')
    const projectId =
      typeof rawProject === 'string'
        ? rawProject
        : Array.isArray(rawProject)
        ? rawProject[0]
        : ''
    if (!projectId || !Types.ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: 'Proyecto inválido' }, { status: 400 })
    }

    const project = await Project.findById(projectId).lean()
    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }

    const rawFileType = formData.get('fileType')
    const fileType =
      typeof rawFileType === 'string'
        ? rawFileType
        : Array.isArray(rawFileType)
        ? rawFileType[0]
        : ''
    const tiposValidos = ['document', 'image', 'video', 'screenshot']
    if (!fileType || !tiposValidos.includes(fileType)) {
      return NextResponse.json({ error: 'fileType inválido' }, { status: 400 })
    }

    const rawIsAdmin = formData.get('isAdmin')
    const isAdminUpload = rawIsAdmin === 'true'

    const file = formData.get('file')
    if (!file || typeof file !== 'object' || !(file instanceof File)) {
      return NextResponse.json({ error: 'Archivo no proporcionado' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const originalName = file.name
    const extension = path.extname(originalName)
    const filename = `uploads/${uploaderId}/${Date.now()}${extension}`

    const uploadParams = {
      Bucket: process.env.S3_BUCKET || '',
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    }
    const command = new PutObjectCommand(uploadParams)
    await s3.send(command)

    const s3Url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`

    const nuevoArchivo = await FileAsset.create({
      originalName,
      url: s3Url,
      uploader: new Types.ObjectId(uploaderId),
      forProject: new Types.ObjectId(projectId),
      fileType,
      isAdminUpload,
      title: formData.get('title') || '',
    })

    if (user.email) {
      await sendNotificationEmail({
        recipientEmail: user.email,
        recipientName: user.name,
        projectTitle: project.title,
        fileName: originalName,
        uploaderRole: isAdminUpload ? 'admin' : 'client',
      })
    }

    const newId = (nuevoArchivo._id as any).toString()
    return NextResponse.json({ _id: newId, url: s3Url }, { status: 201 })
  } catch (err) {
    console.error('[API][POST] Error al subir archivo:', err)
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)

    const q = searchParams.get('q')?.trim()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const userId = searchParams.get('userId')
    const projectId = searchParams.get('projectId')

    const query: any = {}

    if (userId && Types.ObjectId.isValid(userId)) query['uploader'] = userId
    if (projectId && Types.ObjectId.isValid(projectId)) query['forProject'] = projectId

    if (q) {
      const qRegex = new RegExp(q, 'i')
      query['$or'] = [
        { _id: Types.ObjectId.isValid(q) ? new Types.ObjectId(q) : undefined },
        { originalName: qRegex },
        { title: qRegex },
        { fileType: qRegex },
      ].filter(Boolean)
    }

    const totalDocs = await FileAsset.countDocuments(query)
    const docs = await FileAsset.find(query)
      .populate('uploader', 'name lastname email role')
      .populate('forProject', 'title')
      .populate('forClient', 'name lastname')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    return NextResponse.json({
      docs,
      page,
      limit,
      totalPages: Math.ceil(totalDocs / limit),
      totalDocs,
    })
  } catch (err) {
    console.error('[API][GET] Error al obtener archivos:', err)
    return NextResponse.json({ error: 'Error al obtener archivos' }, { status: 500 })
  }
}
