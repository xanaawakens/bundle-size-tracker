import _ from 'lodash';
import moment from 'moment';

// Create a large bundle by using multiple functions from lodash
const numbers = _.range(1, 1000);
const doubled = _.map(numbers, n => n * 2);
const sum = _.sum(doubled);

// Use moment.js to add more bundle size
const now = moment();
const formatted = now.format('MMMM Do YYYY, h:mm:ss a');

console.log(`Sum: ${sum}`);
console.log(`Current time: ${formatted}`);
