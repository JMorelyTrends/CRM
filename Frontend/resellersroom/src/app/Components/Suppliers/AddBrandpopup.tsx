import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/Resellerstore";

export default function AddBrandpopup({ open, setOpen, onSuccess }: { open: boolean; setOpen: (open: boolean) => void; onSuccess?: () => void }) {
  const userid = useSelector((state: RootState) => state.Main.userid);
  const [supplierName, setSupplierName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!supplierName.trim()) {
      toast("Please enter a supplier name");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Brands/createBrands`, {
        name: supplierName.trim(),
        userid
      });
      if (res.data?.message === "Brand already exists") {
        toast("Brand already exists");
      } else {
        toast.success("Supplier added");
      }
      setSupplierName("");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch {
      toast.error("Failed to add supplier");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm p-4">
        <DialogHeader>
          <DialogTitle>Add Supplier</DialogTitle>
        </DialogHeader>
        <label className="block text-sm font-medium mb-2">Brand Name</label>
        <input
          className="w-full p-2 border rounded mb-4"
          placeholder="e.g. Nike, Adidas, etc."
          value={supplierName}
          onChange={e => setSupplierName(e.target.value)}
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
