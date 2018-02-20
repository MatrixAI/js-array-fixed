# ArrayFixed

`ArrayFixed` is a fixed length sparse JavaScript array. The main advantage of a fixed length sparse array, is that we maintain a count along with the array length. Extending on the fixed length sparse array, we create a fixed length sparse array that is dense in one direction (left or right). The `ArrayFixedDense` ensures that the array is kept dense in one particular direction.

In order to lift the direction of `ArrayFixedDense` into the type system, we added `direction` boolean to the type. So you can set `ArrayFixedDense<*, true>` to ensure that we have a left dense array, or `ArrayFixedDense<*, false>` to ensure we have a right dense array.

However due to a flow problem, this doesn't quite work yet: https://github.com/facebook/flow/issues/5848
