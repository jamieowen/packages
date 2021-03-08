# Description

Some test ideas for a stream / transform based motion set of tools.
To allow for manipulation of transform style objects via reducer functions.

This has simlilarties with the geometry stream idea but difficult to define common interfaces
without experimentation and more concrete use case.

I was also making mistakes with newer ideas of using streams, and getting confused with best or 'correct'
ways of defining a stream event/payload, when to mutate or not mutate, when to adapt/augment the payload 'up' for a process happening
downstream, then to augment 'down' to lower level object for continutatoin of a stream.

If we consider a base object as a Transform like :

```
interface ITransform{
  position: [],
  rotation: []],
  scale: []
}
```

And then mutation style reducers that modify the stream payload. Mutation is obvioysly a no no from a pure/functional point of
view, but it just really can't work when dealing with transforms on a micro level and a 60fps high frequency. It would just
result in huge memory issues.

So if we consider a 'sideEffect/peek' style function ( from my scatty understanding of these functional concepts )

```typescript
fromTransform(obj).transform(
  // position
  map((ob)=>(add(obj.scaleposition,[0,1,0]),obj))
  // scale
  map((ob)=>(mulN(obj.scale,3),obj))
  // steer Behaviour
  map(someSteerBehaviour(opts))
)

```

Here we are exchaning regular imperative style loop and step by step statements with a
functional transform wrapper. The subscription could emit other objects and the same would be applied to another object.
This is very succinct in that it gives us :

- Composable RFN functions that operate in specific domains, increasing seperation of concerns
- Asyncronous next() method to change the transformed object easily.
- Ability to emit multiple objects and create a 'for loop' over a set of objects.
- With the seperation, its possible to parallelise the tasks or offload to GPU.

The downsides ( potentially ) are speed ( in the short term ) in comparison to a regular for loop.
If the same was done imperatively but using functions.

```typescript
const obj = someObjectToTransformCompatible(object);
const objs = [obj];
const steerBehaviour = steer(opts);
for (let i = 0; i < obj.length; i++) {
  positionObject(obj);
  scaleObject(obj);
  steerBehaviour(obj);
}
```

## How effective will this be?

A bit unsure if this is overkill to operate on objects like this and break down to smaller
primitives. I.e. breaking down a group of objects to single objects, emitting single add/remove/udpate transform events. Or even individual lines, points, etc. If you have 1000 objects, thats 60000 map/generator steps at least per second. Things become even more ridiculous with points.

May be the lowest unit would be a geometry, transforms, entities, etc.

e.g.

```typescript

// Rough Idea - BUT based on some tests subscribe() executes backwards
fromGeometry(geom)
  .subscribe(toTransforms()) // geom converted to transform ( w/ rot/scale/etc )
  // .subscribe(toECS()) // or to ECS?
  .subscribe(physicsSystem(
    // physics emits an update event, transforming all objects
    comp(
      map(())
      map(()=>)
    )
  ))
  .subscribe()

// SO.. the same with transform

const psystem = fromGeometry(geom)
  .transform( toPhysicsECS() ) // converts to array
  .transform(
    physicsSystem( // perform a more optimal loop in here ( without events )
      comp(
        map(()=>) // behaviour
        map()
      )
    )
  )

psystem.subscribe(renderPoints());
psystem.subscribe(renderLines());





```
