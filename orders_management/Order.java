import java.util.List;

public class Order {
    private final int orderId;
    private final String customerName;
    private final List<OrderItem> items;
    private String status;

    public Order(int orderId, String customerName, List<OrderItem> items) {
        this.orderId = orderId;
        this.customerName = customerName;
        this.items = items;
        this.status = "PENDING";
    }

    public int getOrderId() {
        return orderId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getTotal() {
        double total = 0;
        for (OrderItem item : items) {
            total += item.getSubtotal();
        }
        return total;
    }

    @Override
    public String toString() {
        return "Order{id=" + orderId +
                ", customer='" + customerName + '\'' +
                ", status='" + status + '\'' +
                ", total=" + getTotal() +
                '}';
    }
}