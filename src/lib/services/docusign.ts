import * as docusign from 'docusign-esign'
import path from 'path'
import fs from 'fs'

export async function sendDocuSignEnvelope(email: string, name: string) {
  const apiClient = new docusign.ApiClient()
  apiClient.setBasePath(process.env.DOCUSIGN_BASE_URL!)
  apiClient.setOAuthBasePath('account-d.docusign.com')

  const privateKey = Buffer.from(process.env.DOCUSIGN_PRIVATE_KEY!, 'base64').toString()

  const results = await apiClient.requestJWTUserToken(
    process.env.DOCUSIGN_INTEGRATOR_KEY!,
    process.env.DOCUSIGN_API_USER_ID!,
    ['signature', 'impersonation'],
    privateKey,
    3600
  )

  const accessToken = results.body.access_token
  apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken)

  const envelopesApi = new docusign.EnvelopesApi(apiClient)
  const envelopeDefinition = new docusign.EnvelopeDefinition()

  envelopeDefinition.emailSubject = 'Contrato de Cotización - Rivas Technologies'
  envelopeDefinition.status = 'sent'

  const docBytes = fs.readFileSync(path.resolve('public/doc_template.pdf'))
  const docBase64 = docBytes.toString('base64')

  const document = new docusign.Document()
  document.documentBase64 = docBase64
  document.name = 'Contrato'
  document.fileExtension = 'pdf'
  document.documentId = '1'

  const signer = docusign.Signer.constructFromObject({
    email,
    name,
    recipientId: '1',
    routingOrder: '1',
    tabs: {
      signHereTabs: [
        {
          anchorString: '/firma/',
          anchorUnits: 'pixels',
          anchorYOffset: '10',
          anchorXOffset: '20',
        },
      ],
    },
  })

  const recipients = new docusign.Recipients()
  recipients.signers = [signer]

  envelopeDefinition.recipients = recipients
  envelopeDefinition.documents = [document]

  const envelope = await envelopesApi.createEnvelope(process.env.DOCUSIGN_ACCOUNT_ID!, {
    envelopeDefinition,
  })

  return envelope
}
