import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/Resellerstore";

export default function AddSourceOfTruthPopup({ open, setOpen, onSuccess }: { open: boolean; setOpen: (open: boolean) => void; onSuccess?: () => void }) {
  const [sourceName, setSourceName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userid=useSelector((state:RootState)=>state.Main.userid)
  const handleSubmit = async () => {
    if (!sourceName.trim()) {
      toast("Please enter a source name");
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Sourceoftruth/createsource`, {
        name: sourceName.trim(),
        userid
      });
      toast.success("Source of Truth added");
      setSourceName("");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Failed to add source of truth");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm p-4">
        <DialogHeader>
          <DialogTitle>Add Source of Truth</DialogTitle>
        </DialogHeader>
        <label className="block text-sm font-medium mb-2">Source Name</label>
        <input
          className="w-full p-2 border rounded mb-4"
          placeholder="e.g. Instagram, Google, etc."
          value={sourceName}
          onChange={e => setSourceName(e.target.value)}
          disabled={isSubmitting}
        />
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full relative">
          {isSubmitting ? (
            <>
              <span className="opacity-0">Add</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              </div>
            </>
          ) : (
            "Add"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
