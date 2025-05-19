import crypto from 'crypto';

const cryptoToken = (length: number=32) => {
  return crypto.randomBytes(length).toString('hex');
};
export default cryptoToken;