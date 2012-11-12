functional = require('../functional')
functional.expose()

describe("functional", ->
  sum = (x, y) -> x + y
  addOne = (x) -> x + 1
  times2 = (x) -> x * 2
  subtract = (x, y) -> x - y

  it("should load properly using different module schemes", ->
    expect(functional).not.toBeUndefined()
    expect(typeof functional.compose).toEqual('function')
  )

  describe("expose", ->
    it("can attach functions to the global namespace", ->
      functional.expose()
      expect(typeof compose).toEqual('function')
    )
  )

  describe("autoCurry", ->
    it("is added to the Function prototype", ->
      expect(typeof Function.prototype.autoCurry).toEqual('function')
    )
    
    it("enables a function to be partially applied", ->
      add = (a, b, c) -> a + b + c
      implicit = add.autoCurry()
      explicit = add.autoCurry(3)
      expect(implicit(1)(1)(1)).toEqual(3)
      expect(explicit(1)(1)(1)).toEqual(3)
      expect(implicit(1, 1)(1)).toEqual(3)
      expect(explicit(1, 1)(1)).toEqual(3)
      expect(implicit(1)(1, 1)).toEqual(3)
      expect(explicit(1)(1, 1)).toEqual(3)
      expect(implicit(1, 1, 1)).toEqual(3)
      expect(explicit(1, 1, 1)).toEqual(3)
    )
  )

  describe("map", ->
    it("returns the correct result when iterating over an array", ->
      expect(map(addOne, [1, 2, 3])).toEqual([2, 3, 4])
    )

    it("partially applies arguments", ->
      expect(map(addOne)([1, 2, 3])).toEqual([2, 3, 4])
    )
  )

  describe("compose", ->
    it("composes functions, and applies functions right to left", ->
      expect(compose(addOne, times2)(3)).toEqual(7)
      expect(compose(addOne, times2, sum)(1, 2)).toEqual(7)
    )
  )

  describe("sequence", ->
    it("composes functions, and applies functions left to right", ->
      expect(sequence(times2, addOne)(3)).toEqual(7)
      expect(sequence(sum, times2, addOne)(1, 2)).toEqual(7)
    )
  )

  xdescribe("compose_p", ->
    xit("runs functions in parallel", ->
      # TODO: add assertion
    )
  )

  describe("memoize", ->
    fib = (n) -> if n < 2 then n else fib(n - 1) + fib(n - 2)
    fastFib = memoize(fib)

    it("returns a memoized function that produces identical results", ->
      expect(fib(10)).toEqual(55)
      expect(fastFib(10)).toEqual(55)
    ) 
  )

  describe("reduce", ->
    it("can sum up an array", ->
      expect(reduce(sum, 0, [1, 2, 3])).toEqual(6)
    )
    it("can partially apply arguments", ->
      expect(reduce(sum)(0, [1, 2, 3])).toEqual(6)
      expect(reduce(sum, 0)([1, 2, 3])).toEqual(6)
    )

    it("is aliased as 'foldl'", ->
      expect(foldl(sum, 0, [1, 2, 3])).toEqual(6)
      expect(foldl(sum)(0, [1, 2, 3])).toEqual(6)
      expect(foldl(sum, 0)([1, 2, 3])).toEqual(6)
    )
  )

  describe("select", ->
    isEven = (x) -> x % 2 == 0

    it("filters an array based on a criteria (function)", ->
      expect(select(isEven, [1, 2, 3, 4, 5, 6])).toEqual([2, 4, 6])
    )
    
    it("can be partially applied", ->
      expect(select(isEven)([1, 2, 3, 4, 5, 6])).toEqual([2, 4, 6])
    )

    it("is aliased as 'filter'", ->
      expect(filter(isEven, [1, 2, 3, 4, 5, 6])).toEqual([2, 4, 6])
      expect(filter(isEven)([1, 2, 3, 4, 5, 6])).toEqual([2, 4, 6])
    )
  )

  describe("guard", ->
    truthy = -> true
    falsy = -> false

    it("guards a function, acts like an if/else statement", ->
      expect(guard(truthy, addOne, times2)(3)).toEqual(4)
      expect(guard(falsy, addOne, times2)(3)).toEqual(6)
      expect(guard(id, addOne, times2)(3)).toEqual(4)
      expect(guard(id, addOne, times2)(0)).toEqual(0)
    )
  )

  describe("flip", ->
    it("returns a function with the first two arguments flipped", ->
      expect(subtract(1, 2)).toEqual(-1)
      expect(flip(subtract)(1, 2)).toEqual(1)
    )
  )

  describe("foldr", ->
    it("can sum up an array", ->
      expect(foldr(sum, 0, [1, 2, 3])).toEqual(6)
    )
    it("can partially apply arguments", ->
      expect(foldr(sum)(0, [1, 2, 3])).toEqual(6)
      expect(foldr(sum, 0)([1, 2, 3])).toEqual(6)
    )
  )
  
  describe("and", ->
    it("returns a function that returns 'true' when all arguments applied to function's arguments return true", ->
      expect(annd('>1', '>2')(3)).toEqual(true)
      expect(annd('>1', '>2')(2)).toEqual(false)
      expect(annd('>1', 'error()')(1)).toEqual(false)
    )
  )

  describe("or", ->
    it("returns a function that returns 'true' when one of the arguments applied to the function's arguments returns true", ->
      expect(orr('>1', '>2')(2)).toEqual(true)
      expect(orr('>1', '>2')(0)).toEqual(false)
      expect(orr('>1', 'error()')(2)).toEqual(true)
    )
  )

  describe("some", ->
    it("returns true when the function returns true for some element in the sequence", ->
      expect(some('>2', [1, 2, 3])).toEqual(true)
      expect(some('>10', [1, 2, 3])).toEqual(false)
    )

    it("can be partially applied", ->
      expect(some('>2')([1, 2, 3])).toEqual(true)
      expect(some('>10')([1, 2, 3])).toEqual(false)
    )
  )
)
