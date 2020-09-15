function dampeningForce(t, v) {
    return {
        x: (v.x * Math.sin(-t) + v.y * Math.cos(-t)) * -Math.sin(t),
        y: (v.x * Math.sin(-t) + v.y * Math.cos(-t)) * Math.cos(t)
    };
}

function rotate(vector, angle) {
    return { x: vector.x*Math.cos(angle) + vector.y*(-Math.sin(angle)), y: vector.x*Math.sin(angle) + vector.y*Math.cos(angle)};
}

export {dampeningForce, rotate};
