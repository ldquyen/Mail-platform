'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Input, 
  Button, 
  Switch,
  Divider,
  Select,
  SelectItem
} from '@heroui/react';
import { useApp } from '../contexts/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { useToast } from '../hooks/useToast';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  replyTo?: string;
}

const defaultConfig: EmailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: '',
    pass: ''
  },
  from: '',
  replyTo: ''
};


export default function EmailConfig() {
  const { theme } = useApp();
  const t = useTranslation();
  const { showSuccess, showWarning } = useToast();
  const [config, setConfig] = useState<EmailConfig>(defaultConfig);

  // Load config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('emailConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  // Save config to localStorage
  const saveConfig = () => {
    localStorage.setItem('emailConfig', JSON.stringify(config));
    showSuccess(t.emailConfig.configSaved);
  };

  // Export config to file
  const exportConfig = () => {
    const configData = {
      ...config,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Cấu hình email đã được xuất thành file!');
  };

  // Import config from file
  const importConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedConfig = JSON.parse(e.target?.result as string);
            // Validate imported config
            if (importedConfig.host && importedConfig.port && importedConfig.auth) {
              setConfig(importedConfig);
              localStorage.setItem('emailConfig', JSON.stringify(importedConfig));
              showSuccess('Cấu hình email đã được nhập thành công!');
            } else {
              showWarning('File cấu hình không hợp lệ!');
            }
          } catch (error) {
            showWarning('Không thể đọc file cấu hình!');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };


  // Clear email configuration
  const clearConfig = () => {
    setConfig(defaultConfig);
    localStorage.removeItem('emailConfig');
    showSuccess('Email configuration cleared!');
  };

  // Update config field
  const updateConfig = (field: string, value: string | number | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setConfig(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof EmailConfig] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      setConfig(prev => {
        const newConfig = {
          ...prev,
          [field]: value
        };
        
        // Auto-set secure flag based on port
        if (field === 'port') {
          newConfig.secure = value === 465; // Port 465 = secure: true, Port 587 = secure: false
        }
        
        return newConfig;
      });
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* SMTP Configuration */}
      <Card className={`shadow-lg border-0 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🔧</span>
            </div>
            <div>
              <h3 className={`text-lg font-bold transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
              }`}>
                {t.emailConfig.smtpTitle}
              </h3>
              <p className={`text-xs transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {t.emailConfig.smtpSubtitle}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t.emailConfig.smtpHost}
              placeholder={t.emailConfig.smtpHostPlaceholder}
              value={config.host}
              onChange={(e) => updateConfig('host', e.target.value)}
              variant="bordered"
              size="lg"
              classNames={{
                input: theme === 'dark' ? "text-sm text-white" : "text-sm",
                inputWrapper: theme === 'dark'
                  ? "border-gray-600 hover:border-green-400 focus-within:border-green-500 bg-gray-800/50"
                  : "border-gray-300 hover:border-green-400 focus-within:border-green-500"
              }}
            />
            <Input
              label={t.emailConfig.port}
              type="number"
              placeholder={t.emailConfig.portPlaceholder}
              value={config.port.toString()}
              onChange={(e) => updateConfig('port', parseInt(e.target.value) || 587)}
              variant="bordered"
              size="lg"
              classNames={{
                input: theme === 'dark' ? "text-sm text-white" : "text-sm",
                inputWrapper: theme === 'dark'
                  ? "border-gray-600 hover:border-green-400 focus-within:border-green-500 bg-gray-800/50"
                  : "border-gray-300 hover:border-green-400 focus-within:border-green-500"
              }}
            />
            
            <Input
              label={t.emailConfig.username}
              placeholder={t.emailConfig.usernamePlaceholder}
              value={config.auth.user}
              onChange={(e) => updateConfig('auth.user', e.target.value)}
              variant="bordered"
              size="lg"
              classNames={{
                input: theme === 'dark' ? "text-sm text-white" : "text-sm",
                inputWrapper: theme === 'dark'
                  ? "border-gray-600 hover:border-green-400 focus-within:border-green-500 bg-gray-800/50"
                  : "border-gray-300 hover:border-green-400 focus-within:border-green-500"
              }}
            />
            <Input
              label={t.emailConfig.password}
              type="password"
              placeholder={t.emailConfig.passwordPlaceholder}
              value={config.auth.pass}
              onChange={(e) => updateConfig('auth.pass', e.target.value)}
              variant="bordered"
              size="lg"
              classNames={{
                input: theme === 'dark' ? "text-sm text-white" : "text-sm",
                inputWrapper: theme === 'dark'
                  ? "border-gray-600 hover:border-green-400 focus-within:border-green-500 bg-gray-800/50"
                  : "border-gray-300 hover:border-green-400 focus-within:border-green-500"
              }}
            />
            <Input
              label={t.emailConfig.fromEmail}
              placeholder={t.emailConfig.fromEmailPlaceholder}
              value={config.from}
              onChange={(e) => updateConfig('from', e.target.value)}
              variant="bordered"
              size="lg"
              classNames={{
                input: theme === 'dark' ? "text-sm text-white" : "text-sm",
                inputWrapper: theme === 'dark'
                  ? "border-gray-600 hover:border-green-400 focus-within:border-green-500 bg-gray-800/50"
                  : "border-gray-300 hover:border-green-400 focus-within:border-green-500"
              }}
            />
            <Input
              label={t.emailConfig.replyToEmail}
              placeholder={t.emailConfig.replyToPlaceholder}
              value={config.replyTo || ''}
              onChange={(e) => updateConfig('replyTo', e.target.value)}
              variant="bordered"
              size="lg"
              classNames={{
                input: theme === 'dark' ? "text-sm text-white" : "text-sm",
                inputWrapper: theme === 'dark'
                  ? "border-gray-600 hover:border-green-400 focus-within:border-green-500 bg-gray-800/50"
                  : "border-gray-300 hover:border-green-400 focus-within:border-green-500"
              }}
            />
            </div>

          <Divider className="my-4" />

          <div className="flex gap-2">
            <Button
              onClick={saveConfig}
              color="primary"
              variant="solid"
              size="lg"
              className="px-6"
            >
              {t.emailConfig.saveConfig}
            </Button>
            <Button
              onClick={clearConfig}
              color="danger"
              variant="solid"
              size="lg"
              className="px-6"
            >
              {t.emailConfig.clearConfig}
            </Button>
          </div>

          </div>
        </CardBody>
      </Card>

      {/* Instructions */}
      <Card className={`shadow-lg border-0 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">📚</span>
            </div>
            <div>
              <h3 className={`text-lg font-bold transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
              }`}>
                {t.emailConfig.instructionsTitle}
              </h3>
              <p className={`text-xs transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {t.emailConfig.instructionsSubtitle}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div>
              <h4 className={`font-medium mb-2 transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {t.emailConfig.gmail.title}
              </h4>
              <ul className={`text-sm space-y-1 ml-4 transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <li>{t.emailConfig.gmail.step1}</li>
                <li>{t.emailConfig.gmail.step2}</li>
                <li>{t.emailConfig.gmail.step3}</li>
              </ul>
            </div>

            <div className={`mt-4 p-3 rounded-lg transition-colors duration-300 ${
              theme === 'dark' ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className={`text-sm transition-colors duration-300 ${
                theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'
              }`}>
                <strong>{t.common.warning}:</strong> {t.emailConfig.securityNote}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
