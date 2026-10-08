import { Link } from "react-router-dom"
function Navbar(){
    return(
<div>
    <nav className="flex items-center  px-6 justify-center gap-35 py-4">
        <h1 className="font-bold">WatchX</h1>
      <div className="flex gap-5 font-semibold ">
        <Link className="hover:text-gray-500 transition-colors" to="/">Home</Link>
        <Link className="hover:text-gray-500 transition-colors" to="/about">About</Link>
        <Link className="hover:text-gray-500 transition-colors" to="/contact">Contact</Link>
        <Link className="hover:text-gray-500 transition-colors" to="/service">Service</Link>
      </div>
    </nav>
  </div>
    )
}

export default Navbar