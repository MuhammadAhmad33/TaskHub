import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class User {
  @Prop()
  id: string;

  @Prop({ unique: true }) // Make the username field unique
  username: string;

  @Prop()
  password: string;

  @Prop()
  email: string;

  @Prop()
  role: string;
}

export const userSchema = SchemaFactory.createForClass(User);
