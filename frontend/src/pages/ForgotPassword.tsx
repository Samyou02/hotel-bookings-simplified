import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const initialEmail = params.get('email') || ""
  const [email, setEmail] = useState(initialEmail);
  const { toast } = useToast();
  const m = useMutation({
    mutationFn: () => apiPost<{ status: string; link?: string }, { email: string }>("/api/auth/forgot", { email }),
    onSuccess: (_data) => {
      toast({ title: "Email sent", description: "Check your inbox for the reset link" })
    },
    onError: (err) => {
      const msg = err instanceof Error ? String(err.message || '') : ''
      const lower = msg.toLowerCase()
      if (lower.includes('not registered')) {
        toast({ title: "Email not registered", description: "Please sign up first", variant: "destructive" })
      } else {
        toast({ title: "Failed to send", variant: "destructive" })
      }
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg shadow-card p-8">
            <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
            <form onSubmit={(e)=>{ e.preventDefault(); m.mutate(); }} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input type="email" placeholder="your@email.com" value={email} onChange={(e)=> setEmail(e.target.value)} />
              </div>
              <Button className="w-full" disabled={m.isPending}>{m.isPending?"Sending...":"Send Reset Link"}</Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
