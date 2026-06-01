/**
 * Add-on SSO response
 * 3.sdk variant
 */
export type SSO = {
  readonly action: string;
  readonly method: string;
  readonly params: {
    readonly app: string;
    readonly context_app: string;
    readonly email: string;
    readonly id: string;
    readonly 'nav-data': string;
    readonly resource_id: string;
    readonly resource_token: string;
    readonly timestamp: string;
    readonly token: string;
    readonly user_id: string;
    readonly user_scoped_resource_token: string;
  };
};
