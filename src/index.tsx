import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// 注册 Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/linguago-pwa/service-worker.js');
            console.log('ServiceWorker registration successful with scope:', registration.scope);

            // 检查更新
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // 有新版本可用
                            if (confirm('发现新版本，是否立即更新？')) {
                                window.location.reload();
                            }
                        }
                    });
                }
            });
        } catch (error) {
            console.error('ServiceWorker registration failed:', error);
        }
    });

    // 处理离线/在线状态变化
    window.addEventListener('online', () => {
        console.log('应用已恢复在线状态');
        // 这里可以添加在线状态的处理逻辑
    });

    window.addEventListener('offline', () => {
        console.log('应用已进入离线状态');
        // 这里可以添加离线状态的处理逻辑
    });
} 