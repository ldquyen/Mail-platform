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
  Select,
  SelectItem
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

interface EmailItem {
  id: string;
  email: string;
  name?: string;
  isValid: boolean;
}

interface EmailParameter {
  name: string;
  value: string;
  isNameField: boolean;
}

export default function EmailSender() {
  const { theme } = useApp();
  const t = useTranslation();
  const { showSuccess, showError, showWarning } = useToast();
  const [emailInput, setEmailInput] = useState('');
  const [emailList, setEmailList] = useState<EmailItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [parameters, setParameters] = useState<EmailParameter[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<EmailTemplate[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [selectedNameParameter, setSelectedNameParameter] = useState<string>('');

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
    
    // Remove duplicates by using Set and convert back to array
    const uniqueEmails = [...new Set(emails)];
    
    const parsedEmails: EmailItem[] = uniqueEmails.map((email, index) => ({
      id: `${index}-${email}`,
      email,
      name: '',
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
      value: '',
      isNameField: false
    }));
    setParameters(initialParams);
    setSelectedNameParameter(''); // Reset name parameter selection
    // Set default subject based on template name
    setEmailSubject(`${template.name} - Email Notification`);
  };

  // Update parameter value
  const updateParameter = (index: number, value: string) => {
    const updatedParams = [...parameters];
    updatedParams[index].value = value;
    setParameters(updatedParams);
  };

  // Handle value parameter selection
  const handleNameParameterSelect = (parameterName: string) => {
    setSelectedNameParameter(parameterName);
    // Update parameters to reflect which one uses value from email list
    const updatedParams = parameters.map(param => ({
      ...param,
      isNameField: param.name === parameterName
    }));
    setParameters(updatedParams);
  };

  // Update email name
  const updateEmailName = (id: string, name: string) => {
    setEmailList(emailList.map(email => 
      email.id === id ? { ...email, name } : email
    ));
  };

  // Remove email from list
  const removeEmail = (id: string) => {
    setEmailList(emailList.filter(email => email.id !== id));
  };

  // Send emails
  const sendEmails = async () => {
    if (!selectedTemplate) {
      showWarning(t.emailSender.selectTemplate);
      return;
    }

    const validEmails = emailList.filter(email => email.isValid);
    if (validEmails.length === 0) {
      showError(t.emailSender.noValidEmails);
      return;
    }

    // Check if all parameters are filled (only check non-name-field parameters)
    const emptyParams = parameters.filter(param => !param.isNameField && !param.value.trim());
    if (emptyParams.length > 0) {
      showWarning(`${t.emailSender.fillParameters}: ${emptyParams.map(p => p.name).join(', ')}`);
      return;
    }

    // Check if email subject is filled
    if (!emailSubject.trim()) {
      showWarning(t.emailSender.fillSubject);
      return;
    }

    // Check if email config exists and is valid
    const emailConfig = localStorage.getItem('emailConfig');
    if (!emailConfig) {
      showWarning(t.emailSender.configureEmail);
      return;
    }

    // Parse and validate email config
    let config;
    try {
      config = JSON.parse(emailConfig);
    } catch (error) {
      showError(t.emailSender.invalidConfig);
      return;
    }

    // Check if all required fields are filled
    if (!config.auth?.user || !config.auth?.pass || !config.from) {
      showWarning(t.emailSender.incompleteConfig);
      return;
    }

    setIsSending(true);

    try {
      // Send emails individually to handle personalized content
      let totalSent = 0;
      let totalErrors = 0;
      const errors: string[] = [];

      for (const emailItem of validEmails) {
        try {
          // Replace parameters in template for this specific email
          let emailContent = selectedTemplate.html;
          parameters.forEach(param => {
            let value = param.value;
            // If this parameter uses value field, use the email's name
            if (param.isNameField) {
              value = emailItem.name || emailItem.email.split('@')[0]; // fallback to email prefix
            }
            emailContent = emailContent.replace(
              new RegExp(`\\{\\{${param.name}\\}\\}`, 'g'),
              value
            );
          });

          // Send individual email via API
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              config,
              emails: [emailItem.email],
              subject: emailSubject || `${selectedTemplate.name} - Email Notification`,
              htmlContent: emailContent,
              replyTo: config.replyTo || config.from
            }),
          });

          const result = await response.json();
          
          if (response.ok) {
            totalSent++;
          } else {
            totalErrors++;
            errors.push(`${emailItem.email}: ${result.error}`);
          }
        } catch (error) {
          totalErrors++;
          errors.push(`${emailItem.email}: ${error}`);
        }
      }

      // Show results
      if (totalSent > 0) {
        showSuccess(`${t.emailSender.emailSent}\n- ${t.emailSender.successCount}: ${totalSent}\n- ${t.emailSender.errorCount}: ${totalErrors}`);
        
        // Clear form after successful send
        setEmailList([]);
        setEmailInput('');
        setEmailSubject('');
        setSelectedNameParameter('');
        setParameters(parameters.map(p => ({ ...p, value: '', isNameField: false })));
      } else {
        showError(`${t.emailSender.emailError}: ${errors.join(', ')}`);
      }
      
    } catch (error) {
      console.error('Error sending emails:', error);
      showError(t.emailSender.connectionError);
    } finally {
      setIsSending(false);
    }
  };

  const validEmailCount = emailList.filter(e => e.isValid).length;

  return (
    <div className="p-6 space-y-6">
      {/* Step 1: Email List */}
      <Card className={`shadow-lg border-0 transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📧</span>
            </div>
            <div>
              <h3 className={`text-xl font-bold transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
              }`}>
                {t.emailSender.step1}
              </h3>
              <p className={`text-sm transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {t.emailSender.step1Subtitle}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Textarea
                placeholder={t.emailSender.emailPlaceholder}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1"
                variant="bordered"
                minRows={3}
                size="lg"
                classNames={{
                  input: theme === 'dark' ? "text-sm text-white" : "text-sm",
                  inputWrapper: theme === 'dark'
                    ? "border-gray-600 hover:border-green-400 focus-within:border-green-500 bg-gray-800/50"
                    : "border-gray-300 hover:border-green-400 focus-within:border-green-500"
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
                {t.emailSender.parseEmails}
              </Button>
            </div>

            {/* Email List Table */}
            {emailList.length > 0 && ( 
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">📋</span>
                  <h4 className={`text-lg font-semibold transition-colors duration-300 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    {t.emailSender.emailList}
                  </h4>
                  <Chip color="success" variant="flat" size="sm">
                    {validEmailCount} {t.emailSender.validEmails}
                  </Chip>
                  <Chip color="danger" variant="flat" size="sm">
                    {emailList.length - validEmailCount} {t.emailSender.invalidEmails}
                  </Chip>
                </div>
                <div className={`rounded-xl shadow-sm border overflow-hidden transition-colors duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-800/80 border-gray-600' 
                    : 'bg-white border-gray-200'
                }`}>
                  <Table aria-label={t.emailSender.emailListAriaLabel} removeWrapper>
                    <TableHeader>
                      <TableColumn className={`font-semibold transition-colors duration-300 ${
                        theme === 'dark' ? 'bg-gray-700/80 text-gray-100' : 'bg-gray-50 text-gray-800'
                      }`}>{t.emailSender.email}</TableColumn>
                      <TableColumn className={`font-semibold transition-colors duration-300 ${
                        theme === 'dark' ? 'bg-gray-700/80 text-gray-100' : 'bg-gray-50 text-gray-800'
                      }`}>{t.emailSender.name}</TableColumn>
                      <TableColumn className={`font-semibold transition-colors duration-300 ${
                        theme === 'dark' ? 'bg-gray-700/80 text-gray-100' : 'bg-gray-50 text-gray-800'
                      }`}>{t.emailSender.status}</TableColumn>
                      <TableColumn className={`font-semibold transition-colors duration-300 ${
                        theme === 'dark' ? 'bg-gray-700/80 text-gray-100' : 'bg-gray-50 text-gray-800'
                      }`}>{t.emailSender.actions}</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {emailList.map(email => (
                        <TableRow key={email.id} className={`transition-colors duration-300 ${
                          theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                        }`}>
                          <TableCell className={`font-medium transition-colors duration-300 ${
                            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                          }`}>{email.email}</TableCell>
                          <TableCell>
                            <Input
                              placeholder={t.emailSender.enterValueOptional}
                              value={email.name || ''}
                              onChange={(e) => updateEmailName(email.id, e.target.value)}
                              variant="bordered"
                              size="sm"
                              classNames={{
                                input: theme === 'dark' ? "text-xs text-white" : "text-xs",
                                inputWrapper: theme === 'dark'
                                  ? "border-gray-600 hover:border-green-400 focus-within:border-green-500 bg-gray-800/50"
                                  : "border-gray-300 hover:border-green-400 focus-within:border-green-500"
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              color={email.isValid ? "success" : "danger"} 
                              variant="flat" 
                              size="sm"
                              className="font-semibold"
                            >
                              {email.isValid ? t.emailSender.valid : t.emailSender.invalid}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => removeEmail(email.id)}
                              color="danger"
                              variant="light"
                              size="sm"
                              className={theme === 'dark' ? "hover:bg-red-900/30" : "hover:bg-red-100"}
                              startContent={<span>🗑️</span>}
                            >
                              {t.emailSender.remove}
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
      <Card className={`shadow-lg border-0 transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-orange-900/30 to-red-900/30' 
          : 'bg-gradient-to-r from-orange-50 to-red-50'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📄</span>
            </div>
            <div>
              <h3 className={`text-xl font-bold transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
              }`}>
                {t.emailSender.step2}
              </h3>
              <p className={`text-sm transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {t.emailSender.step2Subtitle}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {savedTemplates.length === 0 ? (
            <div className="text-center py-8">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <span className="text-2xl">📝</span>
              </div>
              <p className={`italic transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>{t.emailSender.noTemplates}</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {savedTemplates.map(template => (
                <div key={template.id}>
                  <Card 
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                      selectedTemplate?.id === template.id
                        ? 'ring-2 ring-purple-500 shadow-lg'
                        : 'hover:shadow-lg'
                    } ${
                      theme === 'dark'
                        ? selectedTemplate?.id === template.id
                          ? 'bg-purple-900/50 backdrop-blur-sm'
                          : 'bg-gray-700/80 backdrop-blur-sm hover:bg-gray-600/80'
                        : selectedTemplate?.id === template.id
                          ? 'bg-purple-50'
                          : 'bg-white/80 backdrop-blur-sm'
                    }`}
                    isPressable
                    onPress={() => handleTemplateSelect(template)}
                  >
                    <CardBody className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                          <span className="text-white font-bold text-xs">📧</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium text-sm transition-colors duration-300 truncate ${
                            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                          }`}>{template.name}</h4>
                          <p className={`text-xs transition-colors duration-300 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {template.parameters.length} {t.emailSender.parametersCount}
                          </p>
                        </div>
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
        <Card className={`shadow-lg border-0 transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30' 
            : 'bg-gradient-to-r from-orange-50 to-yellow-50'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">⚙️</span>
                </div>
                <div>
                  <h3 className={`text-xl font-bold transition-colors duration-300 ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                  }`}>{t.emailSender.enterParameters}</h3>
                  <p className={`text-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>{t.emailSender.enterParametersSubtitle}</p>
                </div>
              </div>
              
              {/* Value Parameter Selection */}
              {parameters.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {t.emailSender.useNameFor}
                  </span>
                  <Select
                    placeholder={t.emailSender.selectParameter}
                    selectedKeys={selectedNameParameter ? [selectedNameParameter] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      handleNameParameterSelect(selected || '');
                    }}
                    size="sm"
                    className="min-w-32"
                    classNames={{
                      trigger: theme === 'dark' 
                        ? "border-gray-600 hover:border-orange-400 focus-within:border-orange-500 bg-gray-800/50" 
                        : "border-gray-300 hover:border-orange-400 focus-within:border-orange-500",
                      popoverContent: theme === 'dark' 
                        ? "bg-gray-700 border-gray-500 text-gray-100" 
                        : "bg-white border-gray-200"
                    }}
                    items={[
                      { key: '', label: t.emailSender.none },
                      ...parameters.map(param => ({ key: param.name, label: param.name }))
                    ]}
                  >
                    {(item) => (
                      <SelectItem key={item.key}>{item.label}</SelectItem>
                    )}
                  </Select>
                </div>
              )}
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {/* Email Subject */}
              <Input
                label={t.emailSender.emailSubject}
                placeholder={t.emailSender.emailSubjectPlaceholder}
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                variant="bordered"
                size="lg"
                classNames={{
                  input: theme === 'dark' ? "text-sm text-white" : "text-sm",
                  inputWrapper: theme === 'dark'
                    ? "border-gray-600 hover:border-purple-400 focus-within:border-purple-500 bg-gray-800/50"
                    : "border-gray-300 hover:border-purple-400 focus-within:border-purple-500"
                }}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parameters.map((param, index) => (
                <div key={param.name} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className={`text-sm font-medium transition-colors duration-300 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {param.name}
                    </label>
                    {param.isNameField && (
                      <Chip 
                        color="success" 
                        variant="flat" 
                        size="sm"
                        className="text-xs"
                      >
                        {t.emailSender.usesValue}
                      </Chip>
                    )}
                  </div>
                  
                  <Input
                    placeholder={param.isNameField 
                      ? t.emailSender.willUseValueFromEmail
                      : `${t.emailSender.enterValueFor} ${param.name}`
                    }
                    value={param.value}
                    onChange={(e) => updateParameter(index, e.target.value)}
                    variant="bordered"
                    size="lg"
                    disabled={param.isNameField}
                    classNames={{
                      input: theme === 'dark' ? "text-sm text-white" : "text-sm",
                      inputWrapper: theme === 'dark' 
                        ? "border-gray-600 hover:border-purple-400 focus-within:border-purple-500 bg-gray-800/50" 
                        : "border-gray-300 hover:border-orange-400 focus-within:border-orange-500"
                    }}
                  />
                </div>
              ))}
            </div>
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
          {isSending ? t.emailSender.sending : `${t.emailSender.sendEmail} (${validEmailCount})`}
        </Button>
      </div>
    </div>
  );
}