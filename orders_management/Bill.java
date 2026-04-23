import java.time.LocalDateTime;

public class Bill {
    private final int billId;
    private final Order order;
    private final LocalDateTime issuedAt;
    private final double totalAmount;

    public Bill(int billId, Order order) {
        if (order == null) {
            throw new IllegalArgumentException("Order cannot be null.");
        }
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new IllegalStateException("Cannot generate bill for an uncompleted order.");
        }

        this.billId = billId;
        this.order = order;
        this.issuedAt = LocalDateTime.now();
        this.totalAmount = order.getTotalAmount();
    }

    public int getBillId() {
        return billId;
    }

    public Order getOrder() {
        return order;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void printBill() {
        System.out.println("\nBill");
        System.out.println("Bill ID: " + billId);
        System.out.println("Order ID: " + order.getOrderId());
        System.out.println("Customer: " + order.getCustomer().getName());
        System.out.println("Issued At: " + issuedAt);
        System.out.println("Items:");

        for (OrderItem item : order.getItems()) {
            System.out.println(" - " + item.getProduct().getName() +
                    " | Qty: " + item.getQuantity() +
                    " | Unit Price: " + item.getUnitPrice() +
                    " | Subtotal: " + item.getSubtotal());
        }

        System.out.println("Total: " + totalAmount);
        System.out.println("\n");
    }

    @Override
    public String toString() {
        return "Bill{" +
                "billId=" + billId +
                ", orderId=" + order.getOrderId() +
                ", issuedAt=" + issuedAt +
                ", totalAmount=" + totalAmount +
                '}';
    }
}
