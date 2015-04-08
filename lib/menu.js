module.exports = function (dir, request){
    var fs = require('fs'),
        menu = {},
        dirs = fs.readdirSync('./' + dir),
        menu = [];

    var isActive = function(url){
        var splitedPath = request.path.replace(/^\//, '').replace(/\/$/, ''),
            detectUrl = url.replace(/^\//, '').replace(/\/$/, ''),
            reg;

        reg = new RegExp(detectUrl + '$');

        if(reg.test(splitedPath)){
            return true;
        }

        return false;
    }


    if(dirs.length){
        dirs.forEach(function(value){
            menu.push(
                {
                    title: value,
                    url: '/documentation/' + value,
                    active: isActive('/documentation/' + value)
                }
            )
        });
    }

    return menu;
}

