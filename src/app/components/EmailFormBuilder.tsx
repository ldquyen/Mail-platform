'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Input, 
  Button, 
  Chip
} from '@heroui/react';
import { useApp } from '../contexts/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { useToast } from '../hooks/useToast';

interface EmailTemplate {
  id: string;
  name: string;
  html: string;
  parameters: string[];
}

export default function EmailFormBuilder() {
  const { theme } = useApp();
  const t = useTranslation();
  const { showSuccess, showError } = useToast();
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
  const [parameterValues, setParameterValues] = useState<Record<string, string>>({});

  // Extract parameters from HTML code
  useEffect(() => {
    const paramRegex = /\{\{([^}]+)\}\}/g;
    const matches = htmlCode.match(paramRegex);
    if (matches) {
      const extractedParams = matches.map(match => match.replace(/[{}]/g, ''));
      setParameters([...new Set(extractedParams)]);
      
      // Reset parameter values when parameters change
      const newValues: Record<string, string> = {};
      [...new Set(extractedParams)].forEach(param => {
        newValues[param] = parameterValues[param] || '';
      });
      setParameterValues(newValues);
    } else {
      setParameters([]);
      setParameterValues({});
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
      showError(t.common.error + ': ' + t.emailBuilder.templateName);
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
    
    showSuccess(t.common.success + ': ' + t.emailBuilder.saveTemplate);
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

  // Update parameter value
  const updateParameterValue = (param: string, value: string) => {
    setParameterValues(prev => ({
      ...prev,
      [param]: value
    }));
  };

  // Replace parameters with actual values for preview
  const getPreviewHtml = () => {
    let previewHtml = htmlCode;
    parameters.forEach(param => {
      const value = parameterValues[param] || `Sample ${param}`;
      previewHtml = previewHtml.replace(new RegExp(`\\{\\{${param}\\}\\}`, 'g'), value);
    });
    return previewHtml;
  };

  return (
    <div className="h-full">
      {/* Template Management - Compact Header */}
      <div className={`border-b transition-colors duration-300 p-4 ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-gray-800 to-blue-800 border-gray-700' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">📧</span>
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>
              {t.emailBuilder.title}
            </h3>
            <p className={`text-xs transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {t.emailBuilder.subtitle}
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={t.emailBuilder.templateName}
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-48"
              variant="bordered"
              size="sm"
              startContent={<span className="text-gray-400">📝</span>}
              classNames={{
                input: theme === 'dark' ? "text-sm text-white" : "text-sm",
                inputWrapper: theme === 'dark'
                  ? "border-gray-600 hover:border-blue-400 focus-within:border-blue-500 bg-gray-800/50"
                  : "border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
              }}
            />
            <Button
              onClick={saveTemplate}
              color="primary"
              variant="solid"
              size="sm"
              className="px-4"
              startContent={<span>💾</span>}
            >
              {t.common.save}
            </Button>
          </div>
        </div>

        {/* Saved Templates - Compact */}
        {savedTemplates.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-sm font-medium transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t.emailBuilder.templates}:
            </span>
            <div className="flex flex-wrap gap-2">
              {savedTemplates.map(template => (
                <div key={template.id} className={`flex items-center gap-1 rounded-lg px-2 py-1 border transition-colors duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-700/80 border-gray-600' 
                    : 'bg-white/80 border-gray-300'
                }`}>
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
        <div className={`flex-1 border-r transition-colors duration-300 ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="h-full flex flex-col">
            <div className={`border-b transition-colors duration-300 p-3 ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-gray-800 to-blue-800 border-gray-700' 
                : 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">💻</span>
                </div>
                <h3 className={`text-sm font-bold transition-colors duration-300 ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  {t.emailBuilder.htmlEditor}
                </h3>
                <p className={`text-xs transition-colors duration-300 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {t.emailBuilder.htmlEditorSubtitle}
                </p>
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
                  theme: theme === 'dark' ? 'vs-dark' : 'vs-light',
                  lineNumbers: 'on',
                  folding: true,
                  renderLineHighlight: 'gutter',
                }}
              />
            </div>
            
            {/* Parameters Display and Input - Bottom */}
            {parameters.length > 0 && (
              <div className={`border-t transition-colors duration-300 p-3 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-purple-900 to-pink-900 border-purple-700' 
                  : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">🔧</span>
                  <h4 className={`text-sm font-semibold transition-colors duration-300 ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    {t.emailBuilder.parametersDetected}
                  </h4>
                  <Chip color="secondary" variant="flat" size="sm">
                    {parameters.length} {t.emailBuilder.parameters}
                  </Chip>
                </div>
                
                {/* Parameter Chips */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {parameters.map(param => (
                    <Chip key={param} color="primary" variant="flat" size="sm" className="font-mono text-xs">
                      {`{{${param}}}`}
                    </Chip>
                  ))}
                </div>

                {/* Parameter Input Fields */}
                <div className="space-y-2">
                  <h5 className={`text-xs font-medium transition-colors duration-300 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {t.emailBuilder.enterParameterValues}:
                  </h5>
                  <div className="grid grid-cols-1 gap-2">
                    {parameters.map(param => (
                      <Input
                        key={param}
                        label={param}
                        placeholder={`Enter value for ${param}`}
                        value={parameterValues[param] || ''}
                        onChange={(e) => updateParameterValue(param, e.target.value)}
                        variant="bordered"
                        size="sm"
                        classNames={{
                          input: theme === 'dark' ? "text-xs text-white" : "text-xs",
                          inputWrapper: theme === 'dark'
                            ? "border-gray-600 hover:border-purple-400 focus-within:border-purple-500 bg-gray-800/50"
                            : "border-gray-300 hover:border-purple-400 focus-within:border-purple-500"
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div className="flex-1">
          <div className="h-full flex flex-col">
            <div className={`border-b transition-colors duration-300 p-3 ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-orange-900 to-red-900 border-gray-700' 
                : 'bg-gradient-to-r from-orange-50 to-red-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">👁️</span>
                </div>
                <h3 className={`text-sm font-bold transition-colors duration-300 ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  {t.emailBuilder.livePreview}
                </h3>
                <p className={`text-xs transition-colors duration-300 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {t.emailBuilder.livePreviewSubtitle}
                </p>
              </div>
            </div>
            
            <div className={`flex-1 transition-colors duration-300 ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}>
              <iframe
                srcDoc={getPreviewHtml()}
                className="w-full h-full border-0"
                title={t.emailBuilder.emailPreview}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}