import { google } from 'googleapis'
import User from '@models/User'
import Meeting from '@/models/Meeting'

export async function createMeetEvent(meetingId: string) {
  const meeting = await Meeting.findById(meetingId)
    .populate('client', 'email name')
    .populate('project', 'title')

  if (!meeting) throw new Error('Meeting not found')

  const admin = await User.findOne({ role: 'admin' })
  if (!admin?.google?.accessToken) throw new Error('Admin not connected to Google')

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  oauth2Client.setCredentials({
    access_token: admin.google.accessToken,
    refresh_token: admin.google.refreshToken,
  })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const event = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary: `Reunión con ${meeting.client.name} (${meeting.project.title})`,
      description: meeting.topic,
      start: { dateTime: meeting.date },
      end: {
        dateTime: new Date(new Date(meeting.date).getTime() + 30 * 60 * 1000).toISOString(),
      },
      attendees: [{ email: meeting.client.email }],
      conferenceData: {
        createRequest: { requestId: `meet-${meeting._id}` },
      },
    },
  })

  meeting.meetLink = event.data.hangoutLink || ''
  meeting.calendarEventId = event.data.id || ''
  await meeting.save()
}
