'use strict';

module.exports = (electron, appProcess)=> (event, arg1, arg2)=> {
    event.sender.send('pong', `pong ${arg1} ${arg2}`);
};