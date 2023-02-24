import { useState } from 'react'
import LoginForm from './pages/login'
// import Navbar from './component/navbar'
// import Sidebar from './component/sidebar'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <LoginForm/>
      {/* <Navbar /> */}
      {/* <Sidebar/> */}
      {/* <h1 className="text-3xl font-bold underline">
      Hello world!
    </h1> */}
    </div>
  )
}

export default App
