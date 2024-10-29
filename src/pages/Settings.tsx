import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setApiKey, setApiUrl, setModel, setTheme } from '../store/slices/settingsSlice';
import axios from 'axios';

const Settings = () => {
    const dispatch = useDispatch();
    const { apiKey, apiUrl, model, theme } = useSelector((state: RootState) => state.settings);

    // 使用本地状态存储临时的设置值，避免直接修改 redux 状态
    const [tempSettings, setTempSettings] = useState({
        apiKey,
        apiUrl,
        model
    });
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTempSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const testApiConnection = async () => {
        setTestStatus('testing');
        setErrorMessage('');

        try {
            const response = await axios.post(
                `${tempSettings.apiUrl}/chat/completions`,
                {
                    model: tempSettings.model,
                    messages: [{ role: 'user', content: 'Hello' }],
                    max_tokens: 5
                },
                {
                    headers: {
                        'Authorization': `Bearer ${tempSettings.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                setTestStatus('success');
            }
        } catch (error: any) {
            setTestStatus('error');
            setErrorMessage(error.response?.data?.error?.message || '连接测试失败，请检查配置');
        }
    };

    const saveSettings = () => {
        // 只有在API测试成功后才能保存
        if (testStatus !== 'success') {
            return;
        }

        // 更新 Redux 状态
        dispatch(setApiUrl(tempSettings.apiUrl));
        dispatch(setApiKey(tempSettings.apiKey));
        dispatch(setModel(tempSettings.model));

        // 安全地存储到 localStorage
        localStorage.setItem('apiUrl', tempSettings.apiUrl);
        localStorage.setItem('apiKey', tempSettings.apiKey);
        localStorage.setItem('model', tempSettings.model);
    };

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        dispatch(setTheme(newTheme));
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('theme', newTheme);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4 dark:text-white">API 设置</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            API URL
                        </label>
                        <input
                            type="text"
                            name="apiUrl"
                            value={tempSettings.apiUrl}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="例如: https://api.chatanywhere.tech/v1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            API Key
                        </label>
                        <input
                            type="password"
                            name="apiKey"
                            value={tempSettings.apiKey}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="输入你的 API Key"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            模型
                        </label>
                        <input
                            type="text"
                            name="model"
                            value={tempSettings.model}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="例如: gpt-3.5-turbo"
                        />
                    </div>

                    {/* 测试状态显示 */}
                    {testStatus !== 'idle' && (
                        <div className={`p-3 rounded ${testStatus === 'testing' ? 'bg-yellow-100 dark:bg-yellow-800' :
                                testStatus === 'success' ? 'bg-green-100 dark:bg-green-800' :
                                    'bg-red-100 dark:bg-red-800'
                            }`}>
                            {testStatus === 'testing' && '正在测试连接...'}
                            {testStatus === 'success' && '连接测试成功！'}
                            {testStatus === 'error' && (
                                <div>
                                    <p>连接测试失败</p>
                                    {errorMessage && <p className="text-sm mt-1">{errorMessage}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex space-x-4">
                        <button
                            onClick={testApiConnection}
                            disabled={testStatus === 'testing'}
                            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {testStatus === 'testing' ? '测试中...' : '测试连接'}
                        </button>
                        <button
                            onClick={saveSettings}
                            disabled={testStatus !== 'success'}
                            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                        >
                            保存配置
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4 dark:text-white">主题设置</h2>
                <div className="flex space-x-4">
                    <button
                        onClick={() => handleThemeChange('light')}
                        className={`px-4 py-2 rounded ${theme === 'light'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                            }`}
                    >
                        浅色
                    </button>
                    <button
                        onClick={() => handleThemeChange('dark')}
                        className={`px-4 py-2 rounded ${theme === 'dark'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                            }`}
                    >
                        深色
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings; 