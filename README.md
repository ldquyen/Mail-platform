# 📧 Email Custom Platform

A modern, professional email template builder and sender platform built with Next.js and HeroUI. Create custom HTML email templates with dynamic parameters and send them to multiple recipients with ease.

![Email Custom Platform](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)
![HeroUI](https://img.shields.io/badge/HeroUI-Latest-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎨 Email Builder
- **Visual HTML Editor**: Monaco Editor with syntax highlighting
- **Live Preview**: Real-time preview with sample data
- **Template Management**: Save, load, and delete email templates
- **Dynamic Parameters**: Auto-detect and manage template variables
- **Responsive Design**: Clean 2-column layout for optimal workflow

### 🚀 Email Sender
- **Bulk Email Sending**: Send emails to multiple recipients
- **Email Validation**: Automatic email format validation
- **Template Selection**: Choose from saved templates
- **Parameter Input**: Dynamic form for template variables
- **Send Status**: Real-time feedback on email delivery

### ⚙️ Email Configuration
- **SMTP Settings**: Configure email server settings
- **Provider Presets**: Quick setup for Gmail, Outlook, Yahoo
- **Test Mode**: Verify configuration without sending emails
- **Security**: Local storage for credentials (client-side only)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Email account with SMTP access

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mailplatform
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### 1. Email Builder

#### Creating Templates
1. Navigate to the **Email Builder** tab
2. Write your HTML code in the left editor
3. Use `{{parameterName}}` syntax for dynamic content
4. Preview your template in real-time on the right
5. Save your template with a descriptive name

#### Example Template
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { max-width: 600px; margin: 0 auto; }
        .otp-code { font-size: 24px; font-weight: bold; color: #2563eb; }
    </style>
</head>
<body>
    <div class="container">
        <h1>OTP Verification</h1>
        <p>Your OTP code is:</p>
        <div class="otp-code">{{numOTP}}</div>
        <p>Expires at: {{expireAt}}</p>
    </div>
</body>
</html>
```

### 2. Email Configuration

#### Setting Up SMTP
1. Go to **Email Config** tab
2. Choose your email provider or select "Custom"
3. Enter your SMTP credentials:
   - **Host**: smtp.gmail.com (for Gmail)
   - **Port**: 587
   - **Username**: your-email@gmail.com
   - **Password**: your-app-password
4. Test your configuration
5. Save settings

#### Provider-Specific Setup

**Gmail:**
- Enable 2-Factor Authentication
- Generate App Password: Google Account → Security → App passwords
- Use App Password instead of regular password

**Outlook/Hotmail:**
- Enable 2-Factor Authentication
- Create App Password in Microsoft Account
- Use App Password for authentication

**Yahoo:**
- Enable 2-Factor Authentication
- Create App Password in Yahoo Account Security
- Use App Password instead of regular password

### 3. Email Sender

#### Sending Emails
1. Switch to **Email Sender** tab
2. **Step 1**: Enter recipient emails (comma-separated)
3. **Step 2**: Select a saved template
4. **Step 3**: Fill in template parameters
5. Click **Send Email** to deliver

#### Email List Management
- Paste multiple emails separated by commas, spaces, or new lines
- Invalid emails are automatically flagged
- Remove individual emails from the list
- View validation status for each email

## 🛠️ Technical Details

### Tech Stack
- **Frontend**: Next.js 15.5.4, React 19, TypeScript
- **UI Library**: HeroUI (NextUI)
- **Styling**: Tailwind CSS 4.0
- **Email**: Nodemailer
- **Editor**: Monaco Editor
- **Storage**: LocalStorage (client-side)

### Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── send-email/     # Email sending API
│   │   └── test-email/     # Email testing API
│   ├── components/
│   │   ├── EmailFormBuilder.tsx
│   │   ├── EmailSender.tsx
│   │   ├── EmailConfig.tsx
│   │   └── Providers.tsx
│   ├── layout.tsx
│   └── page.tsx
```

### API Endpoints

#### POST `/api/send-email`
Send emails to multiple recipients
```json
{
  "config": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "your-email@gmail.com",
      "pass": "your-app-password"
    },
    "from": "sender@example.com"
  },
  "emails": ["recipient1@example.com", "recipient2@example.com"],
  "subject": "Email Subject",
  "htmlContent": "<html>...</html>"
}
```

#### POST `/api/test-email`
Test email configuration
```json
{
  "config": { /* SMTP config */ },
  "testMode": true
}
```

## 🔒 Security

- **Client-side Storage**: Email credentials stored locally in browser
- **No Server Storage**: Credentials never sent to server
- **App Passwords**: Recommended for all email providers
- **HTTPS**: Use secure connections in production

## 🎨 Customization

### Styling
The platform uses Tailwind CSS for styling. Key design elements:
- **Gradient Backgrounds**: Multi-layer gradients for visual appeal
- **Glassmorphism**: Backdrop blur effects for modern look
- **Responsive Design**: Mobile-first approach
- **Color Coding**: Different colors for different functions

### Template Variables
Use `{{variableName}}` syntax in your HTML templates:
- `{{numOTP}}` - OTP code
- `{{expireAt}}` - Expiration time
- `{{userName}}` - User name
- `{{companyName}}` - Company name

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with default settings
4. Your app will be available at `https://your-app.vercel.app`

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [HeroUI](https://heroui.com/) - UI component library
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Nodemailer](https://nodemailer.com/) - Email sending library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

**Made with ❤️ for professional email management**