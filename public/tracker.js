(function() {
    // В продакшене этот URL должен указывать на ваш рабочий домен (например, https://app.visionary.com/api/track)
    // Либо можно определять его динамически на основе src самого скрипта
    const scriptSrc = document.currentScript ? document.currentScript.src : '';
    const baseUrl = scriptSrc ? new URL(scriptSrc).origin : 'http://localhost:3000';
    const API_URL = `${baseUrl}/api/track`;
    
    // Получаем текущий скрипт, чтобы прочитать data-api-key
    const currentScript = document.currentScript || document.querySelector('script[data-api-key]');
    if (!currentScript) {
        console.error('Visionary Tracker: Missing script tag with data-api-key');
        return;
    }
    const apiKey = currentScript.getAttribute('data-api-key');
    
    if (!apiKey) {
        console.error('Visionary Tracker: API Key is missing in data-api-key attribute');
        return;
    }

    // Утилита для работы с куками
    const cookie = {
        get: (name) => {
            const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
            return v ? v[2] : null;
        },
        set: (name, value, days = 365) => {
            const d = new Date;
            d.setTime(d.getTime() + 24*60*60*1000*days);
            document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString() + ";samesite=lax";
        }
    };

    // Генерация уникального Client ID
    const generateClientId = () => {
        return 'vs_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    };

    let clientId = cookie.get('_vs_client_id');
    if (!clientId) {
        clientId = generateClientId();
        cookie.set('_vs_client_id', clientId);
    }

    // Получение UTM-меток
    const urlParams = new URLSearchParams(window.location.search);
    const getParam = (param) => urlParams.get(param) || null;

    const payload = {
        apiKey: apiKey,
        clientId: clientId,
        pageUrl: window.location.href,
        referrer: document.referrer || null,
        utmSource: getParam('utm_source'),
        utmMedium: getParam('utm_medium'),
        utmCampaign: getParam('utm_campaign'),
        utmTerm: getParam('utm_term'),
        utmContent: getParam('utm_content'),
        userAgent: navigator.userAgent
    };

    // Отправка данных
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true // Запрос уйдет даже при закрытии вкладки
    }).catch(err => console.warn('Visionary Tracker Error:', err));
})();
