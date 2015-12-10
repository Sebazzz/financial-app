module FinancialApp {
    /**
     * Represents a queue in the form of a simple array wrapper
     */
    export class Queue<T> {
        private storage: T[] = [];

        public enqueue(item: T) {
            this.storage.unshift(item);
        }

        /**
         * Dequeues an item from the queue or returns `null` if no items are left
         * @returns {} 
         */
        public dequeue() {
            return this.storage.pop() || null;
        }

        public length() {
            return this.storage.length;
        }
    }
}