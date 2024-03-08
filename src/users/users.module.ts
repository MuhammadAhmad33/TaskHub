import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';
import { ExampleMiddleware } from './middlewares/example/example.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { todoSchema } from 'src/schema/todo.schema';
import { userSchema } from 'src/schema/user.schema';
import { AuthService } from 'src/auth/auth.service';
import { usertodoSchema } from 'src/schema/usertodo.schema';
import { JwtService } from '@nestjs/jwt';
import { RolesGuard } from 'src/auth/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { MailService } from '../services/mail.service';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from '../services/upload.service';
import { CloudinaryService } from '../services/cloudinary.service';
import { MessagesGateway } from '../gateways/messages.gateway';
import {Message, MessageSchema } from 'src/schema/message.schema';
import { MessagesController } from '../controllers/message.controller';
import { GatewayModule } from '../gateways/gateway.module';


@Module({
  imports: [MongooseModule.forFeature([{ name: 'Todo', schema: todoSchema }]),
  MongooseModule.forFeature([{ name: 'User', schema: userSchema }]),
  MongooseModule.forFeature([{ name: 'userTodo', schema: usertodoSchema }]),
  MongooseModule.forFeature([{name:Message.name,schema:MessageSchema}]),
  MulterModule.register(),GatewayModule,
],
  controllers: [MessagesController,UsersController],
  providers: [UsersService, AuthService,JwtService,MailService,UploadService,CloudinaryService,MessagesGateway,
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  }],

})

export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ExampleMiddleware).forRoutes({
      path: 'todos',
      method: RequestMethod.GET
    }
    );
  }
}
