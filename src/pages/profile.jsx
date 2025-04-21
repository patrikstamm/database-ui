import React, { useState } from "react";
import { Card, CardContent } from "../components/card";
import { Input } from "../components/input";
import { Button } from "../components/button";

export default function Profile() {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
  });

  const [editMode, setEditMode] = useState(false);

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // In a real app you'd update the backend here
    setEditMode(false);
  };

  return (
    <div className="flex justify-center items-center mt-12">
      <Card className="w-full max-w-md bg-gray-800 border-none shadow-xl">
        <CardContent>
          <h1 className="text-2xl font-semibold mb-6">Your Profile</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <Input
                name="name"
                value={userInfo.name}
                onChange={handleChange}
                disabled={!editMode}
                className="bg-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <Input
                name="email"
                value={userInfo.email}
                onChange={handleChange}
                disabled={!editMode}
                className="bg-gray-700 text-white"
              />
            </div>

            {editMode ? (
              <Button className="w-full mt-4" onClick={handleSave}>
                Save Changes
              </Button>
            ) : (
              <Button className="w-full mt-4" onClick={() => setEditMode(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
