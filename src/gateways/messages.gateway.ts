import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from '../schema/message.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { messageDto } from 'src/dtos/message.dto';
import { Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
@WebSocketGateway()
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;
    constructor(
        @InjectModel(Message.name) private messageSchema: Model<Message>,
        private jwtService: JwtService
    ) { }

    handleDisconnect(client: Socket): any {
        console.log(`disconnect---${client.id}`);
    }

    async handleConnection(client: Socket) {
        console.log(`connected---${client.id}`);

        const headers = client.handshake.headers;
        const jwtToken = headers.authorization;
        // console.log(jwtToken);

        if (jwtToken) {
            try {
                const decode = jwtToken.split(' ') ?? [];

                if (decode) {
                    const payload = await this.jwtService.verifyAsync(
                        jwtToken,
                        {
                            secret: jwtConstants.secret
                        }
                    );
                    client.request['user'] = payload;

                    console.log(client.request['user'])
                } else {
                    throw new UnauthorizedException();
                }
            } catch (error) {
                console.error('Token verification error:', error.message);
            }
        } else {
            console.error('No JWT token provided.');
        }
    }

    @SubscribeMessage('send-message')
    async sendMessage(client: Socket, message: string,): Promise<Message> {
        const sender = client.request['user']
        const senderId = sender.id;
        console.log(senderId, '-id')
        const createdMessage = new this.messageSchema({ content: message, sender: senderId });
        //console.log(createdMessage)
        const savedMessage = await createdMessage.save();
        console.log(savedMessage, 'saved')

        // Broadcast the message to all connected clients
        this.server.emit('receive-message', savedMessage);

        // Return the saved message to the sender
        return savedMessage;
    }

    @SubscribeMessage('receive-message')
    async receiveMessage(client: Socket) {
        console.log(client.data)
        client.emit('send-message', 'received')
    }
}