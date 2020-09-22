function getJSON(url) {
    return new Promise((resolve, reject)=> {
        let xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if(this.status !== 200) reject(this);
            if(this.getResponseHeader('content-type').indexOf('application/json') !== -1) {
                this.responseJSON = JSON.parse(this.responseText);
            }
            resolve(this);
        };
        xhr.open('GET', url, true);
        xhr.send();
    });
}

export {getJSON};

