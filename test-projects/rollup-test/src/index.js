import { range, map, sum } from 'lodash-es';
import { format } from 'date-fns';

// Create a large bundle by using multiple functions
const numbers = range(1, 1000);
const doubled = map(numbers, n => n * 2);
const total = sum(doubled);

// Use date-fns to add more bundle size
const now = new Date();
const formatted = format(now, 'MMMM do yyyy, h:mm:ss a');

console.log(`Sum: ${total}`);
console.log(`Current time: ${formatted}`);
