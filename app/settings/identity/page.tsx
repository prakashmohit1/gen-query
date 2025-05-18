"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  MoreVertical,
  Check,
  Building2,
  ArrowUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  usersService,
  type User,
  type TeamSignupPayload,
} from "@/lib/services/users";
import { useSession } from "@/contexts/session-context";
import { useToast } from "@/components/ui/use-toast";

type SortField = "email" | "name" | "status" | "role";
type SortOrder = "asc" | "desc";

export default function IdentityPage() {
  const { session } = useSession();
  const { toast } = useToast();
  const user = session?.user;
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmails, setInviteEmails] = useState<string[]>([""]);
  const [isInviting, setIsInviting] = useState(false);
  const [isEditingOrgName, setIsEditingOrgName] = useState(false);
  const [orgName, setOrgName] = useState(user?.team_name || "My Organization");
  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false);
  const [sortField, setSortField] = useState<SortField>("email");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (user?.team_name) {
      setOrgName(user.team_name);
    }
  }, [user?.team_name]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    const compareResult = aValue.localeCompare(bValue);
    return sortOrder === "asc" ? compareResult : -compareResult;
  });

  const handleUpdateOrgName = async () => {
    if (!orgName.trim()) return;

    setIsUpdatingOrg(true);
    try {
      await usersService.updateTeamName(orgName.trim());
      setIsEditingOrgName(false);
      toast({
        title: "Success",
        description: "Team name updated successfully",
      });
    } catch (error) {
      console.error("Error updating organization:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update team name",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingOrg(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await usersService.deleteTeamMember(userToDelete.id);
      await fetchUsers();
      setShowDeleteConfirm(false);
      toast({
        title: "Success",
        description: "User removed successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to remove user",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await usersService.getTeamMembers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch users"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async () => {
    const validEmails = inviteEmails.filter((email) => email.trim() !== "");
    if (validEmails.length === 0) return;

    setIsInviting(true);
    try {
      await usersService.inviteUsers(validEmails);
      await fetchUsers();
      setShowInviteDialog(false);
      setInviteEmails([""]);
      toast({
        title: "Success",
        description: "Invitations sent successfully",
      });
    } catch (error) {
      console.error("Error inviting users:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to invite users",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const addEmailField = () => {
    setInviteEmails([...inviteEmails, ""]);
  };

  const removeEmailField = (index: number) => {
    setInviteEmails(inviteEmails.filter((_, i) => i !== index));
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = value;
    setInviteEmails(newEmails);
  };

  const filteredUsers = sortedUsers.filter(
    (user) =>
      user.email.toLowerCase().includes(filterQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="border-b pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="h-5 w-5 text-gray-500" />
          {isEditingOrgName ? (
            <div className="flex items-center gap-2">
              <Input
                disabled={isUpdatingOrg}
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="max-w-xs"
                autoFocus
                onBlur={handleUpdateOrgName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUpdateOrgName();
                  } else if (e.key === "Escape") {
                    setIsEditingOrgName(false);
                  }
                }}
              />
              {isUpdatingOrg && (
                <span className="text-sm text-gray-500">Updating...</span>
              )}
            </div>
          ) : (
            <h1
              className="text-2xl font-semibold cursor-pointer hover:text-primary-600"
              onDoubleClick={() => setIsEditingOrgName(true)}
            >
              {orgName}
            </h1>
          )}
        </div>
        <p className="text-sm text-gray-500">
          Double click the organization name to edit
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Users</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage users and their access
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Filter users..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>Add user</Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="w-[100px]"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-2 cursor-pointer">
                  Status
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("email")}>
                <div className="flex items-center gap-2 cursor-pointer">
                  Email
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("name")}>
                <div className="flex items-center gap-2 cursor-pointer">
                  Name
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("role")}>
                <div className="flex items-center gap-2 cursor-pointer">
                  Role
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  Loading users...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="text-red-600 mb-2">{error}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUsers()}
                  >
                    Try again
                  </Button>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  {filterQuery
                    ? "No matching users found"
                    : "No users available"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.status === "active" ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-600">
                        <div className="h-2 w-2 rounded-full bg-yellow-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.name || "-"}</TableCell>
                  <TableCell>{user.role || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteUser(user)}
                        >
                          Remove user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Users</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Email addresses
              </label>
              {inviteEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                  />
                  {inviteEmails.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeEmailField(index)}
                      className="shrink-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addEmailField}
                className="w-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add another email
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowInviteDialog(false);
                setInviteEmails([""]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteUser}
              disabled={
                !inviteEmails.some((email) => email.trim() !== "") || isInviting
              }
            >
              {isInviting ? "Inviting..." : "Send invitations"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove User</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to remove {userToDelete?.email}?</p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
