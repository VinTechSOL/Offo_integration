import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "../components/icons/ArrowLeftIcon";
import { getMyProfileApi, updateMyProfileApi } from "../api/user";
import { getUserContextDetails } from "../api/userContext";


const SkeletonLine = () => (
  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
);

const MyAccountScreen: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [campus, setCampus] = useState("");
  const [building, setBuilding] = useState("");

  useEffect(() => {
    const load = async () => {
      const me = await getMyProfileApi();
      const ctx = await getUserContextDetails();

      setFirstName(me.first_name ?? "");
      setLastName(me.last_name ?? "");
      setPhone(me.mobile_number);
      setCampus(ctx?.campus_name ?? "");
      setBuilding(ctx?.building_name ?? "");
      setLoading(false);
    };

    load();
  }, []);

  const save = async () => {
    await updateMyProfileApi({
      first_name: firstName,
      last_name: lastName,
    });
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#FFF9F2]">
      {/* Header */}
      <header className="p-4 flex items-center border-b bg-[#FFF9F2]">
        <div className="w-1/5">
          <button onClick={() => navigate("/profile")}>
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        <div className="w-3/5 text-center">
          <h1 className="text-xl font-bold">My Account</h1>
        </div>
        <div className="w-1/5" />
      </header>

      <main className="flex-grow p-4 space-y-4">
        <div className="bg-white rounded-xl border p-4 space-y-4">
          {/* First Name */}
          <div>
            <label className="text-xs text-gray-500">First Name</label>
            {loading ? (
              <SkeletonLine />
            ) : isEditing ? (
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border-b focus:outline-none"
              />
            ) : (
              <p className="font-semibold">{firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="text-xs text-gray-500">Last Name</label>
            {loading ? (
              <SkeletonLine />
            ) : isEditing ? (
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border-b focus:outline-none"
              />
            ) : (
              <p className="font-semibold">{lastName}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500">Phone Number</label>
            <p className="font-semibold">{phone}</p>
          </div>

          <div>
            <label className="text-xs text-gray-500">Campus</label>
            <p className="font-semibold">{campus}</p>
          </div>

          <div>
            <label className="text-xs text-gray-500">Building</label>
            <p className="font-semibold">{building}</p>
          </div>
        </div>
      </main>

      <footer className="p-4 border-t bg-white">
        {isEditing ? (
          <div className="flex gap-4">
            <button
              onClick={() => setIsEditing(false)}
              className="w-full bg-gray-200 py-3 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="w-full bg-orange-500 text-white py-3 rounded-xl"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-orange-500 text-white py-3 rounded-xl"
          >
            Edit Profile
          </button>
        )}
      </footer>
    </div>
  );
};

export default MyAccountScreen;
