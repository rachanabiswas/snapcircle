"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  SearchIcon,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import { Input } from "@/components/shadcnui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcnui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcnui/table";
import { toast } from "@/components/shadcnui/toast";

const PAGE_SIZE = 10;

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
};

const UsersTable = () => {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      const { data, error } = await authClient.admin.listUsers({
        query: {
          limit: PAGE_SIZE,
          offset,
          searchValue: search || undefined,
          searchField: "name",
          searchOperator: "contains",
        },
      });

      if (ignore) {
        return;
      }

      if (error) {
        toast.add({
          title: "Failed to load users",
          description: error.message,
          type: "error",
        });
      } else if (data) {
        setUsers(data.users);
        setTotal(data.total);
      }
      setIsLoading(false);
    };

    load();

    return () => {
      ignore = true;
    };
  }, [offset, search]);

  const runAction = async (
    action: () => Promise<{ error: unknown }>,
    onSuccess: () => void,
  ) => {
    const { error } = await action();
    if (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error ?
          String((error as { message: string }).message)
        : "Something went wrong";
      toast.add({
        title: "Action failed",
        description: message,
        type: "error",
      });
    } else {
      onSuccess();
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    setSearch(searchInput.trim());
    setOffset(0);
  };

  const handleRoleChange = async (userId: string, role: "user" | "admin") => {
    setPendingUserId(userId);
    await runAction(
      () => authClient.admin.setRole({ userId, role }),
      () => {
        toast.add({
          title: "Role updated",
          description: `User role set to ${role}`,
          type: "success",
        });
        setIsLoading(true);
        setOffset(0);
      },
    );
    setPendingUserId(null);
  };

  const handleBanToggle = async (user: AdminUser) => {
    setPendingUserId(user.id);
    if (user.banned) {
      await runAction(
        () => authClient.admin.unbanUser({ userId: user.id }),
        () => {
          toast.add({
            title: "User unbanned",
            description: `${user.name} can sign in again`,
            type: "success",
          });
          setIsLoading(true);
        },
      );
    } else {
      await runAction(
        () =>
          authClient.admin.banUser({
            userId: user.id,
            banReason: "Banned by admin",
          }),
        () => {
          toast.add({
            title: "User banned",
            description: `${user.name} was banned`,
            type: "success",
          });
          setIsLoading(true);
        },
      );
    }
    setPendingUserId(null);
  };

  const handleDelete = async (user: AdminUser) => {
    if (!window.confirm(`Delete user "${user.name}" permanently?`)) {
      return;
    }
    setPendingUserId(user.id);
    await runAction(
      () => authClient.admin.removeUser({ userId: user.id }),
      () => {
        toast.add({
          title: "User deleted",
          description: `${user.name} was removed`,
          type: "success",
        });
        if (users && users.length === 1 && offset > 0) {
          setOffset(Math.max(0, offset - PAGE_SIZE));
        } else {
          setIsLoading(true);
        }
      },
    );
    setPendingUserId(null);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search by name"
          className="max-w-xs"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleSearch}
          disabled={isLoading}>
          <SearchIcon aria-hidden="true" />
          Search
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users === null ?
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center">
                  <Loader2Icon
                    className="mx-auto animate-spin"
                    aria-hidden="true"
                  />
                </TableCell>
              </TableRow>
            : users.length === 0 ?
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-24 text-center">
                  No users found
                </TableCell>
              </TableRow>
            : users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role === "admin" ? "admin" : "user"}
                      onValueChange={(value) =>
                        handleRoleChange(
                          user.id,
                          (value ?? "user") as "user" | "admin",
                        )
                      }>
                      <SelectTrigger
                        size="sm"
                        disabled={pendingUserId === user.id}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">user</SelectItem>
                        <SelectItem value="admin">admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {user.banned ?
                      <Badge variant="destructive">Banned</Badge>
                    : <Badge variant="secondary">Active</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.banned ?
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleBanToggle(user)}
                          disabled={pendingUserId === user.id}>
                          Unban
                        </Button>
                      : <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleBanToggle(user)}
                          disabled={pendingUserId === user.id}>
                          Ban
                        </Button>
                      }
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user)}
                        disabled={pendingUserId === user.id}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          {total} user{total === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              setOffset(Math.max(0, offset - PAGE_SIZE));
            }}
            disabled={offset === 0 || isLoading}>
            <ChevronLeftIcon aria-hidden="true" />
            Previous
          </Button>
          <span className="text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              setOffset(offset + PAGE_SIZE);
            }}
            disabled={offset + PAGE_SIZE >= total || isLoading}>
            Next
            <ChevronRightIcon aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
