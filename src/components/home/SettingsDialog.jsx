import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [working, setWorking] = useState(false);

  const handleDelete = async () => {
    setWorking(true);
    try {
      // Best-effort: clear local data + log out. Full account deletion requires admin.
      sessionStorage.clear();
      try { localStorage.clear(); } catch {}
      toast.success("Account data cleared. Logging out…");
      setTimeout(() => base44.auth.logout(), 800);
    } catch (e) {
      toast.error("Could not delete account. Contact support.");
      setWorking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setConfirming(false); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <Settings className="w-5 h-5" /> Settings
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Manage your account and preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {!confirming ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Account
            </Button>
          ) : (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 space-y-3">
              <div className="flex items-start gap-2 text-red-200 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>This will erase your local data and log you out. This action cannot be undone.</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="bg-white/5 border-white/20 text-white" onClick={() => setConfirming(false)} disabled={working}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={working}>
                  {working ? "Deleting…" : "Confirm"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="text-[10px] text-slate-500 justify-center mt-2">
          v1.0 — Dice 10,000
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}