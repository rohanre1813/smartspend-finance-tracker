import Navbar from "./Navbar";

const Layout = ({ children }) => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
  </div>
);

export default Layout;
