// Shape goes in fixture
// fixtures goes into body
// body goes in the world
// joins link multiple bodies together
import {
    Box2D,
    b2Vec2,
    b2World,
    b2FixtureDef,
    b2BodyDef,
    b2PolygonShape
} from './Box2D.js';

const gravity = new b2Vec2(0.0, 10.0),
    DO_SLEEP = true,
    world = new b2World(gravity, DO_SLEEP);


let floorshape = new b2PolygonShape(),
    floorfixtureDef = new b2FixtureDef(),
    floorbodyDef = new b2BodyDef();

floorshape.SetAsOrientedBox(6, 1, {x: 0, y: 0}, 0);
floorfixtureDef.shape = floorshape;
floorfixtureDef.density = 1;
floorfixtureDef.friction = 0.5;
floorfixtureDef.restitution = 0.5;
floorbodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
floorbodyDef.position = {x: 0, y: 15};
floorbodyDef.angle = 0.0;
let floorbody = world.CreateBody(floorbodyDef);
floorbody.CreateFixture(floorfixtureDef);

let box1Shape = new b2PolygonShape(),
    box1FixtureDef = new b2FixtureDef(),
    box1BodyDef = new b2BodyDef();

box1Shape.SetAsOrientedBox(4, 1, {x: 0, y: 0}, 0);
box1FixtureDef.shape = box1Shape;
box1FixtureDef.density = 1;
box1FixtureDef.friction = 0.5;
box1FixtureDef.restitution = 0.5;
box1BodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
box1BodyDef.position = {x: 0, y: 5};
box1BodyDef.angle = 0.0;
let box1Body = world.CreateBody(box1BodyDef);
box1Body.CreateFixture(box1FixtureDef);

let box2Shape = new b2PolygonShape(),
    box2FixtureDef = new b2FixtureDef(),
    box2BodyDef = new b2BodyDef();

box2Shape.SetAsOrientedBox(2, 1, {x: 0, y: 0}, 0);
box2FixtureDef.shape = box2Shape;
box2FixtureDef.density = 1;
box2FixtureDef.friction = 0.5;
box2FixtureDef.restitution = 0.5;
box2BodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
box2BodyDef.position = {x: 0, y: 0};
box2BodyDef.angle = 0.0;
let box2Body = world.CreateBody(box2BodyDef);
box2Body.CreateFixture(box2FixtureDef);

export {world, floorbody, box1Body, box2Body};
