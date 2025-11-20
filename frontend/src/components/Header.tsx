import { useState } from "react";
import { Hotel, User, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/hotels", label: "Hotels" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  const hideNavLinks = pathname.startsWith("/dashboard/admin") || pathname.startsWith("/dashboard/owner")

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Hotel className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">StayBook</span>
        </Link>

        {!hideNavLinks && (
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center space-x-4">
          {(() => {
            let authed = false;
            try {
              const raw = localStorage.getItem("auth");
              authed = !!(raw && JSON.parse(raw)?.token);
            } catch {
              authed = false;
            }
            if (authed) {
              return (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex"
                  onClick={() => {
                    localStorage.removeItem("auth");
                    navigate("/signin");
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              );
            }
            return (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex"
                  onClick={() => navigate("/signin")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="hidden md:flex"
                  onClick={() => navigate("/register")}
                >
                  Register
                </Button>
              </>
            );
          })()}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {!hideNavLinks && navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t space-y-3">
                  {(() => {
                    let authed = false;
                    try {
                      const raw = localStorage.getItem("auth");
                      authed = !!(raw && JSON.parse(raw)?.token);
                    } catch {
                      authed = false;
                    }
                    if (authed) {
                      return (
                        <Button
                          className="w-full"
                          onClick={() => {
                            localStorage.removeItem("auth");
                            setIsOpen(false);
                            navigate("/signin");
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      );
                    }
                    return (
                      <>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            navigate("/signin");
                            setIsOpen(false);
                          }}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Sign In
                        </Button>
                        <Button
                          className="w-full"
                          onClick={() => {
                            navigate("/register");
                            setIsOpen(false);
                          }}
                        >
                          Register
                        </Button>
                      </>
                    );
                  })()}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
