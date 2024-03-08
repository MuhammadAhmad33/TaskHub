import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/services/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from 'src/schema/user.schema';
import { todoSchema } from 'src/schema/todo.schema';
import { PassportModule } from '@nestjs/passport';
import { usertodoSchema } from 'src/schema/usertodo.schema';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Jwtstratergy } from './jwt.stratergy';
import { AuthGuard } from './local-auth.gaurd';
@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: 'User', schema: userSchema }]),
    MongooseModule.forFeature([{ name: 'Todo', schema: todoSchema }]),
    MongooseModule.forFeature([{ name: 'userTodo', schema: usertodoSchema }]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      //signOptions: { expiresIn: '30s' },
    })
  ],
  providers: [AuthService, UsersService, Jwtstratergy],
  exports:[AuthService]
})
export class AuthModule { }
