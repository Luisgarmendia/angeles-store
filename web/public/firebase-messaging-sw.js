importScripts("https://www.gstatic.com/firebasejs/13.1.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/13.1.0/firebase-messaging-compat.js")
importScripts("/firebase-config")

if (self.FIREBASE_CONFIG) {
  firebase.initializeApp(self.FIREBASE_CONFIG)
  const messaging = firebase.messaging()

  messaging.onBackgroundMessage((payload) => {
    const notification = payload.notification || {}
    const data = payload.data || {}

    self.registration.showNotification(notification.title || "Nuevo pedido", {
      body: notification.body || "",
      data: { url: data.url || "/admin/pedidos" },
    })
  })
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const data = event.notification.data || {}
  const target = new URL(data.url || "/admin/pedidos", self.location.origin)

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (new URL(client.url).pathname === target.pathname && "focus" in client) {
          return client.focus()
        }
      }

      return self.clients.openWindow ? self.clients.openWindow(target.href) : undefined
    }),
  )
})
