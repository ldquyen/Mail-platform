import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { config, testMode } = await request.json();

    // Create transporter with timeout settings
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 15000,    // 15 seconds
      socketTimeout: 30000,      // 30 seconds
    });

    if (testMode) {
      // Just verify the connection
      await transporter.verify();
      return NextResponse.json({ 
        message: 'Cấu hình email hợp lệ! Kết nối thành công.' 
      });
    } else {
      // Send actual test email
      const testEmail = {
        from: config.from,
        to: config.auth.user, // Send to self
        subject: 'Test Email - Email Custom Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Test Email</h2>
            <p>Đây là email test từ Email Custom Platform.</p>
            <p>Nếu bạn nhận được email này, cấu hình email đã hoạt động chính xác!</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              Gửi từ: ${config.from}<br>
              Thời gian: ${new Date().toLocaleString('vi-VN')}
            </p>
          </div>
        `,
      };

      await transporter.sendMail(testEmail);
      
      return NextResponse.json({ 
        message: `Email test đã được gửi thành công đến ${config.auth.user}` 
      });
    }

  } catch (error: unknown) {
    console.error('Email test error:', error);
    
    let errorMessage = 'Có lỗi xảy ra khi test email configuration';
    let statusCode = 400;
    
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
        default:
          errorMessage = `Lỗi SMTP (${errorCode}): ${(error as { message?: string }).message || 'Unknown error'}`;
      }
    } else if (error instanceof Error) {
      if (error.message.includes('connection closed')) {
        errorMessage = 'Kết nối bị đóng: Kiểm tra lại cấu hình SMTP';
        statusCode = 503;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Timeout: Kết nối quá chậm';
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
