let obj = {
    'a': '1',
    'b': {
        x: '123',
        y: {
            '123': 123,
            '934854': 123,
            '0-9': 123,
        },
    },
    'c': '3',
    'd': '4',
    'e': '5',
    'f': '6',
};
let except = [];
const getObjectKeys = function (obj) {
    for (let key in obj) {
        except.push(key);
        let val = obj[key];
        if (val.constructor === Object) {           // 如果是一个对象
            getObjectKeys(val);
        }
    }
};
getObjectKeys(obj);

console.log(except);


