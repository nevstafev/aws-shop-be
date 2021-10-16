import { PolicyDocument } from 'aws-lambda';
import 'source-map-support/register';

const generatePolicy = (
  principalId: string,
  resource,
  effect: string
): { principalId: string; policyDocument: PolicyDocument } => ({
  principalId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      { Action: 'execute-api:Invoke', Effect: effect, Resource: resource },
    ],
  },
});

export const basicAuthorizer = async (event, _context, callback) => {
  console.log(event);
  if (event.type !== 'TOKEN') {
    callback('Unauthorized');
  }

  try {
    const { authorizationToken } = event;
    const [_, encodedCredentials] = authorizationToken.split(' ');
    const buff = Buffer.from(encodedCredentials, 'base64');
    const [username, password] = buff.toString('utf-8').split(':');

    const storedUserPassword = process.env[username];
    const effect =
      !storedUserPassword || storedUserPassword !== password ? 'Deny' : 'Allow';
    const policy = generatePolicy(username, event.methodArn, effect);

    callback(null, policy);
  } catch (e) {
    callback('Unauthorized');
  }
};
