"use client";
import { HeightForm } from "@/components/HeightForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { api } from "@/lib/trpc/client";
import Link from "next/link";
import { Button } from "./ui/button";

export function UserInfoCard() {
  const { data: userData, isLoading: isUserLoading } =
    api.auth.getUser.useQuery();
  return (
    <Card className="w-full max-w-md p-2 md:p-6">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>
          View and update your profile information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isUserLoading ? (
          <p>Loading user information...</p>
        ) : userData ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Name:</span>
              <span className="font-medium">
                {userData.username ?? "Not provided"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Height:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {userData.height
                    ? `${Math.floor(userData.height / 12)}' ${userData.height % 12}"`
                    : "Not provided"}
                </span>
                <HeightForm currentHeight={userData.height ?? undefined} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">User ID:</span>
              <span className="font-medium">{userData.id}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p>No user information available</p>
            <Link href="/auth">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
