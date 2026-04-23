

public class OrderProcessor extends Thread {
    private final Inventory inventory;
    private final Order order;

    public OrderProcessor(Inventory inventory, Order order) {
        this.inventory = inventory;
        this.order = order;
    }

    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName() +
                " started processing order " + order.getOrderId());

        boolean success = inventory.processOrder(order);

        if (success) {
            order.setStatus("COMPLETED");
            System.out.println(Thread.currentThread().getName() +
                    " completed order " + order.getOrderId() +
                    " for " + order.getCustomerName() +
                    " | Total: " + order.getTotal());
        } else {
            order.setStatus("REJECTED - INSUFFICIENT STOCK");
            System.out.println(Thread.currentThread().getName() +
                    " rejected order " + order.getOrderId() +
                    " for " + order.getCustomerName());
        }
    }
}