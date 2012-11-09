functional = require('../functional')
functional.expose()

describe("functional", () ->
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
    addOne = (x) -> x + 1

    it("returns the correct result when iterating over an array", () ->
      expect(map(addOne, [1, 2, 3])).toEqual([2, 3, 4])
    )

    it("partially applies arguments", () ->
      expect(map(addOne)([1, 2, 3])).toEqual([2, 3, 4])
    )
  )

  describe("compose", () ->
    addOne = (x) -> x + 1
    times2 = (x) -> x * 2
    
    it("composes functions, and applies functions right to left", () ->
      expect(compose(addOne, times2)(3)).toEqual(7)
    )
  )

  describe("sequence", () ->
    addOne = (x) -> x + 1
    times2 = (x) -> x * 2

    it("composes functions, and applies functions left to right", () ->
      expect(sequence(addOne, times2)(3)).toEqual(8)
    )
  )

)
