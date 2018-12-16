import Visibility from './visibility'
import Timeline from './timeline'
import User from './user'
import Reaction from './reaction'
import Channel from './channel'
import config from '../config';

function generateUserId(user: User) {
  let res: string = user.username
  if(user.hostLower) res += `@${user.hostLower}`
  else res += `@${config.host}`
  return res
}

export {
  Visibility,
  Timeline,
  User,
  Reaction,
  Channel,
  generateUserId
}