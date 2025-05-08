"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/settings/profile");
  }, [router]);

  return null;
}
