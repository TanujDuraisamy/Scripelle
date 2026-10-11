import nodemailer from 'nodemailer';

export async function createTransporter(): Promise<ReturnType<typeof nodemailer.createTransport>> {
    // Validate required environment variables
    const requiredEnvVars = {
        EMAIL_USER: process.env.EMAIL_USER,
        EMAIL_PASS: process.env.EMAIL_PASS,
    };

    const missingVars = Object.entries(requiredEnvVars)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}\n` +
            'Please set these in your .env file:\n' +
            '- EMAIL_USER: Your Gmail address\n' +
            '- EMAIL_PASS: Your Gmail app password\n' +
            '- EMAIL_FROM (optional): Custom "from" name/email'
        );
    }

    // Create transporter for Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // This should be an App Password, not your regular password
        },
        tls: {
            rejectUnauthorized: true,
        },
    });

    // Verify the connection
    try {
        await transporter.verify();
        console.log('✅ Email service is ready to send messages');
        return transporter;
    } catch (error) {
        console.error('❌ Email service verification failed:', error);
        throw new Error('Failed to configure email service. Please check your email credentials.');
    }
}

export default createTransporter;
