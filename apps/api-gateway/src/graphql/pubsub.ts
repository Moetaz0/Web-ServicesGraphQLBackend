import { PubSub } from 'graphql-subscriptions';

export const pubSub = new PubSub();

export const GQL_EVENTS = {
  NOTIFICATION_ADDED: 'notificationAdded',
  GPS_POSITION_ADDED: 'gpsPositionAdded',
  INCIDENT_DECLARED: 'incidentDeclared',
  INCIDENT_STATUS_UPDATED: 'incidentStatusUpdated',
};
