import * as crypto from 'crypto';

export default function getRandomBytes(n: number): Promise<Buffer> {
  /**
   * This function is creating random bytes in n number bytes length
   */
  return new Promise((resolve, reject) => {
    crypto.randomBytes(n, (error, result) => {
      error ? reject(error) : resolve(result);
    });
  });
}
