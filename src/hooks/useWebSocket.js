import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useWebSocket = (onMessage) => {
    // Сохраняем актуальный колбэк в ref, чтобы не пересоздавать соединение
    const savedCallback = useRef(onMessage);

    useEffect(() => {
        savedCallback.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        const socketFactory = () => new SockJS('http://localhost:8080/ws-flats');

        const stompClient = new Client({
            webSocketFactory: socketFactory,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('WebSocket успешно подключен!');

                stompClient.subscribe('/topic/events', (message) => {
                    try {
                        const parsedBody = JSON.parse(message.body);
                        console.log('Получено новое WebSocket событие:', parsedBody);

                        if (savedCallback.current) {
                            savedCallback.current(parsedBody);
                        }
                    } catch (e) {
                        console.log('Получено сырое сообщение:', message.body);
                        if (savedCallback.current) {
                            savedCallback.current(message.body);
                        }
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Ошибка WebSocket:', frame.headers['message']);
            },
            onWebSocketClose: () => {
                console.log('WebSocket соединение закрыто');
            }
        });

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, []);
};