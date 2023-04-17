class Queue {
    items: any[];

    constructor(...params: any[]) {
        this.items = [...params];
    }

    enqueue(item: any) {
        this.items.push(item);
    }

    dequeue() {
        return this.items.shift();
    }

    getItems() {
        return this.items;
    }

    clearItems() {
        this.items = [];
    }
}

export default Queue