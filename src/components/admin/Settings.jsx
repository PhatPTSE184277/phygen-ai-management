import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    User,
    Bell,
    Shield,
    Globe,
    Eye,
    EyeOff,
    Save,
    Settings as SettingsIcon,
    Mail,
    Lock,
    Smartphone,
    Monitor
} from 'lucide-react';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [showPassword, setShowPassword] = useState(false);
    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: false,
        examReminders: true,
        systemUpdates: true
    });

    const [systemSettings, setSystemSettings] = useState({
        siteName: 'ExamPro',
        siteDescription: 'Advanced Exam Management System',
        allowRegistration: true,
        requireEmailVerification: false,
        maintenanceMode: false
    });

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User, description: 'Manage your personal information' },
        { id: 'notifications', name: 'Notifications', icon: Bell, description: 'Configure notification preferences' },
        { id: 'security', name: 'Security', icon: Shield, description: 'Security and privacy settings' },
        { id: 'system', name: 'System', icon: Globe, description: 'System-wide configurations' }
    ];

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        console.log('Profile updated:', profileData);
    };

    const handleNotificationSubmit = (e) => {
        e.preventDefault();
        console.log('Notification settings updated:', notificationSettings);
    };

    const handleSystemSubmit = (e) => {
        e.preventDefault();
        console.log('System settings updated:', systemSettings);
    };

    const handleInputChange = (section, field, value) => {
        if (section === 'profile') {
            setProfileData(prev => ({ ...prev, [field]: value }));
        } else if (section === 'notifications') {
            setNotificationSettings(prev => ({ ...prev, [field]: value }));
        } else if (section === 'system') {
            setSystemSettings(prev => ({ ...prev, [field]: value }));
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">
                        Manage your account preferences and system configurations
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <SettingsIcon className="h-4 w-4" />
                    <span>Account: {user?.email}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Settings Navigation */}
                <div className="lg:col-span-1">
                    <div className="card p-0">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Settings Menu</h3>
                        </div>
                        <nav className="p-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${activeTab === tab.id
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <div>
                                            <div className="font-medium">{tab.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">{tab.description}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="lg:col-span-3">
                    {/* Profile Settings */}
                    {activeTab === 'profile' && (
                        <div className="card">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
                                    <p className="text-sm text-gray-600">Update your personal information and password</p>
                                </div>
                            </div>

                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.username}
                                            onChange={(e) => handleInputChange('profile', 'username', e.target.value)}
                                            className="input-field"
                                            placeholder="Enter your username"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                                            className="input-field"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <h4 className="text-md font-semibold text-gray-900 mb-4">Change Password</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={profileData.currentPassword}
                                                    onChange={(e) => handleInputChange('profile', 'currentPassword', e.target.value)}
                                                    className="input-field pr-11"
                                                    placeholder="Enter current password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={profileData.newPassword}
                                                    onChange={(e) => handleInputChange('profile', 'newPassword', e.target.value)}
                                                    className="input-field"
                                                    placeholder="Enter new password"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Confirm Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={profileData.confirmPassword}
                                                    onChange={(e) => handleInputChange('profile', 'confirmPassword', e.target.value)}
                                                    className="input-field"
                                                    placeholder="Confirm new password"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button type="submit" className="btn-primary flex items-center gap-2">
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Other tabs content would go here */}
                    {activeTab === 'notifications' && (
                        <div className="card">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Bell className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
                                    <p className="text-sm text-gray-600">Configure your notification preferences</p>
                                </div>
                            </div>
                            <p className="text-gray-500">Notification settings will be implemented here...</p>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="card">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <Shield className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                                    <p className="text-sm text-gray-600">Manage your account security</p>
                                </div>
                            </div>
                            <p className="text-gray-500">Security settings will be implemented here...</p>
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div className="card">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Globe className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
                                    <p className="text-sm text-gray-600">Configure system-wide settings</p>
                                </div>
                            </div>
                            <p className="text-gray-500">System settings will be implemented here...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
