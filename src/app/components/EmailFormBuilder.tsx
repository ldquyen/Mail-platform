'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Input, 
  Button, 
  Chip, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  useDisclosure,
  Divider,
  Spacer
} from '@heroui/react';

interface EmailTemplate {
  id: string;
  name: string;
  html: string;
  parameters: string[];
}

export default function EmailFormBuilder() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .content {
            background: white;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        .otp-code {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            text-align: center;
            background: #f0f9ff;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Xác thực OTP</h1>
        </div>
        <div class="content">
            <p>Xin chào,</p>
            <p>Mã OTP của bạn là:</p>
            <div class="otp-code">{{numOTP}}</div>
            <p>Mã này sẽ hết hạn vào: <strong>{{expireAt}}</strong></p>
            <p>Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        </div>
        <div class="footer">
            <p>Trân trọng,<br>Đội ngũ hỗ trợ</p>
        </div>
    </div>
</body>
</html>`);

  const [templateName, setTemplateName] = useState('');
  const [parameters, setParameters] = useState<string[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<EmailTemplate[]>([]);

  // Extract parameters from HTML code
  useEffect(() => {
    const paramRegex = /\{\{([^}]+)\}\}/g;
    const matches = htmlCode.match(paramRegex);
    if (matches) {
      const extractedParams = matches.map(match => match.replace(/[{}]/g, ''));
      setParameters([...new Set(extractedParams)]);
    } else {
      setParameters([]);
    }
  }, [htmlCode]);

  // Load saved templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('emailTemplates');
    if (saved) {
      setSavedTemplates(JSON.parse(saved));
    }
  }, []);

  const saveTemplate = () => {
    if (!templateName.trim()) {
      alert('Vui lòng nhập tên template');
      return;
    }

    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name: templateName,
      html: htmlCode,
      parameters: parameters
    };

    const updatedTemplates = [...savedTemplates, newTemplate];
    setSavedTemplates(updatedTemplates);
    localStorage.setItem('emailTemplates', JSON.stringify(updatedTemplates));
    
    alert('Template đã được lưu thành công!');
    setTemplateName('');
  };

  const loadTemplate = (template: EmailTemplate) => {
    setHtmlCode(template.html);
    setTemplateName(template.name);
  };

  const deleteTemplate = (id: string) => {
    const updatedTemplates = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updatedTemplates);
    localStorage.setItem('emailTemplates', JSON.stringify(updatedTemplates));
  };

  // Replace parameters with sample data for preview
  const getPreviewHtml = () => {
    let previewHtml = htmlCode;
    parameters.forEach(param => {
      const sampleValue = param === 'numOTP' ? '123456' : 
                         param === 'expireAt' ? '15 phút' :
                         `Sample ${param}`;
      previewHtml = previewHtml.replace(new RegExp(`\\{\\{${param}\\}\\}`, 'g'), sampleValue);
    });
    return previewHtml;
  };

  return (
    <div className="h-full">
      {/* Template Management - Compact Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">📧</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800">Template Management</h3>
            <p className="text-xs text-gray-600">Tạo và quản lý các template email của bạn</p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Tên template..."
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-48"
              variant="bordered"
              size="sm"
              startContent={<span className="text-gray-400">📝</span>}
            />
            <Button
              onClick={saveTemplate}
              color="primary"
              variant="solid"
              size="sm"
              className="px-4"
              startContent={<span>💾</span>}
            >
              Lưu
            </Button>
          </div>
        </div>

        {/* Saved Templates - Compact */}
        {savedTemplates.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Templates:</span>
            <div className="flex flex-wrap gap-2">
              {savedTemplates.map(template => (
                <div key={template.id} className="flex items-center gap-1 bg-white/80 rounded-lg px-2 py-1 border">
                  <button
                    onClick={() => loadTemplate(template)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    {template.name}
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="text-red-500 hover:text-red-700 text-xs ml-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Editor Layout - 2 Columns */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* Left Column - HTML Editor */}
        <div className="flex-1 border-r border-gray-200">
          <div className="h-full flex flex-col">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 p-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">💻</span>
                </div>
                <h3 className="text-sm font-bold text-gray-800">HTML Code Editor</h3>
                <p className="text-xs text-gray-600">Chỉnh sửa mã HTML của template</p>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <Editor
                height="100%"
                defaultLanguage="html"
                value={htmlCode}
                onChange={(value) => setHtmlCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                  theme: 'vs-light',
                  lineNumbers: 'on',
                  folding: true,
                  renderLineHighlight: 'gutter',
                }}
              />
            </div>
            
            {/* Parameters Display - Bottom */}
            {parameters.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">🔧</span>
                  <h4 className="text-sm font-semibold text-gray-800">Tham số được phát hiện</h4>
                  <Chip color="secondary" variant="flat" size="sm">
                    {parameters.length} tham số
                  </Chip>
                </div>
                <div className="flex flex-wrap gap-1">
                  {parameters.map(param => (
                    <Chip key={param} color="primary" variant="flat" size="sm" className="font-mono text-xs">
                      {`{{${param}}}`}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div className="flex-1">
          <div className="h-full flex flex-col">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200 p-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">👁️</span>
                </div>
                <h3 className="text-sm font-bold text-gray-800">Live Preview</h3>
                <p className="text-xs text-gray-600">Xem trước template với dữ liệu mẫu</p>
              </div>
            </div>
            
            <div className="flex-1 bg-white">
              <iframe
                srcDoc={getPreviewHtml()}
                className="w-full h-full border-0"
                title="Email Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}