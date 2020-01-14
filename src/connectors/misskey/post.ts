import { IPost } from "../interface/post";
import { MisskeyUser } from "./user";

export class MisskeyPost implements IPost<MisskeyUser> {
    constructor(
        public text: string,
        public user: MisskeyUser,
    ) {
        
    }
}