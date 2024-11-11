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

            // 只在页面加载时检查一次更新
            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (refreshing) return;
                refreshing = true;
                window.location.reload();
            });

            // 定期检查更新（比如每小时检查一次）
            setInterval(async () => {
                try {
                    await registration.update();
                    const newWorker = registration.installing || registration.waiting;

                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // 有新版本可用，但不立即提示，等待下次刷新时自动更新
                                console.log('New version available, will update on next reload');
                            }
                        });
                    }
                } catch (error) {
                    console.error('Service worker update check failed:', error);
                }
            }, 3 * 24 * 60 * 60 * 1000);

        } catch (error) {
            console.error('ServiceWorker registration failed:', error);
        }
    });

    // 处理离线/在线状态变化
    window.addEventListener('online', () => {
        console.log('应用已恢复在线状态');
    });

    window.addEventListener('offline', () => {
        console.log('应用已进入离线状态');
    });
} 