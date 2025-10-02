import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { config, emails, subject, htmlContent, replyTo } = await request.json();

    // Validate required fields
    if (!config || !emails || !subject || !htmlContent) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    });

    // Verify connection first
    await transporter.verify();

    // Send emails
    const results = [];
    const errors = [];

    for (const email of emails) {
      try {
        const mailOptions = {
          from: config.from,
          to: email,
          replyTo: replyTo || config.replyTo || config.from,
          subject: subject,
          html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        results.push({
          email,
          success: true,
          messageId: info.messageId
        });

        // Add small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        errors.push({
          email,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalSent: results.length,
      totalErrors: errors.length,
      results,
      errors
    });

  } catch (error: any) {
    console.error('Send email error:', error);
    
    let errorMessage = 'Có lỗi xảy ra khi gửi email';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Lỗi xác thực: Kiểm tra lại email configuration';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Lỗi kết nối: Kiểm tra lại SMTP settings';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
