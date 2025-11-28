import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const token = params.get("token") || "";
  const { toast } = useToast();
  const navigate = useNavigate();

  const m = useMutation({
    mutationFn: () => apiPost<{ status: string }, { token: string; password: string }>("/api/auth/reset", { token, password }),
    onSuccess: () => { toast({ title: "Password updated" }); navigate("/signin"); },
    onError: () => toast({ title: "Reset failed", variant: "destructive" })
  });

  const canSubmit = token && password && confirm && password === confirm && password.length >= 6;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg shadow-card p-8">
            <h1 className="text-2xl font-bold mb-4">Create New Password</h1>
            <form onSubmit={(e)=>{ e.preventDefault(); if (canSubmit) m.mutate(); }} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">New Password</label>
                <Input type="password" placeholder="Enter new password" value={password} onChange={(e)=> setPassword(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Confirm Password</label>
                <Input type="password" placeholder="Confirm password" value={confirm} onChange={(e)=> setConfirm(e.target.value)} />
              </div>
              <Button className="w-full" disabled={!canSubmit || m.isPending}>{m.isPending?"Updating...":"Update Password"}</Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
