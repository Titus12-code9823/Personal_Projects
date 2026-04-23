import java.util.HashMap;
import java.util.Map;

public class Inventory {
    private final Map<Integer, Product> products;

    public Inventory() {
        products = new HashMap<>();
    }

    public void addProduct(Product product) {
        products.put(product.getId(), product);
    }

    public Product getProductById(int id) {
        return products.get(id);
    }

    public synchronized boolean processOrder(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product.getStock() < item.getQuantity()) {
                return false;
            }
        }

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.decreaseStock(item.getQuantity());
        }

        return true;
    }

    public void displayProducts() {
        System.out.println("\nCurrent Inventory:");
        for (Product product : products.values()) {
            System.out.println(product);
        }
    }
}