import { IPost } from "./post"
import { IUser } from "./user"

export interface IClient<User extends IUser, Post extends IPost<User>> {
	host: string

	post(options: { text: string; files: Blob[]; replyTo: Post }): Promise<Post>

	getProfile(): Promise<User>
}
