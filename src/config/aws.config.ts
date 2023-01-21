// import * as dotenv from 'dotenv';
import { config } from 'aws-sdk';

// dotenv.config();

export const AWSConfig = () => {
  config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });
};
