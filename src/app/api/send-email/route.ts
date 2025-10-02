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

    // Create transporter with timeout and connection settings
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000,    // 30 seconds
      socketTimeout: 60000,      // 60 seconds
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 20000,          // 20 seconds
      rateLimit: 5,              // max 5 emails per rateDelta
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

      } catch (error: unknown) {
        errors.push({
          email,
          error: error instanceof Error ? error.message : 'Unknown error'
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

  } catch (error: unknown) {
    console.error('Send email error:', error);
    
    let errorMessage = 'Có lỗi xảy ra khi gửi email';
    let statusCode = 500;
    
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = error.code as string;
      
      switch (errorCode) {
        case 'EAUTH':
          errorMessage = 'Lỗi xác thực: Kiểm tra lại Username và Password';
          statusCode = 401;
          break;
        case 'ECONNECTION':
          errorMessage = 'Lỗi kết nối: Kiểm tra lại Host và Port SMTP';
          statusCode = 503;
          break;
        case 'ETIMEDOUT':
          errorMessage = 'Timeout: Kết nối quá chậm, kiểm tra mạng';
          statusCode = 408;
          break;
        case 'ENOTFOUND':
          errorMessage = 'Không tìm thấy server: Kiểm tra lại Host SMTP';
          statusCode = 404;
          break;
        case 'ECONNRESET':
          errorMessage = 'Kết nối bị đóng: Server từ chối kết nối';
          statusCode = 503;
          break;
        case 'EHOSTUNREACH':
          errorMessage = 'Không thể kết nối đến server: Kiểm tra Host';
          statusCode = 503;
          break;
        default:
          errorMessage = `Lỗi SMTP (${errorCode}): ${(error as { message?: string }).message || 'Unknown error'}`;
      }
    } else if (error instanceof Error) {
      if (error.message.includes('connection closed')) {
        errorMessage = 'Kết nối bị đóng: Kiểm tra lại cấu hình SMTP và thử lại';
        statusCode = 503;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Timeout: Kết nối quá chậm, thử lại sau';
        statusCode = 408;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
