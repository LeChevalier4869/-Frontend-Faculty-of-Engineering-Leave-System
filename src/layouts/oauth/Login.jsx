export default function Login() {
  const googleLogin = () => {
    window.location.href = `https://backend-faculty-of-engineering-leave.onrender.com/auth/google`;
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Login</h1>
      <button onClick={googleLogin}>Login with Google</button>
    </div>
  );
}
