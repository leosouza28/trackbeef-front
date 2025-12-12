/* firebase-messaging-sw.js */

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyB9ZaOE-WTm55ntoIQCPWPiN7iUX3aYokI",
    authDomain: "lsdevelopers.firebaseapp.com",
    projectId: "lsdevelopers",
    storageBucket: "lsdevelopers.firebasestorage.app",
    messagingSenderId: "16314003095",
    appId: "1:16314003095:web:27e4a6f0437ab45c1603d2",
    measurementId: "G-5LKTHKZ63J"
});

const messaging = firebase.messaging();

// Notificações quando o app está em background
messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Mensagem em background ', payload);

    const notificationTitle = payload.notification?.title || 'Nova notificação';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/assets/icons/icon-192x192.jpeg', // Ajusta para o ícone do teu projeto
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
