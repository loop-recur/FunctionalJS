functional = require('../functional')
functional.expose()

describe("functional", () ->
  sum = (x, y) -> x + y
  addOne = (x) -> x + 1
  times2 = (x) -> x * 2

  it("should load properly using different module schemes", () ->
    expect(functional).not.toBeUndefined()
    expect(typeof functional.compose).toEqual('function')
  )

  describe("expose", () ->
    it("can attach functions to the global namespace", () ->
      functional.expose()
      expect(typeof compose).toEqual('function')
    )
  )

  describe("autoCurry", () ->
    it("is added to the Function prototype", () ->
      expect(typeof Function.prototype.autoCurry).toEqual('function')
    )
    
    it("enables a function to be partially applied", () ->
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

  describe("map", () ->
    it("returns the correct result when iterating over an array", () ->
      expect(map(addOne, [1, 2, 3])).toEqual([2, 3, 4])
    )

    it("partially applies arguments", () ->
      expect(map(addOne)([1, 2, 3])).toEqual([2, 3, 4])
    )
  )

  describe("compose", () ->
    it("composes functions, and applies functions right to left", () ->
      expect(compose(addOne, times2)(3)).toEqual(7)
      expect(compose(addOne, times2, sum)(1, 2)).toEqual(7)
    )
  )

  describe("sequence", () ->
    it("composes functions, and applies functions left to right", () ->
      expect(sequence(times2, addOne)(3)).toEqual(7)
      expect(sequence(sum, times2, addOne)(1, 2)).toEqual(7)
    )
  )

  describe("compose_p", () ->
    xit("composes functions in parallel, applies functons from right to left", () ->
      expect(compose_p(addOne, times2)(3)).toEqual(7)
    )
  )

  describe("memoize", () ->
    fib = (n) -> if n < 2 then n else fib(n - 1) + fib(n - 2)
    fastFib = memoize(fib)

    it("returns a memoized function that produces identical results", () ->
      expect(fib(10)).toEqual(55)
      expect(fastFib(10)).toEqual(55)
    ) 
  )

  describe("reduce", () ->
    it("can sum up an array", () ->
      expect(reduce(sum, 0, [1, 2, 3])).toEqual(6)
    )
    it("can partially apply arguments", () ->
      expect(reduce(sum)(0, [1, 2, 3])).toEqual(6)
      expect(reduce(sum, 0)([1, 2, 3])).toEqual(6)
    )
  )
)
