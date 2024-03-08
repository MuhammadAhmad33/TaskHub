import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { Message } from '../schema/message.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { messageDto } from 'src/dtos/message.dto';
import { AuthGuard } from 'src/auth/local-auth.gaurd';
import { Request } from 'express';

@Controller('messages')
export class MessagesController {
  constructor(@InjectModel(Message.name) private messageSchema: Model<Message>) {}

  @Post()
  @UseGuards(AuthGuard)

  async createMessage(@Req()req:Request ,@Body() messageDto:messageDto): Promise<Message> {
    const sender=req.user as any;
    const senderId=sender.id;
    console.log(senderId)
    const createdMessage = new this.messageSchema({ ...messageDto, sender:senderId });
    const savedMessage = await createdMessage.save();

    return savedMessage;
  }
}
