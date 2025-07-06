// types/ticket.ts

export interface TicketType {
  _id: string
  subject: string
  description: string
  status: 'open' | 'closed'
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface MessageType {
  _id: string
  ticketId: string
  sender: 'admin' | 'client'
  message: string
  createdAt: string
}
