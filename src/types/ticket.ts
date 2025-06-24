// Ticket enviado desde el backend a React (DTO)
export type TicketType = {
  _id: string
  subject: string
  description: string
  name: string
  email: string
  status: 'open' | 'closed'
  createdAt: string
  updatedAt: string
}

// Mensaje de un ticket (sin updatedAt porque no se guarda en Mongo)
export type MessageType = {
  _id: string
  ticketId: string
  sender: 'admin' | 'client'
  message: string
  createdAt: string
}
