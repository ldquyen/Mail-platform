'use client';

import { useState } from 'react';
import { Card, CardBody, Button, Switch, Select, SelectItem } from '@heroui/react';
import EmailFormBuilder from './components/EmailFormBuilder';
import EmailSender from './components/EmailSender';
import EmailConfig from './components/EmailConfig';
import { useApp } from './contexts/AppContext';
import { useTranslation } from './hooks/useTranslation';

type TabType = 'builder' | 'sender' | 'config';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('builder');
  const { theme, language, toggleTheme, setLanguage } = useApp();
  const t = useTranslation();

  const renderContent = () => {
    switch (activeTab) {
      case 'builder':
        return <EmailFormBuilder />;
      case 'sender':
        return <EmailSender />;
      case 'config':
        return <EmailConfig />;
      default:
        return <EmailFormBuilder />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Header */}
      <div className={`backdrop-blur-md shadow-lg border-b transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-900/90 border-gray-700/50' 
          : 'bg-white/90 border-gray-200/50'
      } sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">📧</span>
              </div>
              <div>
                <h1 className={`text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                  {t.header.title}
                </h1>
                <p className={`text-sm text-center transition-colors duration-300 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {t.header.subtitle}
                </p>
              </div>
            </div>

            {/* Theme Toggle & Language Switcher */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {theme === 'dark' ? '🌙' : '☀️'}
                </span>
                <Switch
                  isSelected={theme === 'dark'}
                  onValueChange={toggleTheme}
                  size="sm"
                />
              </div>
              
              <Select
                selectedKeys={[language]}
                onSelectionChange={(keys) => setLanguage(Array.from(keys)[0] as 'vi' | 'en')}
                size="sm"
                className="w-24"
                variant="bordered"
                classNames={{
                  trigger: theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300',
                  value: theme === 'dark' ? 'text-gray-200' : 'text-gray-800',
                }}
              >
                <SelectItem key="vi" className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>
                  🇻🇳 VI
                </SelectItem>
                <SelectItem key="en" className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>
                  🇺🇸 EN
                </SelectItem>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={`backdrop-blur-sm border-b transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800/80 border-gray-700/50' 
          : 'bg-white/80 border-gray-200/50'
      } sticky top-[88px] z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className={`flex rounded-xl p-1 gap-1 transition-colors duration-300 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <button
                onClick={() => setActiveTab('builder')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'builder'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : theme === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-600' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                }`}
              >
                <span className="text-lg">🎨</span>
                <span>{t.nav.emailBuilder}</span>
              </button>
              <button
                onClick={() => setActiveTab('sender')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'sender'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : theme === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-600' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                }`}
              >
                <span className="text-lg">🚀</span>
                <span>{t.nav.emailSender}</span>
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'config'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : theme === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-600' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                }`}
              >
                <span className="text-lg">⚙️</span>
                <span>{t.nav.emailConfig}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className={`shadow-2xl border-0 backdrop-blur-sm transition-colors duration-300 ${
          theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'
        }`}>
          <CardBody className="p-0">
            {renderContent()}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}