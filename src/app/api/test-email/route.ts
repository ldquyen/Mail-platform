import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { config, testMode } = await request.json();

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

  } catch (error: any) {
    console.error('Email test error:', error);
    
    let errorMessage = 'Có lỗi xảy ra khi test email configuration';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Lỗi xác thực: Kiểm tra lại username/password';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Lỗi kết nối: Kiểm tra lại host/port';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Timeout: Kiểm tra kết nối mạng';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
