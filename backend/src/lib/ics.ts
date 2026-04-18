import { randomUUID } from 'crypto';

interface ICSParams {
  summary: string;
  description: string;
  location: string;
  startsAt: Date;
  endsAt: Date;
  organizerEmail: string;
  organizerName: string;
  attendeeEmail: string;
  attendeeName: string;
}

function fmtDate(d: Date): string {
  return d.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
}

export function buildICS(p: ICSParams): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chop Barbers//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${randomUUID()}@chopbarbers.com`,
    `DTSTART:${fmtDate(p.startsAt)}`,
    `DTEND:${fmtDate(p.endsAt)}`,
    `SUMMARY:${p.summary}`,
    `DESCRIPTION:${p.description}`,
    `LOCATION:${p.location}`,
    `ORGANIZER;CN=${p.organizerName}:mailto:${p.organizerEmail}`,
    `ATTENDEE;CN=${p.attendeeName};RSVP=TRUE:mailto:${p.attendeeEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    `DTSTAMP:${fmtDate(new Date())}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
