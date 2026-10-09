import { describe, it, expect, beforeEach } from '@jest/globals'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Sync clients from DWT Client Sync Service', () => {
  beforeEach(async () => {
    await addAllureLink('/DWTA-335', 'DWTA-335', 'jira')
  })

  describe('Successful sync with cognito service to get client details', () => {
    it(
      'should return 200 when clients are synced' +
        ' @allure.label.tag:DWTA-335',
      async () => {
        const { statusCode } =
          await globalThis.apis.wasteMovementClientSyncAPI.syncClients()
        // Unable to test anything other than the status code as the CDP cognito service is a blackbox
        expect(statusCode).toBe(200)
      }
    )
  })
})
