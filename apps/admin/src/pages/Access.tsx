import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  CircleParking,
  Plus,
  Upload,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { AddEmailModal } from "@/components/modals/AddEmailModal";
import { auth } from "@/types/handleHttp";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const Access = () => {
  const [isAddEmailOpen, setIsAddEmailOpen] = useState(false);
  const [users, setUsers] = useState<Array<{ id: number; email: string; approved: boolean; createdAt: string }>>([]);
  const { toast } = useToast();

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

  const fetchList = async () => {
    const url = "admin/beta/list";
    const res = await auth<{ data: Array<{ id: number; email: string; approved: boolean; createdAt: string }> }>({
      method: "GET",
      url,
    });
    if (res.type === "success") {
      setUsers(res.data?.data || []);
    }
  };

  const handleDelete = async (email: string) => {
    const url = `admin/beta/remove/${email}`;
    const res = await auth<{ data: Array<{ id: number; email: string; approved: boolean; createdAt: string }> }>({
      method: "DELETE",
      url,
    });
    if (res.type === "success") {
      fetchList();
      toast({
        title: "Email Removed",
        description: "The email has been successfully removed",
        variant: "default",
      });
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Access Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Add and manage email access
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => setIsAddEmailOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Email
          </Button>

          {/* <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={handleDownloadTemplate}
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button> */}
        </div>

        <div className="mt-8 bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Email Access List
          </h2>
          {users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.approved ? "default" : "secondary"}
                        className={
                          user.approved ? "bg-green-500 hover:bg-green-600" : ""
                        }
                      >
                        {user.approved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDelete(user.email)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No emails added yet.
            </div>
          )}
        </div>

        <div className="mt-8 bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Import Instructions
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>To import emails via CSV:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Download the CSV template using the button above</li>
              <li>Add email addresses (one per row)</li>
              <li>Click "Import CSV" and select your file</li>
            </ol>
            <p className="mt-4">
              <button
                onClick={handleDownloadTemplate}
                className="hover:underline text-[#fbfbfb]"
              >
                Download format template
              </button>
            </p>
          </div>
        </div>
      </div>

      <AddEmailModal
        open={isAddEmailOpen}
        onOpenChange={setIsAddEmailOpen}
        fetchUsers={fetchList}
      />
    </AdminLayout>
  );
};

export default Access;
