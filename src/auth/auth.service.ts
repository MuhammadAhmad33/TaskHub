import { Body, Injectable, NotAcceptableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/services/users.service';
import { jwtConstants } from './constants';
import { User } from 'src/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { usertodo } from 'src/schema/usertodo.schema';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        @InjectModel('User') private userModel: Model<User>,
        @InjectModel('userTodo') private usertodo: Model<usertodo>
    ) { }

    async validateuser(username: string, password: string): Promise<any> {
        const user = await this.usersService.find(username);
        console.log(user, 'auth');
        if (user.password === password) {
            const payload = { sub: user.id, username: user.username };
            console.log(payload)
            return {
                access_token: this.jwtService.sign(payload, { expiresIn: '60s', secret: jwtConstants.secret }),
            };
        }
    }
    
    async newuser(createuser: User): Promise<any> {
        const user = await this.userModel.create(createuser);
        console.log(user)
        const payload = { id:user._id ,role: user.role };
            console.log(payload)
            return {
                access_token: this.jwtService.sign(payload, {secret: jwtConstants.secret }),
            };
        
        }
    

    async createTodo(_id, todo): Promise<any> {
        const user = await this.userModel.findById(_id);
        console.log(user)
        const newTodo = new this.usertodo({ todo, user: _id }).save();
        const payload = {id:_id };
        return {
            access_token: this.jwtService.sign(payload, { secret: jwtConstants.secret }),
        };

    }
    async forgotpassword(id,user: User){
        const payload={id:id, email:user.email}      
        //console.log(payload)
        return {
            access_token: this.jwtService.sign(payload, { secret: jwtConstants.secret }),
        };
    }
}


