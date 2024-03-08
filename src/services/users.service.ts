import { HttpException, HttpStatus, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { todo } from 'src/schema/todo.schema';
import { User } from 'src/schema/user.schema';
import { usertodo } from 'src/schema/usertodo.schema';
import { Cron } from '@nestjs/schedule';


@Injectable()
export class UsersService {
    constructor(
        @InjectModel('Todo') private todoModel: Model<todo>,
        @InjectModel('User') private userModel: Model<User>,
        @InjectModel('userTodo') private usertodo: Model<usertodo>) { }

    //GET ALL todos
    async fetch(): Promise<todo[]> {
        const todo = await this.todoModel.find();
        return todo;
    }
    //Create new todo
    async create(createTodo: todo): Promise<todo> {
        const todo = await this.todoModel.create(createTodo);
        if (!todo) {
            throw new NotAcceptableException('Not found');
        }
        return todo;
    }
    //Delete
    async delete(id: string) {
        const del = await this.todoModel.findByIdAndRemove(id);
        return del;
    }

    //Update
    async update(id: string, todo: todo): Promise<todo> {
        return await this.todoModel.findByIdAndUpdate(id, todo, {
            new: true,
            runValidators: true
        });
    }
    //finduser
    async find(username: string): Promise<User> {
        const user = await this.userModel.findOne({ username }).exec();
        console.log(user, 'service');
        if (!user) {
            throw new NotFoundException('User not found');
        }
        console.log('logged in')
        return user;
    }
    //all users
    async fetchusers(): Promise<User[]> {
        const users = await this.userModel.find();
        return users;
    }
  
    ////
    async createTodo(_id, todo): Promise<any> {
        const user = await this.userModel.findById(_id);
        console.log(user)
        const newTodo = new this.usertodo({ todo, user: _id }).save();

    }

    async getUserTodos(userId: string): Promise<usertodo[]> {
        try {
            const data = await this.usertodo.find({ user: userId }).exec();
            console.log(data)
            return data;
        }
        catch (error) {
            throw new NotAcceptableException('Not found serv ');
        }
    }

    ///////////////////////////////////////////

    async findByEmail(email: string) {
        return this.userModel.findOne({ email: email });
    }

    //reset pass
    async reset(id: string, newPassword: string): Promise<User> {
        const user = await this.userModel.findById(id)
        //console.log(user,newPassword)
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.password = newPassword;
        await user.save();
        console.log(user);
        return user;
    }

    //////////////////////////////////
    @Cron('0 0 * * *') // Runs the job once every day at midnight
    async handleCron() {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Update todos with createdAt older than 24 hours
        await this.todoModel.updateMany(
            { createdAt: { $lte: twentyFourHoursAgo } },
            { status: 'inactive' },
        );
        console.log('Cron job ran successfully!');
    }
}

