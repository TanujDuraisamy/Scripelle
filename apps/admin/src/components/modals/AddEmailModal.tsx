import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/types/handleHttp";

interface AddEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchUsers: () => void;
}

export const AddEmailModal = ({
  open,
  onOpenChange,
  fetchUsers,
}: AddEmailModalProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAddEmail = async () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const url = "admin/beta/add";
    const res = await auth({
      url,
      method: "POST",
      data: { email },
    });
    setLoading(false);
    if (res.type === "success") {
      fetchUsers();
      toast({
        title: "Success",
        description: "Email added successfully",
      });
      setEmail("");
      onOpenChange(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to add email",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    try {
      setCsvLoading(true);

      const text = await file.text();
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line);

      const emails: string[] = [];
      const startIndex = lines[0]?.toLowerCase().includes("email") ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const email = lines[i].split(",")[0]?.trim();
        if (email && email.includes("@")) {
          emails.push(email);
        }
      }

      if (emails.length === 0) {
        toast({
          title: "No Valid Emails",
          description: "No valid email addresses found in the CSV file",
          variant: "destructive",
        });
        return;
      }

      const payload = {
        emails: emails,
      };

      const url = "admin/beta/add-multiple";
      const res = await auth({
        url,
        method: "POST",
        data: payload,
      });

      if (res.type === "success") {
        toast({
          title: "Success",
          description: `${emails.length} email(s) imported successfully`,
        });
        fetchUsers();
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to import emails",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process CSV file",
        variant: "destructive",
      });
    } finally {
      setCsvLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "email\nexample@email.com";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Email</DialogTitle>
          <DialogDescription>
            Add a new email address or import from CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddEmail();
                }
              }}
            />
          </div>

          <Button
            onClick={handleAddEmail}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Adding..." : "Add Email"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={csvLoading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {csvLoading ? "Importing..." : "Import CSV"}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-[#fbfbfb] hover:underline"
              >
                Download format template
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
