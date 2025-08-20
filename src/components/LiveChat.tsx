"use client"
import { useSession } from "next-auth/react"
import Script from "next/script"

export default function LiveChat() {
  const { data: session } = useSession()

  const userName = session?.user?.name || "Invitado"
  const userEmail = session?.user?.email || ""

  return (
    <>
      {/* Script oficial de Zendesk Messaging */}
      <Script
        id="ze-snippet"
        src={`https://static.zdassets.com/ekr/snippet.js?key=${process.env.NEXT_PUBLIC_ZENDESK_KEY}`}
        strategy="afterInteractive"
      />

      {/* Prefill dinámico con datos del usuario */}
      <Script id="zendesk-user" strategy="afterInteractive">
        {`
          function setZendeskUser() {
            if (window.zE) {
              window.zE('webWidget', 'prefill', {
                name: { value: "${userName}", readOnly: true },
                email: { value: "${userEmail}", readOnly: true }
              });
            } else {
              setTimeout(setZendeskUser, 500);
            }
          }
          setZendeskUser();
        `}
      </Script>
    </>
  )
}
