import crypto from 'crypto';

const generateMD5Hash = (data) => {
  const hash = crypto.createHash('md5').update(data).digest('hex');
  return hash;
};

// eslint-disable-next-line import/prefer-default-export
export { generateMD5Hash };
