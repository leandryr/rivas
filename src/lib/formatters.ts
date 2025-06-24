import { ITicket } from '@/models/Ticket'
import { ITicketMessage } from '@/models/TicketMessage'

export function formatTicket(ticket: ITicket) {
  return {
    _id: ticket._id.toString(),
    subject: ticket.subject,
    description: ticket.description,
    status: ticket.status,
    name: ticket.name,
    email: ticket.email,
    createdAt: new Date(ticket.createdAt).toISOString(),
    updatedAt: new Date(ticket.updatedAt).toISOString(),
  }
}

export function formatMessage(msg: ITicketMessage) {
  return {
    _id: msg._id.toString(),
    ticketId: msg.ticket.toString(),
    sender: msg.sender,
    message: msg.message,
    createdAt: new Date(msg.createdAt).toISOString(),
  }
}
