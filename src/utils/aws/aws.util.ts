import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { DescribeServicesCommand, ECSClient, ListServicesCommand } from '@aws-sdk/client-ecs';
import { CacheFactory } from '@cache';

export function stackName(serverName: string) {
  return `ezmc-${serverName}`;
}

/**
 * Gets the arn of the first service for the given cluster
 * @param clusterName
 * @returns service arn
 */
export async function serviceArn(clusterName: string) {
  const cache = await CacheFactory.getInstance();
  const client = new ECSClient({ region: cache.aws.region });
  const arn = await clusterArn(clusterName);
  return client.send(new ListServicesCommand({ cluster: arn })).then((res) => {
    return res.serviceArns?.[0] || '';
  });
}

export function clusterName(serverName: string) {
  return `ezmc-${serverName}-cluster`;
}

/**
 * @param serverName
 * @returns arn for this region/account for the given cluster
 */
export async function clusterArn(serverName: string) {
  const cache = await CacheFactory.getInstance();
  return `arn:aws:ecs:${cache.aws.region}:${cache.aws.accountId}:cluster/${clusterName(serverName)}`;
}

export function serviceName(serverName: string) {
  return `ezmc-${serverName}-ecs-service`;
}

export const stackExists = async (serverName: string) => {
  try {
    const cache = await CacheFactory.getInstance();
    const client = new CloudFormationClient({ region: cache.aws.region });
    const response = await client.send(
      new DescribeStacksCommand({
        StackName: 'ezmc-' + serverName,
      }),
    );

    if (response.Stacks && response.Stacks.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error: any) {
    if (error.name === 'ValidationError' && error.message.includes('does not exist')) {
      return false;
    } else {
      throw error;
    }
  }
};

export async function serviceExists(serverName) {
  const cache = await CacheFactory.getInstance();
  const client = new ECSClient({ region: cache.aws.region });
  return client
    .send(
      new DescribeServicesCommand({
        cluster: clusterName(serverName),
        services: [serviceName(serverName)],
      }),
    )
    .then((res) => res?.services?.length > 0);
}

const checkStackStatus = async (stackName: string) => {
  const client = new CloudFormationClient({ region: 'us-east-1' });

  try {
    const command = new DescribeStacksCommand({ StackName: stackName });
    const response = await client.send(command);

    if (response.Stacks && response.Stacks.length > 0) {
      const stackStatus = response.Stacks[0].StackStatus || 'UNKNOWN';
      const rollbackStates = [
        'ROLLBACK_IN_PROGRESS',
        'ROLLBACK_COMPLETE',
        'ROLLBACK_FAILED',
        'UPDATE_ROLLBACK_IN_PROGRESS',
        'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS',
        'UPDATE_ROLLBACK_FAILED',
        'UPDATE_ROLLBACK_COMPLETE',
      ];

      if (stackStatus === 'DELETE_FAILED' || rollbackStates.includes(stackStatus)) {
        return stackStatus;
        // Handle the error or rollback accordingly
      } else {
        return 'HEALTHY';
      }
    } else {
      return 'UNKNOWN';
    }
  } catch (error) {
    return 'UNKNOWN';
  }
};
