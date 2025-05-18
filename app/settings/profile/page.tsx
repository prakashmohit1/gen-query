"use client";

import { useSession } from "@/contexts/session-context";

export default function ProfilePage() {
  const { session } = useSession();
  const user = session?.user;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your Databricks profile
        </p>
      </div>

      <div className="border-t" />

      <div className="space-y-8">
        {/* Display Name */}
        <div>
          <h3 className="text-sm font-medium text-gray-900">Display name</h3>
          <p className="text-sm font-medium">
            {user?.name}
            <span className="text-gray-500 ml-2">({user?.email})</span>
          </p>
        </div>

        {/* Groups */}
        <div>
          <h3 className="text-sm font-medium text-gray-900">Organization</h3>
          <p className="text-sm text-gray-500 mb-2">{user?.team_name}</p>
          <div className="flex gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {user?.role || "No role"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
