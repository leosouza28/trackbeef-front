// src/app/services/push-notification.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { EndpointsService } from './endpoints.service';
import { AlertService } from './alert.service';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {

    vapidKey: string = 'BGzNVGoWOddAR2SFomwa3B4pUr0pc3ZORokb1igIJZ9Sl0YXTMId_AwcLlrE8SKkUwTQ5STtr-EtFVGZs8cj0xw'

    private firebase: any = {
        apiKey: "AIzaSyB9ZaOE-WTm55ntoIQCPWPiN7iUX3aYokI",
        authDomain: "lsdevelopers.firebaseapp.com",
        projectId: "lsdevelopers",
        storageBucket: "lsdevelopers.firebasestorage.app",
        messagingSenderId: "16314003095",
        appId: "1:16314003095:web:27e4a6f0437ab45c1603d2",
        measurementId: "G-5LKTHKZ63J",
        vapidKey: this.vapidKey
    }

    private firebaseApp = initializeApp(this.firebase);
    private messaging: Messaging;

    constructor(private http: HttpClient, private endpointService: EndpointsService, private alertService: AlertService) {
        this.messaging = getMessaging(this.firebaseApp);
    }

    async requestPermissionAndGetToken(): Promise<string | null> {
        if (!('Notification' in window)) {
            console.warn('Navegador não suporta Notification API');
            return null;
        }

        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
            console.log('Permissão de notificação negada:', permission);
            return null;
        }

        const token = await getToken(this.messaging, { vapidKey: this.vapidKey });

        if (token) {
            console.log('FCM token:', token);
            this.saveTokenToLocalStorage(token);
            await this.endpointService.registerFcmToken(token)
            return token;
        } else {
            console.warn('Não foi possível obter o token FCM.');
            return null;
        }
    }

    listenForegroundMessages() {
        onMessage(this.messaging, (payload) => {
            console.log('Mensagem recebida em foreground: ', payload);
            this.alertService.showSuccess(payload.notification?.title || 'Você recebeu uma nova notificação.');
            // Aqui você pode exibir um toast, snackbar, etc.
        });
    }

    /**
     * Verifica se o dispositivo já tem notificações registradas
     * @returns true se já estiver registrado, false caso contrário
     */
    isNotificationRegistered(): boolean {
        // Verifica se o navegador suporta notificações
        if (!('Notification' in window)) {
            return false;
        }

        // Verifica se a permissão foi concedida
        if (Notification.permission !== 'granted') {
            return false;
        }

        // Verifica se existe um token salvo no localStorage
        const savedToken = localStorage.getItem('fcm_token');
        return !!savedToken;
    }

    /**
     * Salva o token no localStorage
     */
    private saveTokenToLocalStorage(token: string): void {
        localStorage.setItem('fcm_token', token);
        localStorage.setItem('fcm_token_date', new Date().toISOString());
    }

    /**
     * Remove o token do localStorage
     */
    removeTokenFromLocalStorage(): void {
        localStorage.removeItem('fcm_token');
        localStorage.removeItem('fcm_token_date');
    }

    /**
     * Obtém o token salvo no localStorage
     */
    getSavedToken(): string | null {
        return localStorage.getItem('fcm_token');
    }
}
