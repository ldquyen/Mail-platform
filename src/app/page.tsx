'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader, Tabs, Tab } from '@heroui/react';
import EmailFormBuilder from './components/EmailFormBuilder';
import EmailSender from './components/EmailSender';
import EmailConfig from './components/EmailConfig';

type TabType = 'builder' | 'sender' | 'config';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('builder');

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">📧</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Email Custom Platform
                </h1>
                <p className="text-sm text-gray-600 text-center">Tạo và gửi email template chuyên nghiệp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-[88px] z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setActiveTab('builder')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'builder'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                }`}
              >
                <span className="text-lg">🎨</span>
                <span>Email Builder</span>
              </button>
              <button
                onClick={() => setActiveTab('sender')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'sender'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                }`}
              >
                <span className="text-lg">🚀</span>
                <span>Email Sender</span>
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'config'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                }`}
              >
                <span className="text-lg">⚙️</span>
                <span>Email Config</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardBody className="p-0">
            {renderContent()}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}