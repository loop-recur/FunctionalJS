functional = require('../functional')

describe("functional", () ->
  it("should load properly using different module schemes", () ->
    expect(functional).not.toBeUndefined()
    expect(typeof functional.compose).toEqual('function')
  )

  it("should be able to load functions into the global namespace", () ->
    functional.expose()
    expect(typeof compose).toEqual('function')
  )

  describe("autoCurry", () ->
    it("should be added to the Function prototype", () ->
      expect(typeof Function.prototype.autoCurry).toEqual('function')
    )
    
    it("should enable a function to be partially applied", () ->
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
)
