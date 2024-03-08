import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "./user.schema";
import{Schema as MongooseSchema} from'mongoose'

@Schema({ timestamps: true })
export class usertodo {
  @Prop()
  todo: string ;   

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'user' }] })
  user: User | string;
}


export const usertodoSchema=SchemaFactory.createForClass(usertodo)