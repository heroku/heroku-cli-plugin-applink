/**
 * Add-on SSO response
 * 3.sdk variant
 */
export type SSO = {
  readonly method: string;
  readonly action: string;
  readonly params: {
    readonly email: string;
    readonly user_id: string;
    readonly app: string;
    readonly context_app: string;
    readonly timestamp: string;
    readonly 'nav-data': string;
    readonly id: string;
    readonly token: string;
    readonly resource_id: string;
    readonly resource_token: string;
    readonly user_scoped_resource_token: string;
  };
};
