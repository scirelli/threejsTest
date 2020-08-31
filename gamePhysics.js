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

const gravity = new b2Vec2(0.0, 1.0),
    DO_SLEEP = true,
    world = new b2World(gravity, DO_SLEEP),
    circleShape = new b2CircleShape(),
    fixtureDef = new b2FixtureDef(),
    circleBdDef = new b2BodyDef();

//####### Shape ##########
circleShape.SetRadius(20);

//####### Fixture ############
fixtureDef.shape = circleShape;
fixtureDef.density = 1.0;
fixtureDef.friction = 0.3;
fixtureDef.restitution = 1.0;

//####### Body ##########
circleBdDef.type = b2Body.b2_dynamicBody;
circleBdDef.position.Set(0, 5);

let ballbody = world.CreateBody(circleBdDef);
ballbody.SetPosition(new b2Vec2(0.0, 5.0));
ballbody.CreateFixture(fixtureDef);

let floorshape = new b2PolygonShape(),
    floorfixtureDef = new b2FixtureDef(),
    floorbodyDef = new b2BodyDef();

floorshape.SetAsOrientedBox(100, 0, {x: 0, y: 0}, 0);
floorfixtureDef.shape = floorshape;
floorfixtureDef.density = 1;
floorfixtureDef.friction = 0.5;
floorfixtureDef.restitution = 0.5;
floorbodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
floorbodyDef.position = {x: 0, y: 10};
floorbodyDef.angle = 0.1;
let floorbody = world.CreateBody(floorbodyDef);
floorbody.CreateFixture(floorfixtureDef);
export {world, ballbody, floorbody};


//var jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
////jointDef.anchorPoint.Set(250, 200);
//jointDef.bodyA = world.GetGroundBody();
//jointDef.bodyB = circleBody;
//world.CreateJoint(jointDef);

// let polyShape = new Box2D.Collision.Shapes.b2PolygonShape();
// polyShape.SetAsBox(1.0, 1.0);
// let fixtureDef = new Box2D.Dynamics.b2FixtureDef();
// fixtureDef.shape = polyShape;
// fixtureDef.density = 1.0;
// fixtureDef.friction = 0.3;

// let bodyDef = new Box2D.Dynamics.b2BodyDef();
// bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
// bodyDef.position.Set(0.0, 4.0);

// let body = world.CreateBody(bodyDef);
// body.CreateFixture(fixtureDef);
// body.SetPosition(new Box2D.Common.Math.b2Vec2(0.0, 0.0));
// let groundBodyDef = new Box2D.Dynamics.b2BodyDef();
// groundBodyDef.position.Set(0.0, -10.0);
// let groundBody = world.CreateBody(groundBodyDef);

// let groundBox = new Box2D.Collision.Shapes.b2PolygonShape();
// groundBox.SetAsBox(50.0, 10.0);

// groundBody.CreateFixture(new Box2D.Dynamics.b2FixtureDef(), 0.0);

