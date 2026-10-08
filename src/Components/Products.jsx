import ProductCard from "../Components/ProductCard";
const products = [
    {id:1 , name: " classic black " , price:2499 , category :"classic"},
    {id:2 , name: "silver Elite" , price:2399 , category:"Luxury"},
    {id:3 , name: "Sport X" , price:3999 , category:"Sports"},
    { id: 4, name: "Golden Edge", price: 3999, category: "Luxury" },
]

function Products(){
    return(
        <section className="px-6 py-12 ">
            <h2 className="mb-8 text-3xl font-bold">Featured Wacthes</h2>

           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
  {products.map((product) => (
    <ProductCard key={product.id} {...product} />
  ))}
</div>
        </section>
    )
}

export default Products