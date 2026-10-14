import ProductCard from "../Components/ProductCard";

const products = [
  {
    id: 1,
    name: "Classic Black",
    price: 2499,
    category: "Classic",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
  },
  {
    id: 2,
    name: "Silver Elite",
    price: 2399,
    category: "Luxury",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500",
  },
  {
    id: 3,
    name: "Sport X",
    price: 3999,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500",
  },
  {
    id: 4,
    name: "Golden Edge",
    price: 3999,
    category: "Luxury",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500",
  },
  {
    id: 5,
    name: "Urban Black",
    price: 2799,
    category: "Classic",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500",
  },
  {
    id: 6,
    name: "Minimal Silver",
    price: 3199,
    category: "Luxury",
    image: "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=500",
  },
  {
    id: 7,
    name: "Active Sport",
    price: 3599,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=500",
  },
  {
    id: 8,
    name: "Classic Gold",
    price: 4299,
    category: "Luxury",
    image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500",
  },
];

function Products() {
  return (
    <section className="px-6 py-12">
      <h2 className="mb-8 text-3xl font-bold">Featured Watches</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
}

export default Products;