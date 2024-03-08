import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule,AuthModule,MongooseModule.forRoot('mongodb+srv://ahmaadd7:ahmadahmad@cluster0.bzvgqet.mongodb.net/'), AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
