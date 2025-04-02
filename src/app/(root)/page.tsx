import ProductList from "@/components/shared/product/product-list";
import sampleData from "@/db/sample-data";

export const metadata = {
  title: "Home",
};

const Homepage = async () => {
  return (
    <div>
      <ProductList
        data={sampleData.products}
        title={"Newest arrival"}
        limit={4}
      />
    </div>
  );
};
export default Homepage;
