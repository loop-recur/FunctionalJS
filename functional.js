;(function (window, undefined) {

  var functional = {} // create "functional" namespace
    , oldFunctional = {}
    , _ = Function._ = {}
    , _initialFunctionPrototypeState

  //+ freeExports :: Bool
    , freeExports = typeof exports == 'object' && exports

  //+ freeGlobal :: Bool
    , freeGlobal = typeof global == 'object' && global

  //- slice :: create local reference for faster look-up
    , slice = Array.prototype.slice

  //+ toArray :: a -> [b]
    , toArray = function (x) {
        return slice.call(x);
      }
  
  //- from wu.js <http://fitzgen.github.com/wu.js/>
  //+ curry :: f -> ? -> g
    , curry = function (fn /* variadic number of args */) {
        var args = slice.call(arguments, 1);
        return function () {
          return fn.apply(this, args.concat(toArray(arguments)));
        };
      }

  //- from wu.js <http://fitzgen.github.com/wu.js/>
  //+ autoCurry :: f -> Int -> g
    , autoCurry = function (fn, numArgs) {
        numArgs = numArgs || fn.length;
        var f = function () {
          if (arguments.length < numArgs) {
            return numArgs - arguments.length > 0 ?
              autoCurry(curry.apply(this, [fn].concat(toArray(arguments))),
                numArgs - arguments.length) :
              curry.apply(this, [fn].concat(toArray(arguments)));
          }
          else {
            return fn.apply(this, arguments);
          }
        };
        f.toString = function(){ return fn.toString(); };
        f.curried = true;
        return f;
      }

  //+ decorateFunctionPrototypeWithAutoCurry :: IO
    , decorateFunctionPrototypeWithAutoCurry = (function () {
        Function.prototype.autoCurry = function (n) {
          return autoCurry(this, n);
        };
      })()

  //+ map :: f -> [a] -> [b]
    , map = function (fn, sequence) {
        var length = sequence.length,
            result = new Array(length),
            i;
        fn = Function.toFunction(fn);
        for (i = 0; i < length; i++) {
          result[i] = fn.apply(null, [sequence[i], i]);
        }
        return result;
      }.autoCurry()

  //+ compose :: f -> g -> h 
    , compose = function () {
        var fns = map(Function.toFunction, arguments),
            arglen = fns.length;
        return function () {
          var i;
          for (i = arglen; --i>=0;) {
            arguments = [fns[i].apply(this, arguments)];
          }
          return arguments[0];
        };
      }

  //+ sequence :: f -> g -> h
    , sequence = function () {
        var fns = map(Function.toFunction, arguments),
            arglen = fns.length;
        return function () {
          var i;
          for (i = 0; i < arglen; i++) {
            arguments = [fns[i].apply(this, arguments)];
          }
          return arguments[0];
        };
      }

  //+ memoize :: f -> g
    , memoize = function (fn) {  
        return function () {  
            var args = Array.prototype.slice.call(arguments),  
                hash = "",  
                i = args.length;  
            currentArg = null;  
            while (i--) {  
                currentArg = args[i];  
                hash += (currentArg === Object(currentArg)) ?  
                JSON.stringify(currentArg) : currentArg;  
                fn.memoize || (fn.memoize = {});  
            }  
            return (hash in fn.memoize) ? fn.memoize[hash] :  
            fn.memoize[hash] = fn.apply(this, args);  
        };  
      }

  //+ reduce :: f -> a -> [a] -> a
    , reduce = function (fn,init,sequence) {
        var len = sequence.length,
            result = init,
            i;
        fn = Function.toFunction(fn);
        for(i = 0; i < len; i++) {
          result = fn.apply(null, [result, sequence[i]]);
        }
        return result;
      }.autoCurry()

  //+ select :: f -> [a] -> [a]
    , select = function (fn, sequence) {
        var len = sequence.length,
            result = [],
            i, x;
        fn = Function.toFunction(fn);
        for(i = 0; i < len; i++) {
          x = sequence[i];
          fn.apply(null, [x, i]) && result.push(x);
        }
        return result;
      }.autoCurry()

  //+ guard :: (_ -> Bool) -> f -> g -> h
    , guard = function (guard, fn, otherwise) {
        guard = Function.toFunction(guard || I);
        fn = Function.toFunction(fn);
        otherwise = Function.toFunction(otherwise || I);
        return function () {
          return (guard.apply(this, arguments) ? fn : otherwise)
            .apply(this, arguments);
        };
      }.autoCurry()

  //+ flip :: f -> g 
    , flip = function(f) {
        return function () {
          var args = slice.call(arguments, 0);
          args = args.slice(1, 2)
                .concat(args.slice(0, 1))
                .concat(args.slice(2));
          return f.apply(null, args);
        };
      }

  //+ foldr :: f -> a -> [a] -> a
    , foldr = function (fn, init, sequence) {
        var len = sequence.length,
            result = init,
            i;
        fn = Function.toFunction(fn);
        for(i = len; --i >= 0;) {
          result = fn.apply(null, [sequence[i],result]);
        }
        return result;
      }.autoCurry()

  //+ and :: _ -> (_ -> Bool)
    , and = function () {
        var args = map(Function.toFunction, arguments),
            arglen = args.length;
        return function () {
          var value = true, i;
          for (i = 0; i < arglen; i++) {
            if(!(value = args[i].apply(this, arguments)))
              break;
          }
          return value;
        };
      }

  //+ or :: _ -> (_ -> Bool)
    , or = function () {
        var args = map(Function.toFunction, arguments),
            arglen = args.length;
        return function () {
          var value = false, i;
          for (i = 0; i < arglen; i++) {
            if ((value = args[i].apply(this, arguments)))
              break;
          }
          return value;
        };
      }

  //+ some :: f -> [a] -> Bool
    , some = function (fn, sequence) {
        fn = Function.toFunction(fn);
        var len = sequence.length,
            value = false,
            i;
        for (i = 0; i < len; i++) {
          if ((value = fn.call(null, sequence[i])))
            break;
        }
        return value;
      }.autoCurry()

  //+ every :: f -> [a] -> Bool
    , every = function (fn, sequence) {
        fn = Function.toFunction(fn);
        var len = sequence.length,
            value = true,
            i;
        for (i = 0; i < len; i++) {
          if (!(value = fn.call(null, sequence[i])))
            break;
        }
        return value;
      }.autoCurry()

  //+ not :: f -> (_ -> Bool)
    , not = function (fn) {
        fn = Function.toFunction(fn);
        return function () {
          return !fn.apply(null, arguments);
        };
      }

  //+ equal :: _ -> (_ -> Bool)
    , equal = function () {
        var arglen = arguments.length,
            args = map(Function.toFunction, arguments);
        if (!arglen) {
          return K(true);
        }
        return function () {
          var value = args[0].apply(this, arguments),
              i;
          for (i = 1; i < arglen; i++){
            if (value != args[i].apply(this, args))
              return false;
          }
          return true;
        };
      }

  //+ lamda :: a -> f
    , lambda = function (object) { 
        return object.toFunction(); 
      }

  //+ invoke :: String -> (a -> b)
    , invoke = function (methodName) { 
        var args = slice.call(arguments, 1);
        return function(object) {
          return object[methodName].apply(object, slice.call(arguments, 1).concat(args));
        };
      }

  //+ pluck :: String -> a -> b
    , pluck = function (name, obj) {
        return obj[name];
      }.autoCurry()

  //+ until :: a -> f -> (b -> c)
    , until = function (pred, fn) {
        fn = Function.toFunction(fn);
        pred = Function.toFunction(pred);
        return function (value) {
          while (!pred.call(null, value)) {
            value = fn.call(null, value);
          }
          return value;
        }
      }.autoCurry()

  //+ zip :: (List ...) => [a] -> [b] -> ... -> [[a, b, ...]]
    , zip = function() {
        var n = Math.min.apply(null, map('.length',arguments)),
            results = new Array(n),
            key, i;
        for (i = 0; i < n; i++) {
          key = String(i);
          results[key] = map(pluck(key), arguments);
        };
        return results;
      }

  //+ I :: a -> a
    , I = function(x) { return x }

  //+ K :: a -> (_ -> a)
    , K = function(x) { return function () { return x } }
      
  //+ S ::
    , S = function(f, g) {
        var toFunction = Function.toFunction;
        f = toFunction(f);
        g = toFunction(g);
        return function () { 
          var return_value_of_g = g.apply(this, arguments)
            , original_args = slice.call(arguments, 0)
            , all_args = [return_value_of_g].concat(original_args);
          return f.apply(this, all_args);
        };
      }

  //+ partial :: _ -> f
    , partial = function() {
        var fn = this
          , _ = Function._
          , args = slice.call(arguments, 0)
          , subpos = []
          , i
          , value
          ;

        for(i = 0; i < arguments.length; i++) {
          arguments[i] == _ && subpos.push(i);
        }
        return function () {
          var specialized = args.concat(slice.call(arguments, subpos.length)),
              i;
          for (i = 0; i < Math.min(subpos.length, arguments.length); i++) {
            specialized[subpos[i]] = arguments[i];
          }
          for (i = 0; i < specialized.length; i++) {
            if (specialized[i] === _) {
              return fn.partial.apply(fn, specialized);
            }
          } 
          return fn.apply(this,specialized);
        };
      }

  //+ decorateFunctionPrototypeWithPartial :: IO
    , decorateFunctionPrototypeWithPartial = (function() {
        Function.prototype.partial = partial;
        Function.prototype.p = partial;
      }())
  
  //+ decorateFunctionWithToFunction :: IO
    , decorateFunctionWithToFunction = (function() {
        Function.toFunction = function(value) {return value.toFunction();}
        Function.prototype.toFunction = function() { return this; }
      }())
    ;
  
  
  // 
  // Decorate String prototype with higher order methods
  //

  String.prototype.lambda = function () {
    var params = [],
        expr = this,
        sections = expr.ECMAsplit(/\s*->\s*/m);
    if (sections.length > 1) {
      while (sections.length) {
        expr = sections.pop();
        params = sections.pop().split(/\s*,\s*|\s+/m);
        sections.length && sections.push('(function('+params+'){return ('+expr+')})');
      }
    } else if (expr.match(/\b_\b/)) {
      params = '_';
    } else {
      var leftSection = expr.match(/^\s*(?:[+*\/%&|\^\.=<>]|!=)/m)
        , rightSection = expr.match(/[+\-*\/%&|\^\.=<>!]\s*$/m)
        ;
      if (leftSection || rightSection) {
        if (leftSection) {
          params.push('$1');
          expr = '$1'+expr;
        }
        if (rightSection) {
          params.push('$2');
          expr = expr+'$2';
        }
      } else {
        var vars = this.replace(/(?:\b[A-Z]|\.[a-zA-Z_$])[a-zA-Z_$\d]*|[a-zA-Z_$][a-zA-Z_$\d]*\s*:|this|arguments|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g,'').match(/([a-z_$][a-z_$\d]*)/gi) || [];
        for (var i = 0,v; v = vars[i++];)
          params.indexOf(v)>=0||params.push(v);
      }
    }
    return new Function(params,'return ('+expr+')');
  }

  String.prototype.lambda.cache = function () {
    var proto = String.prototype,
        cache = {},
        uncached = proto.lambda,
        cached;
    cached = function () {
      var key = '#' + this;
      return cache[key] || (cache[key] = uncached.call(this));
    };
    cached.cached = function () {};
    cached.uncache = function () { proto.lambda = uncached };
    proto.lambda = cached;
  }

  String.prototype.toFunction = function () {
    var body = this;
    if (body.match(/\breturn\b/)) {
      return new Function(this);
    }
    return this.lambda();
  }

  function ECMAsplit(separator, limit) {
    if (typeof limit != 'undefined') {
      throw "ECMAsplit: limit is unimplemented";
    }
    var result = this.split.apply(this, arguments)
      , re = RegExp(separator)
      , savedIndex = re.lastIndex
      , match = re.exec(this)
      ;
    if (match && match.index == 0) {
      result.unshift('');
    }
    re.lastIndex = savedIndex;
    return result;
  };

  String.prototype.ECMAsplit = (
    'ab'.split(/a*/).length > 1 ? String.prototype.split : ECMAsplit
  );

  // Add functions to the "functional" namespace,
  functional.map = map;
  functional.compose = compose;
  functional.sequence = sequence;
  functional.memoize = memoize;
  functional.reduce = reduce;
  functional.foldl = reduce;
  functional.select = select;
  functional.filter = select;
  functional.guard = guard;
  functional.flip = flip;
  functional.foldr = foldr;
  functional.and = and;
  functional.and_ = and; // alias reserved word for coffeescript
  functional.or = or;
  functional.or_ = or; // alias reserved word for coffeescript
  functional.some = some;
  functional.every = every;
  functional.not = not;
  functional.not_ = not; // alias reserved word for coffeescript
  functional.equal = equal;
  functional.lambda = lambda;
  functional.invoke = invoke;
  functional.pluck = pluck;
  functional.until = until
  functional.until_ = until; // alias reserved word for coffeescript
  functional.zip = zip;
  functional.I = I;
  functional.id = I;
  functional.K = K;
  functional.konst = K;
  functional.S = S;

  // Detect free variable "global" and use it as "window"
  if (freeGlobal.global === freeGlobal) {
    window = freeGlobal;
  }

  // Used to restore the original reference in "noConflict()"
  oldFunctional = window.functional;

  // Reverts the "functional" variable to its previous value and 
  // returns a reference to the "functional" function.
  // example:
  //   var functional = functional.noConflict();
  functional.noConflict = function noConflict() {
    window.functional = oldFunctional;
    return this;
  }

  // Expose all functions to the global namespace, or specified environment
  functional.expose = function expose(env) {
    var fn;
    env = env || window;
    for (fn in functional) {
      if (fn !== 'expose' && functional.hasOwnProperty(fn)) {
        env[fn] = functional[fn];
      }
    }
  };

  // Expose FunctionalJS library
  // Some AMD build optimizers, like r.js, check for specific condition
  // patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose FunctionalJs to the global object even when an AMD loader
    // is present, in case FunctionalJS was injected by a third-party
    // script and not intended to be loaded as module. The global
    // assignment can be reverted in the FunctionalJS module via its
    // "noConflict()" method.
    window.functional = functional;

    // Define an anonymous AMD module
    define(function () { return functional; });
  }

  // Check for "exports" after "define", in case a build optimizer adds
  // an "exports" object.
  else if (freeExports) {
    // Node.js or RingoJS v0.8.0+
    if (typeof module == 'object' && module && module.exports == freeExports) {
      module.exports = functional;
    }
    // Narwhal or RingoJS v0.7.0-
    else {
      freeExports.functional = functional;
    }
  }

}(this));
