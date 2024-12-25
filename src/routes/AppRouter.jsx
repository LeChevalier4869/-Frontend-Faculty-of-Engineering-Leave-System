import {createBrowserRouter, RouterProvider, Outlet} from 'react-router-dom'
import Login from '../layouts/Login'
import useAuth from '../hooks/useAuth'
import Header from '../components/Header'
import UserHome from '../layouts/UserHome'


const guestRouter = createBrowserRouter([
  {
    path: '/',
    element: <>
      {/* <Header /> */}
      <Outlet />
    </>,
    children: [
      { index: true, element: <Login /> },
      //{ path: '/register', element: <Register />}
    ]
  }
])

const userRouter = createBrowserRouter([
  {
    path: '/',
    element: <>
      <Header />
      <Outlet />
    </>,
    children : [
      { index: true, element: <UserHome /> },
    ]
  }
])

export default function AppRouter() {
  const {user} = useAuth()
  const finalRouter = user?.id ? userRouter : guestRouter
  console.log(user)
  return (
    <RouterProvider router={finalRouter} />
  )
}
