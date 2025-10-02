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
  Chip,
  Textarea,
  Select,
  SelectItem
} from '@heroui/react';
import { useApp } from '../contexts/AppContext';
import { useTranslation } from '../hooks/useTranslation';

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

const commonProviders = [
  { key: 'gmail', label: 'Gmail', host: 'smtp.gmail.com', port: 587, secure: false },
  { key: 'outlook', label: 'Outlook/Hotmail', host: 'smtp-mail.outlook.com', port: 587, secure: false },
  { key: 'yahoo', label: 'Yahoo', host: 'smtp.mail.yahoo.com', port: 587, secure: false },
  { key: 'custom', label: 'Custom', host: '', port: 587, secure: false }
];

export default function EmailConfig() {
  const { theme } = useApp();
  const t = useTranslation();
  const [config, setConfig] = useState<EmailConfig>(defaultConfig);
  const [selectedProvider, setSelectedProvider] = useState('gmail');
  const [isTestMode, setIsTestMode] = useState(true);
  const [testResult, setTestResult] = useState<string>('');

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
    alert(t.emailConfig.configSaved);
  };

  // Handle provider selection
  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    if (provider !== 'custom') {
      const providerData = commonProviders.find(p => p.key === provider);
      if (providerData) {
        setConfig(prev => ({
          ...prev,
          host: providerData.host,
          port: providerData.port,
          secure: providerData.secure
        }));
      }
    }
  };

  // Test email configuration
  const testEmailConfig = async () => {
    if (!config.auth.user || !config.auth.pass || !config.from) {
      alert(t.emailConfig.fillAllFields);
      return;
    }

    setTestResult(t.emailConfig.testingConfig);
    
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          testMode: isTestMode
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setTestResult(`✅ ${result.message}`);
      } else {
        setTestResult(`❌ ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ ${t.emailConfig.connectionError}: ${error}`);
    }
  };

  // Update config field
  const updateConfig = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setConfig(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof EmailConfig] as any),
          [child]: value
        }
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Email Provider Selection */}
      <Card className={`shadow-lg border-0 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚙️</span>
            </div>
            <div>
              <h3 className={`text-lg font-bold transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
              }`}>
                {t.emailConfig.title}
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
            <Select
              label={t.emailConfig.selectProvider}
              placeholder={t.emailConfig.selectProviderPlaceholder}
              selectedKeys={[selectedProvider]}
              onSelectionChange={(keys) => handleProviderChange(Array.from(keys)[0] as string)}
              variant="bordered"
              size="lg"
            >
              {commonProviders.map((provider) => (
                <SelectItem key={provider.key}>
                  {provider.label}
                </SelectItem>
              ))}
            </Select>

            <div className="flex items-center gap-2">
              <Switch
                isSelected={isTestMode}
                onValueChange={setIsTestMode}
                size="sm"
              />
              <span className={`text-sm transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t.emailConfig.testMode}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t.emailConfig.smtpHost}
              placeholder="smtp.gmail.com"
              value={config.host}
              onChange={(e) => updateConfig('host', e.target.value)}
              variant="bordered"
              size="lg"
            />
            <Input
              label={t.emailConfig.port}
              type="number"
              placeholder="587"
              value={config.port.toString()}
              onChange={(e) => updateConfig('port', parseInt(e.target.value) || 587)}
              variant="bordered"
              size="lg"
            />
            <Input
              label={t.emailConfig.username}
              placeholder="your-email@gmail.com"
              value={config.auth.user}
              onChange={(e) => updateConfig('auth.user', e.target.value)}
              variant="bordered"
              size="lg"
            />
            <Input
              label={t.emailConfig.password}
              type="password"
              placeholder="Your password or app password"
              value={config.auth.pass}
              onChange={(e) => updateConfig('auth.pass', e.target.value)}
              variant="bordered"
              size="lg"
            />
            <Input
              label={t.emailConfig.fromEmail}
              placeholder="sender@example.com"
              value={config.from}
              onChange={(e) => updateConfig('from', e.target.value)}
              variant="bordered"
              size="lg"
            />
            <Input
              label={t.emailConfig.replyToEmail}
              placeholder="reply@example.com"
              value={config.replyTo || ''}
              onChange={(e) => updateConfig('replyTo', e.target.value)}
              variant="bordered"
              size="lg"
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
              onClick={testEmailConfig}
              color="secondary"
              variant="solid"
              size="lg"
              className="px-6"
            >
              {t.emailConfig.testConfig}
            </Button>
          </div>

          {testResult && (
            <div className={`mt-4 p-3 rounded-lg transition-colors duration-300 ${
              theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
            }`}>
              <p className={`text-sm transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {testResult}
              </p>
            </div>
          )}
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

            <div>
              <h4 className={`font-medium mb-2 transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {t.emailConfig.outlook.title}
              </h4>
              <ul className={`text-sm space-y-1 ml-4 transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <li>{t.emailConfig.outlook.step1}</li>
                <li>{t.emailConfig.outlook.step2}</li>
                <li>{t.emailConfig.outlook.step3}</li>
              </ul>
            </div>

            <div>
              <h4 className={`font-medium mb-2 transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {t.emailConfig.yahoo.title}
              </h4>
              <ul className={`text-sm space-y-1 ml-4 transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <li>{t.emailConfig.yahoo.step1}</li>
                <li>{t.emailConfig.yahoo.step2}</li>
                <li>{t.emailConfig.yahoo.step3}</li>
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
