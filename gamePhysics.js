// Shape goes in fixture
// fixtures goes into body
// body goes in the world
// joins link multiple bodies together
import {Box2D} from './Box2D.js';

const worldAABB = new Box2D.Collision.b2AABB(),
    gravity = new Box2D.Common.Math.b2Vec2(0.0, -10.0);

worldAABB.lowerBound.Set(-1000, -1000);
worldAABB.upperBound.Set(1000, 1000);

let doSleep = true;
const world = new Box2D.Dynamics.b2World(gravity, doSleep);

//####### Shape ##########
let circleShape = new Box2D.Collision.Shapes.b2CircleShape();
circleShape.SetRadius(20);

//####### Fixture ############
let fixtureDef = new Box2D.Dynamics.b2FixtureDef();
fixtureDef.shape = circleShape;
fixtureDef.density = 1.0;
fixtureDef.friction = 0.3;
fixtureDef.restitution = 1.0;

//####### Body ##########
let circleBdDef = new Box2D.Dynamics.b2BodyDef();
circleBdDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
circleBdDef.position.Set(0, 5);

var circleBody = world.CreateBody(circleBdDef);
circleBody.SetPosition(new Box2D.Common.Math.b2Vec2(0.0, 5.0));
circleBody.CreateFixture(fixtureDef);

let body = circleBody;
export {world, body};


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

