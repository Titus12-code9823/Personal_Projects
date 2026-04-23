import java.util.HashMap;
import java.util.Map;

public class Inventory {
    private final Map<Integer, Product> products;

    public Inventory() {
        this.products = new HashMap<>();
    }

    public void addProduct(Product product) {
        if (product == null) {
            throw new IllegalArgumentException("Product cannot be null.");
        }
        products.put(product.getId(), product);
    }

    public Product getProductById(int id) {
        return products.get(id);
    }

    public synchronized boolean processOrder(Order order) {
        if (order == null) {
            throw new IllegalArgumentException("Order cannot be null.");
        }

        if (order.isEmpty()) {
            order.setStatus(OrderStatus.REJECTED);
            return false;
        }

        order.setStatus(OrderStatus.PROCESSING);

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (!product.hasEnoughStock(item.getQuantity())) {
                order.setStatus(OrderStatus.REJECTED);
                return false;
            }
        }

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.decreaseStock(item.getQuantity());
        }

        order.setStatus(OrderStatus.COMPLETED);
        return true;
    }

    public void displayInventory() {
        System.out.println("\nINVENTORY ");
        for (Product product : products.values()) {
            System.out.println(product);
        }
        System.out.println("\n");
    }
}
