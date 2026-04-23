public class OrderProcessor implements Runnable {
    private final Inventory inventory;
    private final Order order;
    private Bill bill;
    private final int billId;

    public OrderProcessor(Inventory inventory, Order order, int billId) {
        this.inventory = inventory;
        this.order = order;
        this.billId = billId;
    }

    public Bill getBill() {
        return bill;
    }

    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName() +
                " started processing order " + order.getOrderId());

        boolean success = inventory.processOrder(order);

        if (success) {
            bill = new Bill(billId, order);
            System.out.println(Thread.currentThread().getName() +
                    " completed order " + order.getOrderId() +
                    " for customer " + order.getCustomer().getName() +
                    " | Total = " + order.getTotalAmount());
            bill.printBill();
        } else {
            System.out.println(Thread.currentThread().getName() +
                    " rejected order " + order.getOrderId() +
                    " for customer " + order.getCustomer().getName());
        }
    }
}
