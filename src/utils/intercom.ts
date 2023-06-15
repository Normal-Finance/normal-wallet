import hmacSHA256 from 'crypto-js/hmac-sha256';
import { INTERCOM } from 'src/config-global';

export default function createUserHash(userId: string) {
  return hmacSHA256(userId, INTERCOM.privateKey).toString();
}
