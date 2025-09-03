import React, { useEffect, useState } from "react";
import API from "../../utils/axios";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    API.get("/auth/profile")
      .then((res) => setUser(res.data.user))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Profile</h1>
      {user ? (
        <pre className="bg-gray-100 p-4 mt-2 rounded">{JSON.stringify(user, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Profile;
