# 📧 Email Custom Platform

A professional email template builder and sender platform built with Next.js and HeroUI. Create custom HTML email templates with dynamic parameters and send them to multiple recipients easily.

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)
![HeroUI](https://img.shields.io/badge/HeroUI-Latest-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)

## ✨ Key Features

### 🎨 **Email Builder**
- **HTML Editor**: Monaco Editor with syntax highlighting
- **Live Preview**: Real-time preview with sample data
- **Template Management**: Save, load, and delete email templates
- **Dynamic Parameters**: Auto-detect and manage template variables

### 🚀 **Email Sender**
- **Bulk Sending**: Send emails to multiple recipients
- **Email Validation**: Automatic email format validation
- **Template Selection**: Choose from saved templates
- **Parameter Input**: Dynamic form for template variables
- **Auto Deduplication**: Remove duplicate emails when parsing

### ⚙️ **Email Configuration**
- **SMTP Settings**: Configure email server settings
- **Provider Presets**: Quick setup for Gmail, Outlook, Yahoo
- **Test Mode**: Verify configuration without sending emails

### 🌙 **Theme & Language**
- **Dark/Light Mode**: Full dark and light mode support
- **Bilingual**: Vietnamese and English
- **Smooth Transitions**: Animations when switching themes/languages

## 🚀 Quick Setup

### Requirements
- Node.js 18+
- npm or yarn
- Email account with SMTP access

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd mailplatform
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### 1. **Email Builder** - Create Templates

1. Go to **Email Builder** tab
2. Write HTML code in the left editor
3. Use `{{variableName}}` for dynamic content
4. Preview real-time on the right
5. Save template with descriptive name

**Example template:**
```html
<!DOCTYPE html>
<html>
<body>
    <div style="max-width: 600px; margin: 0 auto;">
        <h1>OTP Verification</h1>
        <p>Your OTP code is:</p>
        <div style="font-size: 24px; font-weight: bold; color: #2563eb;">
            {{numOTP}}
        </div>
        <p>Expires at: {{expireAt}}</p>
    </div>
</body>
</html>
```

### 2. **Email Config** - Configure Email

1. Go to **Email Config** tab
2. Choose email provider or "Custom"
3. Enter SMTP information:
   - **Host**: smtp.gmail.com (for Gmail)
   - **Port**: 587
   - **Username**: your-email@gmail.com
   - **Password**: your app password
4. Test configuration
5. Save settings

**Gmail Setup:**
- Enable 2-Factor Authentication
- Generate App Password: Google Account → Security → App passwords
- Use App Password instead of regular password

### 3. **Email Sender** - Send Emails

1. Go to **Email Sender** tab
2. **Step 1**: Enter email list (comma-separated)
3. **Step 2**: Select saved template
4. **Step 3**: Fill template parameter values
5. Click **Send Email**

**Special Features:**
- **Auto Deduplication**: Duplicate emails are automatically removed
- **Use Value**: Choose which parameter uses values from email list
- **Validation**: Invalid emails are flagged

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.4, React 19, TypeScript
- **UI**: HeroUI (NextUI)
- **Styling**: Tailwind CSS 4.0
- **Email**: Nodemailer
- **Editor**: Monaco Editor
- **Storage**: LocalStorage (client-side)
- **State**: React Context API
- **i18n**: Custom translation system

## 🔒 Security

- **Local Storage**: Email credentials stored only in browser
- **No Server Storage**: Credentials never sent to server
- **App Passwords**: Recommended for all providers
- **HTTPS**: Use secure connections in production

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy with default settings
4. App available at `https://your-app.vercel.app`

### Other Platforms
App can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Create Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create new issue with detailed description
3. Include error messages and steps to reproduce

---

**Made by LDQ**