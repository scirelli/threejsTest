function dampeningForce(t, v) {
    return {
        x: (v.x * Math.sin(-t) + v.y * Math.cos(-t)) * -Math.sin(t),
        y: (v.x * Math.sin(-t) + v.y * Math.cos(-t)) *  Math.cos(t)
    };
}

function rotate(v, t) {
    return {
        x: v.x * Math.cos(t) + v.y * -Math.sin(t),
        y: v.x * Math.sin(t) + v.y *  Math.cos(t)
    };
}

export {dampeningForce, rotate};
