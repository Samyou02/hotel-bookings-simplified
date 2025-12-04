import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type SignInResponse = {
  token: string;
  user: {
    id: number;
    email: string;
    role: "admin" | "user" | "owner";
    isApproved?: boolean;
    blocked?: boolean;
  };
};

const SignIn = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const { toast } = useToast()
  const [show, setShow] = useState(false)
  const mutation = useMutation({ mutationFn: () => apiPost<SignInResponse, { email: string; password: string }>("/api/auth/signin", { email, password }) ,
    onSuccess: (data) => {
      localStorage.setItem("auth", JSON.stringify(data))
      const role = data.user.role
      toast({ title: "Signed in", description: role })
      if (role === "admin") {
        navigate("/dashboard/admin")
        return
      }
      if (role === "owner") {
        navigate("/dashboard/owner")
        return
      }
      try {
        const r = localStorage.getItem('postLoginRedirect') || ''
        if (r) {
          localStorage.removeItem('postLoginRedirect')
          navigate(r)
          return
        }
      } catch (_e) { void 0 }
      navigate("/dashboard/user")
    },
    onError: (err) => {
      const msg = err instanceof Error ? String(err.message || '') : ''
      try { localStorage.removeItem('auth') } catch { /* ignore */ }
      const lower = msg.toLowerCase()
      if (lower.includes('account deleted') || lower.includes('deleted')) {
        toast({ title: "Sign in failed", description: "Your account has been deleted", variant: "destructive" })
      } else if (lower.includes('blocked')) {
        toast({ title: "Sign in failed", description: "Your account is blocked", variant: "destructive" })
      } else if (lower.includes('email not registered') || lower.includes('not registered')) {
        toast({ title: "Sign in failed", description: "Account not registered. Please sign up and then sign in", variant: "destructive" })
      } else if (lower.includes('invalid credentials') || lower.includes('invalid')) {
        toast({ title: "Sign in failed", description: "Invalid credentials", variant: "destructive" })
      } else {
        toast({ title: "Sign in failed", description: msg || "Try again later", variant: "destructive" })
      }
    }
  })
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {(() => {
              const env = (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> })?.env) || {} as Record<string, string>
              const logo = env?.VITE_LOGO_URL || "/logo.svg";
              return <img src={logo} alt="Sana Stayz" className="h-12 w-12 mx-auto mb-4 rounded-full object-cover" onError={(e)=>{ e.currentTarget.src = "https://placehold.co/96x96?text=S" }} />
            })()}
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to access your bookings and more
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-card p-8">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="relative">
                <label className="text-sm font-medium mb-2 block">Password</label>
                <Input type={show?"text":"password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="absolute right-3 top-[52px] text-muted-foreground" onClick={()=>setShow(!show)}>{show? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label htmlFor="remember" className="text-sm cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link to={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`} className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button className="w-full" disabled={mutation.isPending}>{mutation.isPending ? "Signing in..." : "Sign In"}</Button>
              {mutation.isError && (()=>{ const m = mutation.error instanceof Error ? String(mutation.error.message||'') : ''; const lower = m.toLowerCase(); const txt = lower.includes('deleted') ? 'Sign in failed: your account has been deleted' : (lower.includes('blocked') ? 'Sign in failed: your account is blocked' : (lower.includes('email not registered') || lower.includes('not registered') ? 'Sign in failed: account not registered — please sign up and then sign in' : (lower.includes('invalid credentials') || lower.includes('invalid') ? 'Sign in failed: invalid credentials' : 'Sign in failed'))); return (<div className="text-red-600 text-sm">{txt}</div>) })()}
              {mutation.isSuccess && <div className="text-green-600 text-sm">Signed in</div>}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignIn;
