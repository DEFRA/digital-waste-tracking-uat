/**
 * Creates or updates an organisation, then returns its API code.
 * Allows the creation of an organisation with a disabled after date in the future or in the past.
 * @param {string} userId - User ID
 * @param {string} organisationId - Organisation ID
 * @param {string} [disabledAfter] - Optional ISO/date string for organisation.disableAfter
 * @returns {Promise<string>} The organisation API code
 */

async function createOrganisationAndGetApiCode(
  userId,
  organisationId,
  disabledAfter
) {
  const organisationResponse =
    await globalThis.apis.wasteOrganisationBackendAPI.createOrUpdateOrganisation(
      userId,
      organisationId,
      disabledAfter
    )

  if (organisationResponse.statusCode !== 200) {
    throw new Error(
      `Failed to create organisation: status ${organisationResponse.statusCode}`
    )
  }

  const apiCodeResponse =
    await globalThis.apis.wasteOrganisationBackendAPI.getAllApiCodesForOrganisation(
      organisationId
    )

  if (apiCodeResponse.statusCode !== 200) {
    throw new Error(
      `Failed to get API codes for organisation: status ${apiCodeResponse.statusCode}`
    )
  }

  return apiCodeResponse.json.apiCodes[0].code
}

export { createOrganisationAndGetApiCode }
