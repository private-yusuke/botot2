import { IUser } from "./user";

export interface IPost<User extends IUser> {
    text: string
    user: User
}