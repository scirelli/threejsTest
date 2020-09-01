// Shape goes in fixture
// fixtures goes into body
// body goes in the world
// joins link multiple bodies together
import {
    Box2D,
    b2Vec2,
    b2World,
    b2CircleShape,
    b2FixtureDef,
    b2BodyDef,
    b2Body,
    b2PolygonShape
} from './Box2D.js';

const gravity = new b2Vec2(0.0, 10.0),
    DO_SLEEP = true,
    world = new b2World(gravity, DO_SLEEP);

let circleShape = new b2CircleShape(1),
    circleFixtureDef = new b2FixtureDef(),
    circleBdDef = new b2BodyDef();

circleFixtureDef.shape = circleShape;
circleFixtureDef.density = 1.0;
circleFixtureDef.friction = 0.5;
circleFixtureDef.restitution = 1.0;

circleBdDef.type = b2Body.b2_dynamicBody;
let ballbody = world.CreateBody(circleBdDef);
ballbody.CreateFixture(circleFixtureDef);



let circle2Shape = new b2CircleShape(1),
    circle2FixtureDef = new b2FixtureDef(),
    circle2BdDef = new b2BodyDef();

circle2FixtureDef.shape = circle2Shape;
circle2FixtureDef.density = 1.0;
circle2FixtureDef.friction = 0.5;
circle2FixtureDef.restitution = 1.0;

circle2BdDef.type = b2Body.b2_dynamicBody;
circle2BdDef.position = {x: 0, y: -2.5};
let ball2body = world.CreateBody(circle2BdDef);
ball2body.CreateFixture(circle2FixtureDef);



let floorshape = new b2PolygonShape(),
    floorfixtureDef = new b2FixtureDef(),
    floorbodyDef = new b2BodyDef();

floorshape.SetAsOrientedBox(10, 4, {x: 0, y: 2}, 0);
floorfixtureDef.shape = floorshape;
floorfixtureDef.density = 1;
floorfixtureDef.friction = 0.5;
floorfixtureDef.restitution = 0.5;
floorbodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
floorbodyDef.position = {x: 0, y: 10};
floorbodyDef.angle = 0.0;
let floorbody = world.CreateBody(floorbodyDef);
floorbody.CreateFixture(floorfixtureDef);

export {world, ballbody, floorbody, ball2body};
