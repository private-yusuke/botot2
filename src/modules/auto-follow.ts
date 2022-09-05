import IModule from "../module";
import MessageLike from "../message-like";
import Ai from "../ai";
import { User } from "../misskey";

export default class AutoFollowModule implements IModule {
  public readonly priority = 0;
  public readonly name = "autoFollow";
  private ai!: Ai;

  public install(ai: Ai) {
    this.ai = ai;
  }

  public onFollowed(user: User) {
    this.follow(user);
  }

  async follow(user: User) {
    try {
      const res = await this.ai.api("following/create", {
        userId: user.id,
      });
      const json = (await res.json()) as { error?: unknown }; // Force convert to { error?: unknown }
      if (json.error)
        console.log(`Following ${user.name}(@${user.username}): ${json.error}`);
      else console.log(`Followed user ${user.name}(@${user.username})`);
      return true;
    } catch (e) {
      console.error(`Failed to follow ${user.name}(@${user.username})`);
      return false;
    }
  }
}
