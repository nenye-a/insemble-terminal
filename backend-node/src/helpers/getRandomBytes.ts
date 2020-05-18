import * as crypto from 'crypto';

export default function getRandomBytes(n: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(n, (error, result) => {
      error ? reject(error) : resolve(result);
    });
  });
}
