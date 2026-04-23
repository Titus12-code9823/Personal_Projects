import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        Inventory inventory = new Inventory();

        Product laptop = new Product(1, "Laptop", 3500.0, 5);
        Product mouse = new Product(2, "Mouse", 100.0, 10);
        Product keyboard = new Product(3, "Keyboard", 200.0, 7);

        inventory.addProduct(laptop);
        inventory.addProduct(mouse);
        inventory.addProduct(keyboard);

        inventory.displayProducts();

        Order order1 = new Order(
                101,
                "Alice",
                Arrays.asList(
                        new OrderItem(laptop, 1),
                        new OrderItem(mouse, 2)
                )
        );

        Order order2 = new Order(
                102,
                "Bob",
                Arrays.asList(
                        new OrderItem(laptop, 2),
                        new OrderItem(keyboard, 1)
                )
        );

        Order order3 = new Order(
                103,
                "Charlie",
                Arrays.asList(
                        new OrderItem(laptop, 3),
                        new OrderItem(mouse, 1)
                )
        );

        OrderProcessor t1 = new OrderProcessor(inventory, order1);
        OrderProcessor t2 = new OrderProcessor(inventory, order2);
        OrderProcessor t3 = new OrderProcessor(inventory, order3);

        t1.start();
        t2.start();
        t3.start();

        try {
            t1.join();
            t2.join();
            t3.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("\nFinal order statuses:");
        System.out.println(order1);
        System.out.println(order2);
        System.out.println(order3);

        inventory.displayProducts();
    }
}