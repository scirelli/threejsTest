import {dampeningForce} from '../../js/helpers.js';

describe('main.js', ()=> {
    describe('dampeningForce function', ()=> {
        it('should return a [0, 0] force vector when angle is 0 and a vector along the x axis [1, 0].', ()=> {
            expect(dampeningForce(0, {x: 1, y: 0})).toEqual({x: -0, y: 0});
        });

        it('should return a [0, 1] force vector when angle is 0 and vector is [1, 1].', ()=> {
            expect(dampeningForce(0, {x: 1, y: 1})).toEqual({x: -0, y: 1});
        });

        // console.log(dampeningForce(0, new Vector(0, 1)));
        // console.log(dampeningForce(0, new Vector(-1, 1)));
        // console.log(dampeningForce(0, new Vector(-1, 0)));
        // console.log(dampeningForce(0, new Vector(-1, -1)));
        // console.log(dampeningForce(0, new Vector(0, -1)));
        // console.log(dampeningForce(0, new Vector(1, -1)));
    });
});
