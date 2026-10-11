import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/types/handleHttp";
import { Check, X, Loader2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  status?: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const url = "admin/user/list";
    setLoading(true);
    const res = await auth<{ data: User[] }>({
      method: "GET",
      url,
    });
    setLoading(false);

    if (res.type === "success") setUsers(res.data.data || []);
  };

  const accpetUser = async (userId: string) => {
    const url = `admin/beta/approve/${userId}`;
    setActionLoading(userId);
    const res = await auth<{ data: User[] }>({
      method: "POST",
      url,
    });
    setActionLoading(null);
    if (res.type === "success") {
      toast({
        title: "User accepted",
        description: "The user has been accepted successfully.",
      });
      fetchUsers();
    } else {
      toast({
        title: "Error",
        description: "Failed to accept user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const rejectUser = async (userId: string) => {
    const url = `admin/beta/reject/${userId}`;
    setActionLoading(userId);
    const res = await auth<{ data: User[] }>({
      method: "POST",
      url,
    });
    setActionLoading(null);
    if (res.type === "success") {
      toast({
        title: "User rejected",
        description: "The user has been rejected successfully.",
      });
      fetchUsers();
    } else {
      toast({
        title: "Error",
        description: "Failed to reject user. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-2">
            Manage all registered users
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading users...</div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-12 text-center text-muted-foreground"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-foreground">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.status === "approved" ? (
                              <Badge
                                variant="default"
                                className="bg-green-500 hover:bg-green-600"
                              >
                                Approved
                              </Badge>
                            ) : user.status === "rejected" ? (
                              <Badge
                                variant="destructive"
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Rejected
                              </Badge>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => accpetUser(user.id)}
                                  disabled={actionLoading === user.id}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {actionLoading === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => rejectUser(user.id)}
                                  disabled={actionLoading === user.id}
                                >
                                  {actionLoading === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <X className="h-4 w-4" />
                                  )}
                                  Reject
                                </Button>
                              </div>
                            )}

                            {/* Three-dot menu for status changes */}
                            {(user.status === "approved" ||
                              user.status === "rejected") && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {user.status === "approved" ? (
                                    <DropdownMenuItem
                                      onClick={() => rejectUser(user.id)}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Reject
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => accpetUser(user.id)}
                                      className="text-green-600 focus:text-green-600"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Approve
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Users;
