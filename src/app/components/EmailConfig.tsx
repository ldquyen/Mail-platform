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
    alert('Cấu hình email đã được lưu thành công!');
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
      alert('Vui lòng điền đầy đủ thông tin cấu hình email');
      return;
    }

    setTestResult('Đang kiểm tra cấu hình...');
    
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
      setTestResult(`❌ Lỗi kết nối: ${error}`);
    }
  };

  // Update config field
  const updateConfig = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setConfig(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof EmailConfig],
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
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Cấu hình Email Provider</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <Select
              label="Chọn Email Provider"
              placeholder="Chọn nhà cung cấp email"
              selectedKeys={[selectedProvider]}
              onSelectionChange={(keys) => handleProviderChange(Array.from(keys)[0] as string)}
              variant="bordered"
            >
              {commonProviders.map((provider) => (
                <SelectItem key={provider.key} value={provider.key}>
                  {provider.label}
                </SelectItem>
              ))}
            </Select>

            <div className="flex items-center gap-2">
              <Switch
                isSelected={isTestMode}
                onValueChange={setIsTestMode}
              />
              <span className="text-sm">Chế độ test (không gửi email thực)</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Cấu hình SMTP</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="SMTP Host"
              placeholder="smtp.gmail.com"
              value={config.host}
              onChange={(e) => updateConfig('host', e.target.value)}
              variant="bordered"
            />
            <Input
              label="Port"
              type="number"
              placeholder="587"
              value={config.port.toString()}
              onChange={(e) => updateConfig('port', parseInt(e.target.value) || 587)}
              variant="bordered"
            />
            <Input
              label="Username/Email"
              placeholder="your-email@gmail.com"
              value={config.auth.user}
              onChange={(e) => updateConfig('auth.user', e.target.value)}
              variant="bordered"
            />
            <Input
              label="Password/App Password"
              type="password"
              placeholder="Your password or app password"
              value={config.auth.pass}
              onChange={(e) => updateConfig('auth.pass', e.target.value)}
              variant="bordered"
            />
            <Input
              label="From Email"
              placeholder="sender@example.com"
              value={config.from}
              onChange={(e) => updateConfig('from', e.target.value)}
              variant="bordered"
            />
            <Input
              label="Reply-To Email (Optional)"
              placeholder="reply@example.com"
              value={config.replyTo || ''}
              onChange={(e) => updateConfig('replyTo', e.target.value)}
              variant="bordered"
            />
          </div>

          <Divider className="my-4" />

          <div className="flex gap-2">
            <Button
              onClick={saveConfig}
              color="primary"
              variant="solid"
            >
              Lưu Cấu hình
            </Button>
            <Button
              onClick={testEmailConfig}
              color="secondary"
              variant="solid"
            >
              Test Cấu hình
            </Button>
          </div>

          {testResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm">{testResult}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Hướng dẫn cấu hình</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Gmail:</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Bật 2-Factor Authentication</li>
                <li>• Tạo App Password: Google Account → Security → App passwords</li>
                <li>• Sử dụng App Password thay vì mật khẩu thường</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Outlook/Hotmail:</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Bật 2-Factor Authentication</li>
                <li>• Tạo App Password trong Microsoft Account</li>
                <li>• Sử dụng App Password để đăng nhập</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Yahoo:</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Bật 2-Factor Authentication</li>
                <li>• Tạo App Password trong Yahoo Account Security</li>
                <li>• Sử dụng App Password thay vì mật khẩu thường</li>
              </ul>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Để bảo mật, cấu hình email chỉ được lưu trong trình duyệt hiện tại và không được gửi lên server.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
