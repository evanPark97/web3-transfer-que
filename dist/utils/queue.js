"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Queue {
    constructor(...params) {
        this.items = [...params];
    }
    enqueue(item) {
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
exports.default = Queue;
