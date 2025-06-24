import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function enviarWhatsApp(nombre: string, total: number) {
  return client.messages.create({
    from: `whatsapp:${process.env.TWILIO_PHONE_FROM}`,
    to: `whatsapp:${process.env.TWILIO_PHONE_TO}`,
    body: `¡Hola ${nombre}! Tu cotización fue recibida. Monto estimado: $${total}. Rivas Technologies LLC.`,
  })
}

export async function enviarSMS(nombre: string, total: number) {
  return client.messages.create({
    from: process.env.TWILIO_PHONE_FROM!,
    to: process.env.TWILIO_PHONE_TO!,
    body: `¡Hola ${nombre}! Cotización RivasDev recibida: $${total}`,
  })
}
