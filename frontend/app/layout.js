import "./globals.css";
import AuthNav from "./components/AuthNav";

export const metadata = {
  title: "Service Request Board",
  description: "Mini Service Request Board for homeowners and tradespeople",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="top-navbar">
          <div className="nav-container">
            <a href="/" className="brand">
              <span className="brand-icon">⌂</span>
              <span>Service Request Board</span>
            </a>

            <AuthNav />
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}