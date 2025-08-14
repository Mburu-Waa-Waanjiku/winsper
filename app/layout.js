import { Josefin_Sans } from "next/font/google"
import "./globals.css"

const josefinSans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
})

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${josefinSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
