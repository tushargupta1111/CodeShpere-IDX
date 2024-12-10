import {io} from 'socket.io-client';

export const initSocket =async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
    return io('http://localhost:4000', options);
};