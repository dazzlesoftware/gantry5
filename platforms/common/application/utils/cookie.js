'use strict';

let Cookie = {
    write: function(name, value) {
        let date = new Date();
        date.setTime(date.getTime() + 3600 * 1000 * 24 * 365 * 1); // 1 year

        let host   = window.location.host.toString(),
            domain = host.substring(host.lastIndexOf(".", host.lastIndexOf(".") - 1) + 1);

        if (host.match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)) { domain = host; }
        let cookie = [name, '=', JSON.stringify(value), '; expires=', date.toGMTString(), '; domain=.', domain, '; path=/;'];

        document.cookie = cookie.join('');
    },

    read: function(name) {
        name = name.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
        let value = document.cookie.match('(?:^|;)\\s*' + name + '=([^;]*)');
        return (value) ? JSON.parse(decodeURIComponent(value[1])) : null;
    }
};

export default Cookie;
