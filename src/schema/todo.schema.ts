import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema(
    { timestamps: true }
)
export class todo {
    @Prop()
    id: string;
    @Prop()
    todo: string;
    @Prop({ default: 'active' })
    status: string;

}
export const todoSchema = SchemaFactory.createForClass(todo)