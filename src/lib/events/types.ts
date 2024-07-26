export type SalesforceAuthExtra = {
  readonly redirect_uri: string
}

export type SalesforceAuthParams = {
  readonly org_name: string
  readonly url?: null | string
}

// Currently, we only support Salesforce Platform authorizations. In the future we may add more platforms.
export type Authorization = {
  readonly extra?: SalesforceAuthExtra
  readonly id: string
  readonly params: SalesforceAuthParams
  readonly platform: 'salesforce'
}
