export type GameResponseType = {
  __typename: string;
  conceptId: string;
  entitlementId: string;
  image: {
    __typename: string;
    url: string;
  };
  isActive: boolean;
  lastPlayedDateTime: string;
  name: string;
  platform: string;
  productId: string;
  subscriptionService: string;
  titleId: string;
};
