import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import { decrypt, encrypt } from '../lib/crypto.js';
import dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient();
const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
const getReminderMinutes = (notifyBefore) => {
    if (typeof notifyBefore === 'number' && notifyBefore >= 0) {
        return notifyBefore * 24 * 60;
    }
    return 60;
};
const getAuthClient = async (userId) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.gcalToken)
        throw new Error('User not connected to Google Calendar');
    const tokens = JSON.parse(decrypt(user.gcalToken));
    oauth2Client.setCredentials(tokens);
    // Handle token refresh
    oauth2Client.removeAllListeners('tokens');
    oauth2Client.on('tokens', async (newTokens) => {
        const updatedTokens = { ...tokens, ...newTokens };
        await prisma.user.update({
            where: { id: userId },
            data: { gcalToken: encrypt(JSON.stringify(updatedTokens)) }
        });
    });
    return google.calendar({ version: 'v3', auth: oauth2Client });
};
export const calendarService = {
    getAuthUrl: () => {
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/calendar.events'],
            prompt: 'consent'
        });
    },
    getTokens: async (code) => {
        const { tokens } = await oauth2Client.getToken(code);
        return tokens;
    },
    createEvent: async (userId, assignment) => {
        const calendar = await getAuthClient(userId);
        const event = {
            summary: `[StudyFlow] ${assignment.title}`,
            description: assignment.description || '',
            start: { dateTime: assignment.deadline },
            end: { dateTime: new Date(new Date(assignment.deadline).getTime() + 60 * 60 * 1000).toISOString() }, // 1h duration
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: getReminderMinutes(assignment.notifyBefore) }
                ],
            },
        };
        const res = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });
        return res.data.id;
    },
    updateEvent: async (userId, gcalEventId, assignment) => {
        const calendar = await getAuthClient(userId);
        await calendar.events.patch({
            calendarId: 'primary',
            eventId: gcalEventId,
            requestBody: {
                summary: `[StudyFlow] ${assignment.title}`,
                description: assignment.description || '',
                start: { dateTime: assignment.deadline },
                end: { dateTime: new Date(new Date(assignment.deadline).getTime() + 60 * 60 * 1000).toISOString() },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: getReminderMinutes(assignment.notifyBefore) }
                    ],
                },
            },
        });
    },
    deleteEvent: async (userId, gcalEventId) => {
        const calendar = await getAuthClient(userId);
        await calendar.events.delete({
            calendarId: 'primary',
            eventId: gcalEventId,
        });
    }
};
