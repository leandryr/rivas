import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { nombre, email, mensaje } = body

  // Validación simple
  if (!nombre || !email || !mensaje) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }

  // Aquí puedes guardar en DB o enviar email con Resend/Nodemailer
  console.log('📩 Nuevo contacto recibido:', { nombre, email, mensaje })

  return NextResponse.json({ ok: true })
}
