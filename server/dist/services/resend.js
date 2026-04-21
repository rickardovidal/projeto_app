import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);
export const sendEmailNotification = async (to, subject, body) => {
    try {
        await resend.emails.send({
            from: 'StudyFlow <notifications@studyflow.com>',
            to: [to],
            subject: subject,
            html: `<div>${body}</div>`,
        });
        return true;
    }
    catch (error) {
        console.error('Error sending email notification:', error);
        return false;
    }
};
export default resend;
