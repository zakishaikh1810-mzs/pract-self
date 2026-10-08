function ProductCard({name, price,category}){
    return(
   <div className="rounded-xl border p-4 transition hover:shadow-lg">
       <div className="mb-4 flex h-48 items-center justify-center rounded-lg bg-gray-100">
        <span className="text-gray-400">Watch Image</span>
      </div>


      <p className="text-sm text-gray-500 ">{category}</p>
      <h3 className="mt-1 font-semibold">{name}</h3>
      <p className="mt-2 font-bold">₹{price}</p>


      <button className="mt-4 w-full rounded-lg bg-black py-2 text-white hover:bg-gray-800">
        Add To Cart
      </button>
   </div>
    )
}

export default ProductCard