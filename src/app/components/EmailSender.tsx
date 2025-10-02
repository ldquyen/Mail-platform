'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Input, 
  Button, 
  Chip, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Textarea,
  Spinner,
  Divider
} from '@heroui/react';

interface EmailTemplate {
  id: string;
  name: string;
  html: string;
  parameters: string[];
}

interface EmailItem {
  id: string;
  email: string;
  isValid: boolean;
}

interface EmailParameter {
  name: string;
  value: string;
}

export default function EmailSender() {
  const [emailInput, setEmailInput] = useState('');
  const [emailList, setEmailList] = useState<EmailItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [parameters, setParameters] = useState<EmailParameter[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<EmailTemplate[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Load saved templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('emailTemplates');
    if (saved) {
      setSavedTemplates(JSON.parse(saved));
    }
  }, []);

  // Parse email input and create email list
  const parseEmails = () => {
    const emails = emailInput
      .split(/[,\s\n]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const parsedEmails: EmailItem[] = emails.map((email, index) => ({
      id: `${index}-${email}`,
      email,
      isValid: emailRegex.test(email)
    }));

    setEmailList(parsedEmails);
  };

  // Handle template selection
  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    // Initialize parameters with empty values
    const initialParams: EmailParameter[] = template.parameters.map(param => ({
      name: param,
      value: ''
    }));
    setParameters(initialParams);
  };

  // Update parameter value
  const updateParameter = (index: number, value: string) => {
    const updatedParams = [...parameters];
    updatedParams[index].value = value;
    setParameters(updatedParams);
  };

  // Remove email from list
  const removeEmail = (id: string) => {
    setEmailList(emailList.filter(email => email.id !== id));
  };

  // Add single email
  const addEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = emailInput.trim();
    
    if (email && emailRegex.test(email)) {
      const newEmail: EmailItem = {
        id: `${Date.now()}-${email}`,
        email,
        isValid: true
      };
      setEmailList([...emailList, newEmail]);
      setEmailInput('');
    } else {
      alert('Vui lòng nhập email hợp lệ');
    }
  };

  // Send emails
  const sendEmails = async () => {
    if (!selectedTemplate) {
      alert('Vui lòng chọn template');
      return;
    }

    const validEmails = emailList.filter(email => email.isValid);
    if (validEmails.length === 0) {
      alert('Không có email hợp lệ nào để gửi');
      return;
    }

    // Check if all parameters are filled
    const emptyParams = parameters.filter(param => !param.value.trim());
    if (emptyParams.length > 0) {
      alert(`Vui lòng điền đầy đủ tham số: ${emptyParams.map(p => p.name).join(', ')}`);
      return;
    }

    // Check if email config exists
    const emailConfig = localStorage.getItem('emailConfig');
    if (!emailConfig) {
      alert('Vui lòng cấu hình email settings trong tab Email Config trước');
      return;
    }

    setIsSending(true);

    try {
      // Replace parameters in template
      let emailContent = selectedTemplate.html;
      parameters.forEach(param => {
        emailContent = emailContent.replace(
          new RegExp(`\\{\\{${param.name}\\}\\}`, 'g'),
          param.value
        );
      });

      // Get email configuration
      const config = JSON.parse(emailConfig);
      
      // Send emails via API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          emails: validEmails.map(e => e.email),
          subject: `Email từ ${selectedTemplate.name}`,
          htmlContent: emailContent,
          replyTo: config.replyTo || config.from
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`Đã gửi email thành công!\n- Thành công: ${result.totalSent}\n- Lỗi: ${result.totalErrors}`);
        
        // Clear form after successful send
        setEmailList([]);
        setEmailInput('');
        setParameters(parameters.map(p => ({ ...p, value: '' })));
      } else {
        alert(`Lỗi gửi email: ${result.error}`);
      }
      
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Có lỗi xảy ra khi gửi email');
    } finally {
      setIsSending(false);
    }
  };

  const validEmailCount = emailList.filter(e => e.isValid).length;

  return (
    <div className="p-6 space-y-6">
      {/* Step 1: Email List */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📧</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">1. Danh sách Email</h3>
              <p className="text-sm text-gray-600">Nhập và quản lý danh sách email người nhận</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Textarea
                placeholder="Nhập danh sách email (cách nhau bởi dấu phẩy, khoảng trắng hoặc xuống dòng)..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1"
                variant="bordered"
                minRows={3}
                size="lg"
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-gray-300 hover:border-green-400 focus-within:border-green-500"
                }}
              />
              <Button
                onClick={parseEmails}
                color="success"
                variant="solid"
                size="lg"
                className="self-start px-6 font-semibold"
                startContent={<span>🔍</span>}
              >
                Parse Emails
              </Button>
            </div>

            {/* Email List Table */}
            {emailList.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">📋</span>
                  <h4 className="text-lg font-semibold text-gray-800">Danh sách Email</h4>
                  <Chip color="success" variant="flat" size="sm">
                    {validEmailCount} hợp lệ
                  </Chip>
                  <Chip color="danger" variant="flat" size="sm">
                    {emailList.length - validEmailCount} không hợp lệ
                  </Chip>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <Table aria-label="Email list" removeWrapper>
                    <TableHeader>
                      <TableColumn className="bg-gray-50 font-semibold">EMAIL</TableColumn>
                      <TableColumn className="bg-gray-50 font-semibold">TRẠNG THÁI</TableColumn>
                      <TableColumn className="bg-gray-50 font-semibold">THAO TÁC</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {emailList.map(email => (
                        <TableRow key={email.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{email.email}</TableCell>
                          <TableCell>
                            <Chip 
                              color={email.isValid ? "success" : "danger"} 
                              variant="flat" 
                              size="sm"
                              className="font-semibold"
                            >
                              {email.isValid ? '✅ Hợp lệ' : '❌ Không hợp lệ'}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => removeEmail(email.id)}
                              color="danger"
                              variant="light"
                              size="sm"
                              className="hover:bg-red-100"
                              startContent={<span>🗑️</span>}
                            >
                              Xóa
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Step 2: Template Selection */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📄</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">2. Chọn Template</h3>
              <p className="text-sm text-gray-600">Chọn template email để gửi</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {savedTemplates.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-gray-500 italic">Chưa có template nào. Vui lòng tạo template trong tab Email Builder.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedTemplates.map(template => (
                <div key={template.id}>
                  <Card 
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                      selectedTemplate?.id === template.id
                        ? 'ring-2 ring-purple-500 bg-purple-50 shadow-lg'
                        : 'hover:shadow-lg bg-white/80 backdrop-blur-sm'
                    }`}
                    isPressable
                    onPress={() => handleTemplateSelect(template)}
                  >
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">📧</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{template.name}</h4>
                          <p className="text-xs text-gray-500">
                            {template.parameters.length} tham số
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.parameters.map(param => (
                          <Chip key={param} size="sm" variant="flat" color="secondary" className="text-xs font-mono">
                            {param}
                          </Chip>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Step 3: Parameters */}
      {selectedTemplate && (
        <Card className="shadow-lg border-0 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚙️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">3. Nhập Tham số</h3>
                <p className="text-sm text-gray-600">Điền giá trị cho các tham số trong template</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parameters.map((param, index) => (
                <Input
                  key={param.name}
                  label={param.name}
                  placeholder={`Nhập giá trị cho ${param.name}`}
                  value={param.value}
                  onChange={(e) => updateParameter(index, e.target.value)}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "border-gray-300 hover:border-orange-400 focus-within:border-orange-500"
                  }}
                />
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Send Button */}
      <div className="flex justify-center">
        <Button
          onClick={sendEmails}
          disabled={isSending || validEmailCount === 0 || !selectedTemplate}
          color="primary"
          size="lg"
          className="min-w-48 h-14 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500"
          startContent={isSending ? <Spinner size="sm" color="white" /> : <span>🚀</span>}
        >
          {isSending ? 'Đang gửi...' : `Gửi Email (${validEmailCount})`}
        </Button>
      </div>
    </div>
  );
}