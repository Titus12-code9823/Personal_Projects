public class Main {
    public static void main(String[] args) {
        Inventory inventory = new Inventory();

        Product laptop = new Product(1, "Laptop", 3500.0, 5);
        Product mouse = new Product(2, "Mouse", 120.0, 10);
        Product keyboard = new Product(3, "Keyboard", 200.0, 6);
        Product monitor = new Product(4, "Monitor", 900.0, 3);

        inventory.addProduct(laptop);
        inventory.addProduct(mouse);
        inventory.addProduct(keyboard);
        inventory.addProduct(monitor);

        Customer c1 = new Customer(1, "Alice", "alice@gmail.com", "Bucharest");
        Customer c2 = new Customer(2, "Bob", "bob@gmail.com", "Cluj");
        Customer c3 = new Customer(3, "Charlie", "charlie@gmail.com", "Iasi");

        Order order1 = new Order(1001, c1);
        order1.addItem(new OrderItem(laptop, 1));
        order1.addItem(new OrderItem(mouse, 2));

        Order order2 = new Order(1002, c2);
        order2.addItem(new OrderItem(laptop, 2));
        order2.addItem(new OrderItem(monitor, 1));

        Order order3 = new Order(1003, c3);
        order3.addItem(new OrderItem(laptop, 3));
        order3.addItem(new OrderItem(keyboard, 2));

        inventory.displayInventory();

        OrderProcessor processor1 = new OrderProcessor(inventory, order1, 5001);
        OrderProcessor processor2 = new OrderProcessor(inventory, order2, 5002);
        OrderProcessor processor3 = new OrderProcessor(inventory, order3, 5003);

        Thread t1 = new Thread(processor1, "Worker-1");
        Thread t2 = new Thread(processor2, "Worker-2");
        Thread t3 = new Thread(processor3, "Worker-3");

        t1.start();
        t2.start();
        t3.start();

        try {
            t1.join();
            t2.join();
            t3.join();
        } catch (InterruptedException e) {
            System.out.println("Thread interrupted: " + e.getMessage());
        }

        System.out.println("\nFinal order states");
        System.out.println(order1);
        System.out.println(order2);
        System.out.println(order3);

        inventory.displayInventory();
    }
}
