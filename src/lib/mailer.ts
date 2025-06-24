// src/lib/mailer.ts
import nodemailer from 'nodemailer'

export const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendNewPostEmail(to: string, post: { title: string; slug: string }) {
  const url = `${process.env.NEXTAUTH_URL}/blog/${post.slug}`
  await transport.sendMail({
    from: `"RivasDev" <${process.env.SMTP_FROM}>`,
    to,
    subject: `Nuevo post publicado: ${post.title}`,
    html: `
      <h1>${post.title}</h1>
      <p>¡Acabamos de publicar un nuevo artículo! Léelo aquí:</p>
      <a href="${url}">${url}</a>
    `,
  })
}
