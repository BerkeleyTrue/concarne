import { api } from "@/utils/api";
import { HeightForm } from "@/components/HeightForm";
import { Card, CardContent, CardHeader } from "./ui/card";

export function UserInfoCard() {
  const { data: userData, isLoading: isUserLoading } =
    api.auth.getUser.useQuery({
      userId: "1",
    });
  return (
    <Card className="bg-card w-full max-w-md rounded-lg border p-6 text-white shadow-md">
      <CardHeader>User Profile</CardHeader>
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
                <HeightForm
                  userId={userData.id}
                  currentHeight={userData.height ?? undefined}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">User ID:</span>
              <span className="font-medium">{userData.id}</span>
            </div>
          </div>
        ) : (
          <p>No user information available</p>
        )}
      </CardContent>
    </Card>
  );
}
