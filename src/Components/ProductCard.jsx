function ProductCard({ name, price, category, image }) {
  return (
    <div className="rounded-xl border p-4 transition hover:shadow-lg">
      <div className="mb-4 h-48 overflow-hidden rounded-lg bg-gray-100">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
        />
      </div>

      <p className="text-sm text-gray-500">{category}</p>
      <h3 className="mt-1 font-semibold">{name}</h3>
      <p className="mt-2 font-bold">₹{price}</p>

      <button className="mt-4 w-full rounded-lg bg-black py-2 text-white hover:bg-gray-800">
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;