import {
    BadRequestException, Body, Controller, Delete, Get, UploadedFile,
    UseInterceptors, NotAcceptableException, Param, Post, Put, Req, Res, UseGuards, Bind, HttpException, HttpStatus,
} from '@nestjs/common';
import { Express, Request, Response } from 'express';
import { UsersService } from '../services/users.service';
import { createDto } from 'src/dtos/create.dto';
import { updateDto } from 'src/dtos/update.dto';
import { userdto } from 'src/dtos/user.dto';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from 'src/auth/local-auth.gaurd';
import { todoDto } from 'src/dtos/tododto';
import { usertodo } from 'src/schema/usertodo.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../decorators/role.enum';
import { ResetPasswordDto } from 'src/dtos/reset.dto';
import { MailService } from 'src/services/mail.service';
import { ForgotPasswordDto } from 'src/dtos/forgot.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/services/upload.service';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { MessagesGateway } from 'src/gateways/messages.gateway';
import { Message } from 'src/schema/message.schema';

@Controller('todos')
export class UsersController {
    constructor(
        private userService: UsersService,
        private authService: AuthService,
        private mailService: MailService,
        private uploadService: UploadService,
        private readonly cloudinaryService: CloudinaryService,
        private MessageGateway:MessagesGateway,
    ) { }

    @Get()
    async get() {
        return this.userService.fetch();
    }

    @Post('create')
    create(@Body() userData: todoDto) {
        return this.userService.create(userData);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.userService.delete(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() userData: updateDto) {
        console.log(userData);
        return this.userService.update(id, userData);
    }
    //all users
    @Get('users')
    @Roles(Role.ADMIN)
    async getUsers() {
        return this.userService.fetchusers();
    }

    //User auth
    //@UseGuards(LocalAuthGuard)
    @Post('login')
    findone(@Body() req: userdto): any {
        console.log('req', req)
        return this.authService.validateuser(req.username, req.password);
    }

    @UseGuards(JwtAuthGuard)
    @Get('protected')
    auth(@Req() req): string {
        return req.user;
    }

    //new user
    @Post('createUser')
    createUser(@Body() data: userdto): any {
        return this.authService.newuser(data);
    }

    ///create user todos
    @Post('/posttodos')
    @Roles(Role.USER)
    @UseGuards(AuthGuard)
    async createTodo(@Req() request: Request, @Body() usertodo: createDto): Promise<usertodo> {
        const user = request['user'] as any
        console.log(user, 'user')
        const id = user.id
        console.log(id)

        const createdTodo = await this.authService.createTodo(id, usertodo);
        return createdTodo;
    }

    ///getusertodoss
    @Get('/usertodos')
    @UseGuards(AuthGuard)
    async usertodos(@Req() request: Request, @Res() response: Response) {
        const user = request['user'] as any;
        const id = user.id
        try {
            const data = await this.userService.getUserTodos(id);
            return response.status(200).json(data)

        } catch (error) {
            throw new NotAcceptableException('Not found', 'cont');
        }
    }

    ///resetPassword
    @Post('forgot-password')
    @UseGuards(AuthGuard)
    async forgotPassword(@Req() request: Request, @Body() forgotPasswordDto: ForgotPasswordDto) {
        const { email } = forgotPasswordDto;
        const req = request.user as any;
        //console.log(request.user)

        const user = await this.userService.findByEmail(email);
        console.log(user)
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const resettoken = this.authService.forgotpassword(req.id, user);
        //console.log((await resettoken).access_token);

        // Send the password reset email
        await this.mailService.sendResetEmail(email, (await resettoken).access_token);
        return ('Email Sent');
    }

    //reset
    @Post('reset-password')
    @UseGuards(AuthGuard)
    async resetPassword(@Req() request: Request, @Body() resetpassworddto: ResetPasswordDto) {
        const token = request.user as any;
        //console.log(token.id)
        const newPassword = resetpassworddto.password;
        const updatedUser = await this.userService.reset(token.id, newPassword)
        return updatedUser;
    }

    /////upload file
    @Post('upload')
    @UseInterceptors(FileInterceptor('File'))
    async uploadFile(@UploadedFile() File: Express.Multer.File): Promise<string> {
        console.log(File)
        if (!File) {
            throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
        }

        try {
            const imageUrl = await this.uploadService.uploadFile(File);
            return imageUrl;
        } catch (error) {
            console.error('Error during file upload:', error);
            throw new HttpException('Failed to upload file. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //////
    @Get('verify-connection')
    async verifyConnection(): Promise<string> {
        const isConnected = await this.cloudinaryService.verifyConnection();
        return isConnected ? 'Cloudinary is connected' : 'Cloudinary connection failed';
    }
}
