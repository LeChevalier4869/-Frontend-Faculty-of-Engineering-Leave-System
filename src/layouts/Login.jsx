import axios from "axios";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { apiEndpoints } from "../utils/api";

export default function Login() {
  const { setUser } = useAuth();
  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const hdlChange = (e) => {
    setInput((prv) => ({ ...prv, [e.target.name]: e.target.value }));
  };

  const hdlSubmit = async (e) => {
    try {
      e.preventDefault();
      // validation
      const res = await axios.post(apiEndpoints.login, input);
      console.log(res.data.token);
      localStorage.setItem("token", res.data.token);
      const rs1 = await axios.get(apiEndpoints.getUser, {
        headers: { Authorization: `Bearer ${res.data.token}` },
      });
      console.log(rs1.data);
      setUser(rs1.data);
      alert("Login Success");
    } catch (err) {
      console.log(err.response.data.message);
      alert(err.response.data.message);
    }
  };
  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 border w-[90%] sm:w-[400px] mx-auto rounded-[20px] bg-white shadow-xl">
          <div className="text-4xl mb-6 font-extrabold text-center text-[#8B0000]">
            Welcome Back
          </div>
          <p className="text-center text-gray-600 mb-8">
            Please login to your account
          </p>
          <form className="flex flex-col gap-4" onSubmit={hdlSubmit}>
            {/* Email */}
            <label className="form-control w-full">
              <input
                type="email"
                className="input input-bordered w-full rounded-full px-4 py-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
                name="email"
                value={input.email}
                onChange={hdlChange}
                required
                placeholder="E-mail"
              />
            </label>

            {/* Password */}
            <label className="form-control w-full">
              <input
                type="password"
                className="input input-bordered w-full rounded-full px-4 py-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
                name="password"
                value={input.password}
                onChange={hdlChange}
                required
                placeholder="Password"
              />
            </label>

            {/* Login Button */}
            <button
              type="submit"
              className="btn btn-info rounded-full w-full bg-[#8B0000] hover:bg-[#A52A2A] text-lg text-white mt-4"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
