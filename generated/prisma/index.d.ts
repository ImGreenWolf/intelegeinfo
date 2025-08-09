
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Project
 * 
 */
export type Project = $Result.DefaultSelection<Prisma.$ProjectPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Code
 * 
 */
export type Code = $Result.DefaultSelection<Prisma.$CodePayload>
/**
 * Model RefreshToken
 * 
 */
export type RefreshToken = $Result.DefaultSelection<Prisma.$RefreshTokenPayload>
/**
 * Model Guide
 * 
 */
export type Guide = $Result.DefaultSelection<Prisma.$GuidePayload>
/**
 * Model Tag
 * 
 */
export type Tag = $Result.DefaultSelection<Prisma.$TagPayload>
/**
 * Model GuideTag
 * 
 */
export type GuideTag = $Result.DefaultSelection<Prisma.$GuideTagPayload>
/**
 * Model Problem
 * 
 */
export type Problem = $Result.DefaultSelection<Prisma.$ProblemPayload>
/**
 * Model Solve
 * 
 */
export type Solve = $Result.DefaultSelection<Prisma.$SolvePayload>
/**
 * Model Course
 * 
 */
export type Course = $Result.DefaultSelection<Prisma.$CoursePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const OccupationType: {
  Student: 'Student',
  Teacher: 'Teacher',
  None: 'None'
};

export type OccupationType = (typeof OccupationType)[keyof typeof OccupationType]


export const Role: {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

export type Role = (typeof Role)[keyof typeof Role]


export const Difficulty: {
  Easy: 'Easy',
  Medium: 'Medium',
  Hard: 'Hard',
  Competition: 'Competition'
};

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty]

}

export type OccupationType = $Enums.OccupationType

export const OccupationType: typeof $Enums.OccupationType

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type Difficulty = $Enums.Difficulty

export const Difficulty: typeof $Enums.Difficulty

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Projects
 * const projects = await prisma.project.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Projects
   * const projects = await prisma.project.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.project`: Exposes CRUD operations for the **Project** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Projects
    * const projects = await prisma.project.findMany()
    * ```
    */
  get project(): Prisma.ProjectDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.code`: Exposes CRUD operations for the **Code** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Codes
    * const codes = await prisma.code.findMany()
    * ```
    */
  get code(): Prisma.CodeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.refreshToken`: Exposes CRUD operations for the **RefreshToken** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RefreshTokens
    * const refreshTokens = await prisma.refreshToken.findMany()
    * ```
    */
  get refreshToken(): Prisma.RefreshTokenDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.guide`: Exposes CRUD operations for the **Guide** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Guides
    * const guides = await prisma.guide.findMany()
    * ```
    */
  get guide(): Prisma.GuideDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tag`: Exposes CRUD operations for the **Tag** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tags
    * const tags = await prisma.tag.findMany()
    * ```
    */
  get tag(): Prisma.TagDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.guideTag`: Exposes CRUD operations for the **GuideTag** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GuideTags
    * const guideTags = await prisma.guideTag.findMany()
    * ```
    */
  get guideTag(): Prisma.GuideTagDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.problem`: Exposes CRUD operations for the **Problem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Problems
    * const problems = await prisma.problem.findMany()
    * ```
    */
  get problem(): Prisma.ProblemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.solve`: Exposes CRUD operations for the **Solve** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Solves
    * const solves = await prisma.solve.findMany()
    * ```
    */
  get solve(): Prisma.SolveDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.course`: Exposes CRUD operations for the **Course** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Courses
    * const courses = await prisma.course.findMany()
    * ```
    */
  get course(): Prisma.CourseDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.11.1
   * Query Engine version: f40f79ec31188888a2e33acda0ecc8fd10a853a9
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Project: 'Project',
    User: 'User',
    Code: 'Code',
    RefreshToken: 'RefreshToken',
    Guide: 'Guide',
    Tag: 'Tag',
    GuideTag: 'GuideTag',
    Problem: 'Problem',
    Solve: 'Solve',
    Course: 'Course'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "project" | "user" | "code" | "refreshToken" | "guide" | "tag" | "guideTag" | "problem" | "solve" | "course"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Project: {
        payload: Prisma.$ProjectPayload<ExtArgs>
        fields: Prisma.ProjectFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProjectFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProjectFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          findFirst: {
            args: Prisma.ProjectFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProjectFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          findMany: {
            args: Prisma.ProjectFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          create: {
            args: Prisma.ProjectCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          createMany: {
            args: Prisma.ProjectCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProjectCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          delete: {
            args: Prisma.ProjectDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          update: {
            args: Prisma.ProjectUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          deleteMany: {
            args: Prisma.ProjectDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProjectUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProjectUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          upsert: {
            args: Prisma.ProjectUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          aggregate: {
            args: Prisma.ProjectAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProject>
          }
          groupBy: {
            args: Prisma.ProjectGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProjectGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProjectCountArgs<ExtArgs>
            result: $Utils.Optional<ProjectCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Code: {
        payload: Prisma.$CodePayload<ExtArgs>
        fields: Prisma.CodeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CodeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CodeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>
          }
          findFirst: {
            args: Prisma.CodeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CodeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>
          }
          findMany: {
            args: Prisma.CodeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>[]
          }
          create: {
            args: Prisma.CodeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>
          }
          createMany: {
            args: Prisma.CodeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CodeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>[]
          }
          delete: {
            args: Prisma.CodeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>
          }
          update: {
            args: Prisma.CodeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>
          }
          deleteMany: {
            args: Prisma.CodeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CodeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CodeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>[]
          }
          upsert: {
            args: Prisma.CodeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>
          }
          aggregate: {
            args: Prisma.CodeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCode>
          }
          groupBy: {
            args: Prisma.CodeGroupByArgs<ExtArgs>
            result: $Utils.Optional<CodeGroupByOutputType>[]
          }
          count: {
            args: Prisma.CodeCountArgs<ExtArgs>
            result: $Utils.Optional<CodeCountAggregateOutputType> | number
          }
        }
      }
      RefreshToken: {
        payload: Prisma.$RefreshTokenPayload<ExtArgs>
        fields: Prisma.RefreshTokenFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RefreshTokenFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RefreshTokenFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          findFirst: {
            args: Prisma.RefreshTokenFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RefreshTokenFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          findMany: {
            args: Prisma.RefreshTokenFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>[]
          }
          create: {
            args: Prisma.RefreshTokenCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          createMany: {
            args: Prisma.RefreshTokenCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RefreshTokenCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>[]
          }
          delete: {
            args: Prisma.RefreshTokenDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          update: {
            args: Prisma.RefreshTokenUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          deleteMany: {
            args: Prisma.RefreshTokenDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RefreshTokenUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RefreshTokenUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>[]
          }
          upsert: {
            args: Prisma.RefreshTokenUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          aggregate: {
            args: Prisma.RefreshTokenAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRefreshToken>
          }
          groupBy: {
            args: Prisma.RefreshTokenGroupByArgs<ExtArgs>
            result: $Utils.Optional<RefreshTokenGroupByOutputType>[]
          }
          count: {
            args: Prisma.RefreshTokenCountArgs<ExtArgs>
            result: $Utils.Optional<RefreshTokenCountAggregateOutputType> | number
          }
        }
      }
      Guide: {
        payload: Prisma.$GuidePayload<ExtArgs>
        fields: Prisma.GuideFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GuideFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GuideFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload>
          }
          findFirst: {
            args: Prisma.GuideFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GuideFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload>
          }
          findMany: {
            args: Prisma.GuideFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload>[]
          }
          create: {
            args: Prisma.GuideCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload>
          }
          createMany: {
            args: Prisma.GuideCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GuideCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload>[]
          }
          delete: {
            args: Prisma.GuideDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload>
          }
          update: {
            args: Prisma.GuideUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload>
          }
          deleteMany: {
            args: Prisma.GuideDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GuideUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GuideUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload>[]
          }
          upsert: {
            args: Prisma.GuideUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuidePayload>
          }
          aggregate: {
            args: Prisma.GuideAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGuide>
          }
          groupBy: {
            args: Prisma.GuideGroupByArgs<ExtArgs>
            result: $Utils.Optional<GuideGroupByOutputType>[]
          }
          count: {
            args: Prisma.GuideCountArgs<ExtArgs>
            result: $Utils.Optional<GuideCountAggregateOutputType> | number
          }
        }
      }
      Tag: {
        payload: Prisma.$TagPayload<ExtArgs>
        fields: Prisma.TagFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TagFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TagFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          findFirst: {
            args: Prisma.TagFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TagFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          findMany: {
            args: Prisma.TagFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>[]
          }
          create: {
            args: Prisma.TagCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          createMany: {
            args: Prisma.TagCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TagCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>[]
          }
          delete: {
            args: Prisma.TagDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          update: {
            args: Prisma.TagUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          deleteMany: {
            args: Prisma.TagDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TagUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TagUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>[]
          }
          upsert: {
            args: Prisma.TagUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TagPayload>
          }
          aggregate: {
            args: Prisma.TagAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTag>
          }
          groupBy: {
            args: Prisma.TagGroupByArgs<ExtArgs>
            result: $Utils.Optional<TagGroupByOutputType>[]
          }
          count: {
            args: Prisma.TagCountArgs<ExtArgs>
            result: $Utils.Optional<TagCountAggregateOutputType> | number
          }
        }
      }
      GuideTag: {
        payload: Prisma.$GuideTagPayload<ExtArgs>
        fields: Prisma.GuideTagFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GuideTagFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuideTagPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GuideTagFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuideTagPayload>
          }
          findFirst: {
            args: Prisma.GuideTagFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuideTagPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GuideTagFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuideTagPayload>
          }
          findMany: {
            args: Prisma.GuideTagFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuideTagPayload>[]
          }
          create: {
            args: Prisma.GuideTagCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuideTagPayload>
          }
          createMany: {
            args: Prisma.GuideTagCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GuideTagCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuideTagPayload>[]
          }
          delete: {
            args: Prisma.GuideTagDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuideTagPayload>
          }
          update: {
            args: Prisma.GuideTagUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuideTagPayload>
          }
          deleteMany: {
            args: Prisma.GuideTagDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GuideTagUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GuideTagUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuideTagPayload>[]
          }
          upsert: {
            args: Prisma.GuideTagUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GuideTagPayload>
          }
          aggregate: {
            args: Prisma.GuideTagAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGuideTag>
          }
          groupBy: {
            args: Prisma.GuideTagGroupByArgs<ExtArgs>
            result: $Utils.Optional<GuideTagGroupByOutputType>[]
          }
          count: {
            args: Prisma.GuideTagCountArgs<ExtArgs>
            result: $Utils.Optional<GuideTagCountAggregateOutputType> | number
          }
        }
      }
      Problem: {
        payload: Prisma.$ProblemPayload<ExtArgs>
        fields: Prisma.ProblemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProblemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProblemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>
          }
          findFirst: {
            args: Prisma.ProblemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProblemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>
          }
          findMany: {
            args: Prisma.ProblemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>[]
          }
          create: {
            args: Prisma.ProblemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>
          }
          createMany: {
            args: Prisma.ProblemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProblemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>[]
          }
          delete: {
            args: Prisma.ProblemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>
          }
          update: {
            args: Prisma.ProblemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>
          }
          deleteMany: {
            args: Prisma.ProblemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProblemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProblemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>[]
          }
          upsert: {
            args: Prisma.ProblemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProblemPayload>
          }
          aggregate: {
            args: Prisma.ProblemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProblem>
          }
          groupBy: {
            args: Prisma.ProblemGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProblemGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProblemCountArgs<ExtArgs>
            result: $Utils.Optional<ProblemCountAggregateOutputType> | number
          }
        }
      }
      Solve: {
        payload: Prisma.$SolvePayload<ExtArgs>
        fields: Prisma.SolveFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SolveFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolvePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SolveFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolvePayload>
          }
          findFirst: {
            args: Prisma.SolveFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolvePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SolveFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolvePayload>
          }
          findMany: {
            args: Prisma.SolveFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolvePayload>[]
          }
          create: {
            args: Prisma.SolveCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolvePayload>
          }
          createMany: {
            args: Prisma.SolveCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SolveCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolvePayload>[]
          }
          delete: {
            args: Prisma.SolveDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolvePayload>
          }
          update: {
            args: Prisma.SolveUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolvePayload>
          }
          deleteMany: {
            args: Prisma.SolveDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SolveUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SolveUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolvePayload>[]
          }
          upsert: {
            args: Prisma.SolveUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolvePayload>
          }
          aggregate: {
            args: Prisma.SolveAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSolve>
          }
          groupBy: {
            args: Prisma.SolveGroupByArgs<ExtArgs>
            result: $Utils.Optional<SolveGroupByOutputType>[]
          }
          count: {
            args: Prisma.SolveCountArgs<ExtArgs>
            result: $Utils.Optional<SolveCountAggregateOutputType> | number
          }
        }
      }
      Course: {
        payload: Prisma.$CoursePayload<ExtArgs>
        fields: Prisma.CourseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CourseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CourseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          findFirst: {
            args: Prisma.CourseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CourseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          findMany: {
            args: Prisma.CourseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>[]
          }
          create: {
            args: Prisma.CourseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          createMany: {
            args: Prisma.CourseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CourseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>[]
          }
          delete: {
            args: Prisma.CourseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          update: {
            args: Prisma.CourseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          deleteMany: {
            args: Prisma.CourseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CourseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CourseUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>[]
          }
          upsert: {
            args: Prisma.CourseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoursePayload>
          }
          aggregate: {
            args: Prisma.CourseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCourse>
          }
          groupBy: {
            args: Prisma.CourseGroupByArgs<ExtArgs>
            result: $Utils.Optional<CourseGroupByOutputType>[]
          }
          count: {
            args: Prisma.CourseCountArgs<ExtArgs>
            result: $Utils.Optional<CourseCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    project?: ProjectOmit
    user?: UserOmit
    code?: CodeOmit
    refreshToken?: RefreshTokenOmit
    guide?: GuideOmit
    tag?: TagOmit
    guideTag?: GuideTagOmit
    problem?: ProblemOmit
    solve?: SolveOmit
    course?: CourseOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    projects: number
    solves: number
    Guide: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    projects?: boolean | UserCountOutputTypeCountProjectsArgs
    solves?: boolean | UserCountOutputTypeCountSolvesArgs
    Guide?: boolean | UserCountOutputTypeCountGuideArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountProjectsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProjectWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSolvesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SolveWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountGuideArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GuideWhereInput
  }


  /**
   * Count Type GuideCountOutputType
   */

  export type GuideCountOutputType = {
    guideTags: number
  }

  export type GuideCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    guideTags?: boolean | GuideCountOutputTypeCountGuideTagsArgs
  }

  // Custom InputTypes
  /**
   * GuideCountOutputType without action
   */
  export type GuideCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuideCountOutputType
     */
    select?: GuideCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GuideCountOutputType without action
   */
  export type GuideCountOutputTypeCountGuideTagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GuideTagWhereInput
  }


  /**
   * Count Type TagCountOutputType
   */

  export type TagCountOutputType = {
    guideTags: number
  }

  export type TagCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    guideTags?: boolean | TagCountOutputTypeCountGuideTagsArgs
  }

  // Custom InputTypes
  /**
   * TagCountOutputType without action
   */
  export type TagCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TagCountOutputType
     */
    select?: TagCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TagCountOutputType without action
   */
  export type TagCountOutputTypeCountGuideTagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GuideTagWhereInput
  }


  /**
   * Count Type ProblemCountOutputType
   */

  export type ProblemCountOutputType = {
    solves: number
  }

  export type ProblemCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    solves?: boolean | ProblemCountOutputTypeCountSolvesArgs
  }

  // Custom InputTypes
  /**
   * ProblemCountOutputType without action
   */
  export type ProblemCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProblemCountOutputType
     */
    select?: ProblemCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProblemCountOutputType without action
   */
  export type ProblemCountOutputTypeCountSolvesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SolveWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Project
   */

  export type AggregateProject = {
    _count: ProjectCountAggregateOutputType | null
    _avg: ProjectAvgAggregateOutputType | null
    _sum: ProjectSumAggregateOutputType | null
    _min: ProjectMinAggregateOutputType | null
    _max: ProjectMaxAggregateOutputType | null
  }

  export type ProjectAvgAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type ProjectSumAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type ProjectMinAggregateOutputType = {
    id: number | null
    name: string | null
    fileUUID: string | null
    createdAt: Date | null
    userId: number | null
  }

  export type ProjectMaxAggregateOutputType = {
    id: number | null
    name: string | null
    fileUUID: string | null
    createdAt: Date | null
    userId: number | null
  }

  export type ProjectCountAggregateOutputType = {
    id: number
    name: number
    fileUUID: number
    createdAt: number
    userId: number
    _all: number
  }


  export type ProjectAvgAggregateInputType = {
    id?: true
    userId?: true
  }

  export type ProjectSumAggregateInputType = {
    id?: true
    userId?: true
  }

  export type ProjectMinAggregateInputType = {
    id?: true
    name?: true
    fileUUID?: true
    createdAt?: true
    userId?: true
  }

  export type ProjectMaxAggregateInputType = {
    id?: true
    name?: true
    fileUUID?: true
    createdAt?: true
    userId?: true
  }

  export type ProjectCountAggregateInputType = {
    id?: true
    name?: true
    fileUUID?: true
    createdAt?: true
    userId?: true
    _all?: true
  }

  export type ProjectAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Project to aggregate.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Projects
    **/
    _count?: true | ProjectCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProjectAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProjectSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProjectMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProjectMaxAggregateInputType
  }

  export type GetProjectAggregateType<T extends ProjectAggregateArgs> = {
        [P in keyof T & keyof AggregateProject]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProject[P]>
      : GetScalarType<T[P], AggregateProject[P]>
  }




  export type ProjectGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProjectWhereInput
    orderBy?: ProjectOrderByWithAggregationInput | ProjectOrderByWithAggregationInput[]
    by: ProjectScalarFieldEnum[] | ProjectScalarFieldEnum
    having?: ProjectScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProjectCountAggregateInputType | true
    _avg?: ProjectAvgAggregateInputType
    _sum?: ProjectSumAggregateInputType
    _min?: ProjectMinAggregateInputType
    _max?: ProjectMaxAggregateInputType
  }

  export type ProjectGroupByOutputType = {
    id: number
    name: string
    fileUUID: string
    createdAt: Date
    userId: number
    _count: ProjectCountAggregateOutputType | null
    _avg: ProjectAvgAggregateOutputType | null
    _sum: ProjectSumAggregateOutputType | null
    _min: ProjectMinAggregateOutputType | null
    _max: ProjectMaxAggregateOutputType | null
  }

  type GetProjectGroupByPayload<T extends ProjectGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProjectGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProjectGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProjectGroupByOutputType[P]>
            : GetScalarType<T[P], ProjectGroupByOutputType[P]>
        }
      >
    >


  export type ProjectSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    fileUUID?: boolean
    createdAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    fileUUID?: boolean
    createdAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    fileUUID?: boolean
    createdAt?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectScalar = {
    id?: boolean
    name?: boolean
    fileUUID?: boolean
    createdAt?: boolean
    userId?: boolean
  }

  export type ProjectOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "fileUUID" | "createdAt" | "userId", ExtArgs["result"]["project"]>
  export type ProjectInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ProjectIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ProjectIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ProjectPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Project"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      fileUUID: string
      createdAt: Date
      userId: number
    }, ExtArgs["result"]["project"]>
    composites: {}
  }

  type ProjectGetPayload<S extends boolean | null | undefined | ProjectDefaultArgs> = $Result.GetResult<Prisma.$ProjectPayload, S>

  type ProjectCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProjectFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProjectCountAggregateInputType | true
    }

  export interface ProjectDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Project'], meta: { name: 'Project' } }
    /**
     * Find zero or one Project that matches the filter.
     * @param {ProjectFindUniqueArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProjectFindUniqueArgs>(args: SelectSubset<T, ProjectFindUniqueArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Project that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProjectFindUniqueOrThrowArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProjectFindUniqueOrThrowArgs>(args: SelectSubset<T, ProjectFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Project that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindFirstArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProjectFindFirstArgs>(args?: SelectSubset<T, ProjectFindFirstArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Project that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindFirstOrThrowArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProjectFindFirstOrThrowArgs>(args?: SelectSubset<T, ProjectFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Projects that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Projects
     * const projects = await prisma.project.findMany()
     * 
     * // Get first 10 Projects
     * const projects = await prisma.project.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const projectWithIdOnly = await prisma.project.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProjectFindManyArgs>(args?: SelectSubset<T, ProjectFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Project.
     * @param {ProjectCreateArgs} args - Arguments to create a Project.
     * @example
     * // Create one Project
     * const Project = await prisma.project.create({
     *   data: {
     *     // ... data to create a Project
     *   }
     * })
     * 
     */
    create<T extends ProjectCreateArgs>(args: SelectSubset<T, ProjectCreateArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Projects.
     * @param {ProjectCreateManyArgs} args - Arguments to create many Projects.
     * @example
     * // Create many Projects
     * const project = await prisma.project.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProjectCreateManyArgs>(args?: SelectSubset<T, ProjectCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Projects and returns the data saved in the database.
     * @param {ProjectCreateManyAndReturnArgs} args - Arguments to create many Projects.
     * @example
     * // Create many Projects
     * const project = await prisma.project.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Projects and only return the `id`
     * const projectWithIdOnly = await prisma.project.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProjectCreateManyAndReturnArgs>(args?: SelectSubset<T, ProjectCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Project.
     * @param {ProjectDeleteArgs} args - Arguments to delete one Project.
     * @example
     * // Delete one Project
     * const Project = await prisma.project.delete({
     *   where: {
     *     // ... filter to delete one Project
     *   }
     * })
     * 
     */
    delete<T extends ProjectDeleteArgs>(args: SelectSubset<T, ProjectDeleteArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Project.
     * @param {ProjectUpdateArgs} args - Arguments to update one Project.
     * @example
     * // Update one Project
     * const project = await prisma.project.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProjectUpdateArgs>(args: SelectSubset<T, ProjectUpdateArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Projects.
     * @param {ProjectDeleteManyArgs} args - Arguments to filter Projects to delete.
     * @example
     * // Delete a few Projects
     * const { count } = await prisma.project.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProjectDeleteManyArgs>(args?: SelectSubset<T, ProjectDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Projects
     * const project = await prisma.project.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProjectUpdateManyArgs>(args: SelectSubset<T, ProjectUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Projects and returns the data updated in the database.
     * @param {ProjectUpdateManyAndReturnArgs} args - Arguments to update many Projects.
     * @example
     * // Update many Projects
     * const project = await prisma.project.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Projects and only return the `id`
     * const projectWithIdOnly = await prisma.project.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProjectUpdateManyAndReturnArgs>(args: SelectSubset<T, ProjectUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Project.
     * @param {ProjectUpsertArgs} args - Arguments to update or create a Project.
     * @example
     * // Update or create a Project
     * const project = await prisma.project.upsert({
     *   create: {
     *     // ... data to create a Project
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Project we want to update
     *   }
     * })
     */
    upsert<T extends ProjectUpsertArgs>(args: SelectSubset<T, ProjectUpsertArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectCountArgs} args - Arguments to filter Projects to count.
     * @example
     * // Count the number of Projects
     * const count = await prisma.project.count({
     *   where: {
     *     // ... the filter for the Projects we want to count
     *   }
     * })
    **/
    count<T extends ProjectCountArgs>(
      args?: Subset<T, ProjectCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProjectCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProjectAggregateArgs>(args: Subset<T, ProjectAggregateArgs>): Prisma.PrismaPromise<GetProjectAggregateType<T>>

    /**
     * Group by Project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProjectGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProjectGroupByArgs['orderBy'] }
        : { orderBy?: ProjectGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProjectGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProjectGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Project model
   */
  readonly fields: ProjectFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Project.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProjectClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Project model
   */
  interface ProjectFieldRefs {
    readonly id: FieldRef<"Project", 'Int'>
    readonly name: FieldRef<"Project", 'String'>
    readonly fileUUID: FieldRef<"Project", 'String'>
    readonly createdAt: FieldRef<"Project", 'DateTime'>
    readonly userId: FieldRef<"Project", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Project findUnique
   */
  export type ProjectFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project findUniqueOrThrow
   */
  export type ProjectFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project findFirst
   */
  export type ProjectFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Projects.
     */
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project findFirstOrThrow
   */
  export type ProjectFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Projects.
     */
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project findMany
   */
  export type ProjectFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Projects to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project create
   */
  export type ProjectCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * The data needed to create a Project.
     */
    data: XOR<ProjectCreateInput, ProjectUncheckedCreateInput>
  }

  /**
   * Project createMany
   */
  export type ProjectCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Projects.
     */
    data: ProjectCreateManyInput | ProjectCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Project createManyAndReturn
   */
  export type ProjectCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * The data used to create many Projects.
     */
    data: ProjectCreateManyInput | ProjectCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Project update
   */
  export type ProjectUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * The data needed to update a Project.
     */
    data: XOR<ProjectUpdateInput, ProjectUncheckedUpdateInput>
    /**
     * Choose, which Project to update.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project updateMany
   */
  export type ProjectUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Projects.
     */
    data: XOR<ProjectUpdateManyMutationInput, ProjectUncheckedUpdateManyInput>
    /**
     * Filter which Projects to update
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to update.
     */
    limit?: number
  }

  /**
   * Project updateManyAndReturn
   */
  export type ProjectUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * The data used to update Projects.
     */
    data: XOR<ProjectUpdateManyMutationInput, ProjectUncheckedUpdateManyInput>
    /**
     * Filter which Projects to update
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Project upsert
   */
  export type ProjectUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * The filter to search for the Project to update in case it exists.
     */
    where: ProjectWhereUniqueInput
    /**
     * In case the Project found by the `where` argument doesn't exist, create a new Project with this data.
     */
    create: XOR<ProjectCreateInput, ProjectUncheckedCreateInput>
    /**
     * In case the Project was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProjectUpdateInput, ProjectUncheckedUpdateInput>
  }

  /**
   * Project delete
   */
  export type ProjectDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter which Project to delete.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project deleteMany
   */
  export type ProjectDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Projects to delete
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to delete.
     */
    limit?: number
  }

  /**
   * Project without action
   */
  export type ProjectDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    username: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    emailValidated: boolean | null
    userColor: string | null
    picture: string | null
    role: $Enums.Role | null
    createdAt: Date | null
    activeAt: Date | null
    password: string | null
    loginMethod: string | null
    occupationType: $Enums.OccupationType | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    username: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    emailValidated: boolean | null
    userColor: string | null
    picture: string | null
    role: $Enums.Role | null
    createdAt: Date | null
    activeAt: Date | null
    password: string | null
    loginMethod: string | null
    occupationType: $Enums.OccupationType | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    username: number
    firstName: number
    lastName: number
    email: number
    emailValidated: number
    userColor: number
    picture: number
    role: number
    createdAt: number
    activeAt: number
    password: number
    loginMethod: number
    occupationType: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    username?: true
    firstName?: true
    lastName?: true
    email?: true
    emailValidated?: true
    userColor?: true
    picture?: true
    role?: true
    createdAt?: true
    activeAt?: true
    password?: true
    loginMethod?: true
    occupationType?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    username?: true
    firstName?: true
    lastName?: true
    email?: true
    emailValidated?: true
    userColor?: true
    picture?: true
    role?: true
    createdAt?: true
    activeAt?: true
    password?: true
    loginMethod?: true
    occupationType?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    username?: true
    firstName?: true
    lastName?: true
    email?: true
    emailValidated?: true
    userColor?: true
    picture?: true
    role?: true
    createdAt?: true
    activeAt?: true
    password?: true
    loginMethod?: true
    occupationType?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    username: string
    firstName: string
    lastName: string
    email: string
    emailValidated: boolean
    userColor: string
    picture: string
    role: $Enums.Role
    createdAt: Date
    activeAt: Date
    password: string
    loginMethod: string
    occupationType: $Enums.OccupationType
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    emailValidated?: boolean
    userColor?: boolean
    picture?: boolean
    role?: boolean
    createdAt?: boolean
    activeAt?: boolean
    password?: boolean
    loginMethod?: boolean
    occupationType?: boolean
    projects?: boolean | User$projectsArgs<ExtArgs>
    solves?: boolean | User$solvesArgs<ExtArgs>
    Guide?: boolean | User$GuideArgs<ExtArgs>
    Course?: boolean | User$CourseArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    emailValidated?: boolean
    userColor?: boolean
    picture?: boolean
    role?: boolean
    createdAt?: boolean
    activeAt?: boolean
    password?: boolean
    loginMethod?: boolean
    occupationType?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    emailValidated?: boolean
    userColor?: boolean
    picture?: boolean
    role?: boolean
    createdAt?: boolean
    activeAt?: boolean
    password?: boolean
    loginMethod?: boolean
    occupationType?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    username?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    emailValidated?: boolean
    userColor?: boolean
    picture?: boolean
    role?: boolean
    createdAt?: boolean
    activeAt?: boolean
    password?: boolean
    loginMethod?: boolean
    occupationType?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "username" | "firstName" | "lastName" | "email" | "emailValidated" | "userColor" | "picture" | "role" | "createdAt" | "activeAt" | "password" | "loginMethod" | "occupationType", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    projects?: boolean | User$projectsArgs<ExtArgs>
    solves?: boolean | User$solvesArgs<ExtArgs>
    Guide?: boolean | User$GuideArgs<ExtArgs>
    Course?: boolean | User$CourseArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      projects: Prisma.$ProjectPayload<ExtArgs>[]
      solves: Prisma.$SolvePayload<ExtArgs>[]
      Guide: Prisma.$GuidePayload<ExtArgs>[]
      Course: Prisma.$CoursePayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      username: string
      firstName: string
      lastName: string
      email: string
      emailValidated: boolean
      userColor: string
      picture: string
      role: $Enums.Role
      createdAt: Date
      activeAt: Date
      password: string
      loginMethod: string
      occupationType: $Enums.OccupationType
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    projects<T extends User$projectsArgs<ExtArgs> = {}>(args?: Subset<T, User$projectsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    solves<T extends User$solvesArgs<ExtArgs> = {}>(args?: Subset<T, User$solvesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SolvePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    Guide<T extends User$GuideArgs<ExtArgs> = {}>(args?: Subset<T, User$GuideArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    Course<T extends User$CourseArgs<ExtArgs> = {}>(args?: Subset<T, User$CourseArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly username: FieldRef<"User", 'String'>
    readonly firstName: FieldRef<"User", 'String'>
    readonly lastName: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly emailValidated: FieldRef<"User", 'Boolean'>
    readonly userColor: FieldRef<"User", 'String'>
    readonly picture: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly activeAt: FieldRef<"User", 'DateTime'>
    readonly password: FieldRef<"User", 'String'>
    readonly loginMethod: FieldRef<"User", 'String'>
    readonly occupationType: FieldRef<"User", 'OccupationType'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.projects
   */
  export type User$projectsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    where?: ProjectWhereInput
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    cursor?: ProjectWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * User.solves
   */
  export type User$solvesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Solve
     */
    select?: SolveSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Solve
     */
    omit?: SolveOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolveInclude<ExtArgs> | null
    where?: SolveWhereInput
    orderBy?: SolveOrderByWithRelationInput | SolveOrderByWithRelationInput[]
    cursor?: SolveWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SolveScalarFieldEnum | SolveScalarFieldEnum[]
  }

  /**
   * User.Guide
   */
  export type User$GuideArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guide
     */
    omit?: GuideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    where?: GuideWhereInput
    orderBy?: GuideOrderByWithRelationInput | GuideOrderByWithRelationInput[]
    cursor?: GuideWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GuideScalarFieldEnum | GuideScalarFieldEnum[]
  }

  /**
   * User.Course
   */
  export type User$CourseArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    where?: CourseWhereInput
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Code
   */

  export type AggregateCode = {
    _count: CodeCountAggregateOutputType | null
    _min: CodeMinAggregateOutputType | null
    _max: CodeMaxAggregateOutputType | null
  }

  export type CodeMinAggregateOutputType = {
    code: string | null
    value: string | null
    iat: Date | null
    exp: Date | null
  }

  export type CodeMaxAggregateOutputType = {
    code: string | null
    value: string | null
    iat: Date | null
    exp: Date | null
  }

  export type CodeCountAggregateOutputType = {
    code: number
    value: number
    iat: number
    exp: number
    _all: number
  }


  export type CodeMinAggregateInputType = {
    code?: true
    value?: true
    iat?: true
    exp?: true
  }

  export type CodeMaxAggregateInputType = {
    code?: true
    value?: true
    iat?: true
    exp?: true
  }

  export type CodeCountAggregateInputType = {
    code?: true
    value?: true
    iat?: true
    exp?: true
    _all?: true
  }

  export type CodeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Code to aggregate.
     */
    where?: CodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Codes to fetch.
     */
    orderBy?: CodeOrderByWithRelationInput | CodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Codes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Codes
    **/
    _count?: true | CodeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CodeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CodeMaxAggregateInputType
  }

  export type GetCodeAggregateType<T extends CodeAggregateArgs> = {
        [P in keyof T & keyof AggregateCode]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCode[P]>
      : GetScalarType<T[P], AggregateCode[P]>
  }




  export type CodeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CodeWhereInput
    orderBy?: CodeOrderByWithAggregationInput | CodeOrderByWithAggregationInput[]
    by: CodeScalarFieldEnum[] | CodeScalarFieldEnum
    having?: CodeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CodeCountAggregateInputType | true
    _min?: CodeMinAggregateInputType
    _max?: CodeMaxAggregateInputType
  }

  export type CodeGroupByOutputType = {
    code: string
    value: string
    iat: Date
    exp: Date
    _count: CodeCountAggregateOutputType | null
    _min: CodeMinAggregateOutputType | null
    _max: CodeMaxAggregateOutputType | null
  }

  type GetCodeGroupByPayload<T extends CodeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CodeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CodeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CodeGroupByOutputType[P]>
            : GetScalarType<T[P], CodeGroupByOutputType[P]>
        }
      >
    >


  export type CodeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    code?: boolean
    value?: boolean
    iat?: boolean
    exp?: boolean
  }, ExtArgs["result"]["code"]>

  export type CodeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    code?: boolean
    value?: boolean
    iat?: boolean
    exp?: boolean
  }, ExtArgs["result"]["code"]>

  export type CodeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    code?: boolean
    value?: boolean
    iat?: boolean
    exp?: boolean
  }, ExtArgs["result"]["code"]>

  export type CodeSelectScalar = {
    code?: boolean
    value?: boolean
    iat?: boolean
    exp?: boolean
  }

  export type CodeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"code" | "value" | "iat" | "exp", ExtArgs["result"]["code"]>

  export type $CodePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Code"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      code: string
      value: string
      iat: Date
      exp: Date
    }, ExtArgs["result"]["code"]>
    composites: {}
  }

  type CodeGetPayload<S extends boolean | null | undefined | CodeDefaultArgs> = $Result.GetResult<Prisma.$CodePayload, S>

  type CodeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CodeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CodeCountAggregateInputType | true
    }

  export interface CodeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Code'], meta: { name: 'Code' } }
    /**
     * Find zero or one Code that matches the filter.
     * @param {CodeFindUniqueArgs} args - Arguments to find a Code
     * @example
     * // Get one Code
     * const code = await prisma.code.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CodeFindUniqueArgs>(args: SelectSubset<T, CodeFindUniqueArgs<ExtArgs>>): Prisma__CodeClient<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Code that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CodeFindUniqueOrThrowArgs} args - Arguments to find a Code
     * @example
     * // Get one Code
     * const code = await prisma.code.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CodeFindUniqueOrThrowArgs>(args: SelectSubset<T, CodeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CodeClient<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Code that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeFindFirstArgs} args - Arguments to find a Code
     * @example
     * // Get one Code
     * const code = await prisma.code.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CodeFindFirstArgs>(args?: SelectSubset<T, CodeFindFirstArgs<ExtArgs>>): Prisma__CodeClient<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Code that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeFindFirstOrThrowArgs} args - Arguments to find a Code
     * @example
     * // Get one Code
     * const code = await prisma.code.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CodeFindFirstOrThrowArgs>(args?: SelectSubset<T, CodeFindFirstOrThrowArgs<ExtArgs>>): Prisma__CodeClient<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Codes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Codes
     * const codes = await prisma.code.findMany()
     * 
     * // Get first 10 Codes
     * const codes = await prisma.code.findMany({ take: 10 })
     * 
     * // Only select the `code`
     * const codeWithCodeOnly = await prisma.code.findMany({ select: { code: true } })
     * 
     */
    findMany<T extends CodeFindManyArgs>(args?: SelectSubset<T, CodeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Code.
     * @param {CodeCreateArgs} args - Arguments to create a Code.
     * @example
     * // Create one Code
     * const Code = await prisma.code.create({
     *   data: {
     *     // ... data to create a Code
     *   }
     * })
     * 
     */
    create<T extends CodeCreateArgs>(args: SelectSubset<T, CodeCreateArgs<ExtArgs>>): Prisma__CodeClient<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Codes.
     * @param {CodeCreateManyArgs} args - Arguments to create many Codes.
     * @example
     * // Create many Codes
     * const code = await prisma.code.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CodeCreateManyArgs>(args?: SelectSubset<T, CodeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Codes and returns the data saved in the database.
     * @param {CodeCreateManyAndReturnArgs} args - Arguments to create many Codes.
     * @example
     * // Create many Codes
     * const code = await prisma.code.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Codes and only return the `code`
     * const codeWithCodeOnly = await prisma.code.createManyAndReturn({
     *   select: { code: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CodeCreateManyAndReturnArgs>(args?: SelectSubset<T, CodeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Code.
     * @param {CodeDeleteArgs} args - Arguments to delete one Code.
     * @example
     * // Delete one Code
     * const Code = await prisma.code.delete({
     *   where: {
     *     // ... filter to delete one Code
     *   }
     * })
     * 
     */
    delete<T extends CodeDeleteArgs>(args: SelectSubset<T, CodeDeleteArgs<ExtArgs>>): Prisma__CodeClient<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Code.
     * @param {CodeUpdateArgs} args - Arguments to update one Code.
     * @example
     * // Update one Code
     * const code = await prisma.code.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CodeUpdateArgs>(args: SelectSubset<T, CodeUpdateArgs<ExtArgs>>): Prisma__CodeClient<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Codes.
     * @param {CodeDeleteManyArgs} args - Arguments to filter Codes to delete.
     * @example
     * // Delete a few Codes
     * const { count } = await prisma.code.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CodeDeleteManyArgs>(args?: SelectSubset<T, CodeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Codes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Codes
     * const code = await prisma.code.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CodeUpdateManyArgs>(args: SelectSubset<T, CodeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Codes and returns the data updated in the database.
     * @param {CodeUpdateManyAndReturnArgs} args - Arguments to update many Codes.
     * @example
     * // Update many Codes
     * const code = await prisma.code.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Codes and only return the `code`
     * const codeWithCodeOnly = await prisma.code.updateManyAndReturn({
     *   select: { code: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CodeUpdateManyAndReturnArgs>(args: SelectSubset<T, CodeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Code.
     * @param {CodeUpsertArgs} args - Arguments to update or create a Code.
     * @example
     * // Update or create a Code
     * const code = await prisma.code.upsert({
     *   create: {
     *     // ... data to create a Code
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Code we want to update
     *   }
     * })
     */
    upsert<T extends CodeUpsertArgs>(args: SelectSubset<T, CodeUpsertArgs<ExtArgs>>): Prisma__CodeClient<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Codes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeCountArgs} args - Arguments to filter Codes to count.
     * @example
     * // Count the number of Codes
     * const count = await prisma.code.count({
     *   where: {
     *     // ... the filter for the Codes we want to count
     *   }
     * })
    **/
    count<T extends CodeCountArgs>(
      args?: Subset<T, CodeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CodeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Code.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CodeAggregateArgs>(args: Subset<T, CodeAggregateArgs>): Prisma.PrismaPromise<GetCodeAggregateType<T>>

    /**
     * Group by Code.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CodeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CodeGroupByArgs['orderBy'] }
        : { orderBy?: CodeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CodeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCodeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Code model
   */
  readonly fields: CodeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Code.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CodeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Code model
   */
  interface CodeFieldRefs {
    readonly code: FieldRef<"Code", 'String'>
    readonly value: FieldRef<"Code", 'String'>
    readonly iat: FieldRef<"Code", 'DateTime'>
    readonly exp: FieldRef<"Code", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Code findUnique
   */
  export type CodeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * Filter, which Code to fetch.
     */
    where: CodeWhereUniqueInput
  }

  /**
   * Code findUniqueOrThrow
   */
  export type CodeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * Filter, which Code to fetch.
     */
    where: CodeWhereUniqueInput
  }

  /**
   * Code findFirst
   */
  export type CodeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * Filter, which Code to fetch.
     */
    where?: CodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Codes to fetch.
     */
    orderBy?: CodeOrderByWithRelationInput | CodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Codes.
     */
    cursor?: CodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Codes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Codes.
     */
    distinct?: CodeScalarFieldEnum | CodeScalarFieldEnum[]
  }

  /**
   * Code findFirstOrThrow
   */
  export type CodeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * Filter, which Code to fetch.
     */
    where?: CodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Codes to fetch.
     */
    orderBy?: CodeOrderByWithRelationInput | CodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Codes.
     */
    cursor?: CodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Codes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Codes.
     */
    distinct?: CodeScalarFieldEnum | CodeScalarFieldEnum[]
  }

  /**
   * Code findMany
   */
  export type CodeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * Filter, which Codes to fetch.
     */
    where?: CodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Codes to fetch.
     */
    orderBy?: CodeOrderByWithRelationInput | CodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Codes.
     */
    cursor?: CodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Codes.
     */
    skip?: number
    distinct?: CodeScalarFieldEnum | CodeScalarFieldEnum[]
  }

  /**
   * Code create
   */
  export type CodeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * The data needed to create a Code.
     */
    data: XOR<CodeCreateInput, CodeUncheckedCreateInput>
  }

  /**
   * Code createMany
   */
  export type CodeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Codes.
     */
    data: CodeCreateManyInput | CodeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Code createManyAndReturn
   */
  export type CodeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * The data used to create many Codes.
     */
    data: CodeCreateManyInput | CodeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Code update
   */
  export type CodeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * The data needed to update a Code.
     */
    data: XOR<CodeUpdateInput, CodeUncheckedUpdateInput>
    /**
     * Choose, which Code to update.
     */
    where: CodeWhereUniqueInput
  }

  /**
   * Code updateMany
   */
  export type CodeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Codes.
     */
    data: XOR<CodeUpdateManyMutationInput, CodeUncheckedUpdateManyInput>
    /**
     * Filter which Codes to update
     */
    where?: CodeWhereInput
    /**
     * Limit how many Codes to update.
     */
    limit?: number
  }

  /**
   * Code updateManyAndReturn
   */
  export type CodeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * The data used to update Codes.
     */
    data: XOR<CodeUpdateManyMutationInput, CodeUncheckedUpdateManyInput>
    /**
     * Filter which Codes to update
     */
    where?: CodeWhereInput
    /**
     * Limit how many Codes to update.
     */
    limit?: number
  }

  /**
   * Code upsert
   */
  export type CodeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * The filter to search for the Code to update in case it exists.
     */
    where: CodeWhereUniqueInput
    /**
     * In case the Code found by the `where` argument doesn't exist, create a new Code with this data.
     */
    create: XOR<CodeCreateInput, CodeUncheckedCreateInput>
    /**
     * In case the Code was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CodeUpdateInput, CodeUncheckedUpdateInput>
  }

  /**
   * Code delete
   */
  export type CodeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * Filter which Code to delete.
     */
    where: CodeWhereUniqueInput
  }

  /**
   * Code deleteMany
   */
  export type CodeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Codes to delete
     */
    where?: CodeWhereInput
    /**
     * Limit how many Codes to delete.
     */
    limit?: number
  }

  /**
   * Code without action
   */
  export type CodeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
  }


  /**
   * Model RefreshToken
   */

  export type AggregateRefreshToken = {
    _count: RefreshTokenCountAggregateOutputType | null
    _min: RefreshTokenMinAggregateOutputType | null
    _max: RefreshTokenMaxAggregateOutputType | null
  }

  export type RefreshTokenMinAggregateOutputType = {
    code: string | null
    hmac: string | null
    iat: Date | null
    exp: Date | null
  }

  export type RefreshTokenMaxAggregateOutputType = {
    code: string | null
    hmac: string | null
    iat: Date | null
    exp: Date | null
  }

  export type RefreshTokenCountAggregateOutputType = {
    code: number
    hmac: number
    iat: number
    exp: number
    _all: number
  }


  export type RefreshTokenMinAggregateInputType = {
    code?: true
    hmac?: true
    iat?: true
    exp?: true
  }

  export type RefreshTokenMaxAggregateInputType = {
    code?: true
    hmac?: true
    iat?: true
    exp?: true
  }

  export type RefreshTokenCountAggregateInputType = {
    code?: true
    hmac?: true
    iat?: true
    exp?: true
    _all?: true
  }

  export type RefreshTokenAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RefreshToken to aggregate.
     */
    where?: RefreshTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RefreshTokens to fetch.
     */
    orderBy?: RefreshTokenOrderByWithRelationInput | RefreshTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RefreshTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RefreshTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RefreshTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RefreshTokens
    **/
    _count?: true | RefreshTokenCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RefreshTokenMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RefreshTokenMaxAggregateInputType
  }

  export type GetRefreshTokenAggregateType<T extends RefreshTokenAggregateArgs> = {
        [P in keyof T & keyof AggregateRefreshToken]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRefreshToken[P]>
      : GetScalarType<T[P], AggregateRefreshToken[P]>
  }




  export type RefreshTokenGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RefreshTokenWhereInput
    orderBy?: RefreshTokenOrderByWithAggregationInput | RefreshTokenOrderByWithAggregationInput[]
    by: RefreshTokenScalarFieldEnum[] | RefreshTokenScalarFieldEnum
    having?: RefreshTokenScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RefreshTokenCountAggregateInputType | true
    _min?: RefreshTokenMinAggregateInputType
    _max?: RefreshTokenMaxAggregateInputType
  }

  export type RefreshTokenGroupByOutputType = {
    code: string
    hmac: string
    iat: Date
    exp: Date
    _count: RefreshTokenCountAggregateOutputType | null
    _min: RefreshTokenMinAggregateOutputType | null
    _max: RefreshTokenMaxAggregateOutputType | null
  }

  type GetRefreshTokenGroupByPayload<T extends RefreshTokenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RefreshTokenGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RefreshTokenGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RefreshTokenGroupByOutputType[P]>
            : GetScalarType<T[P], RefreshTokenGroupByOutputType[P]>
        }
      >
    >


  export type RefreshTokenSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    code?: boolean
    hmac?: boolean
    iat?: boolean
    exp?: boolean
  }, ExtArgs["result"]["refreshToken"]>

  export type RefreshTokenSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    code?: boolean
    hmac?: boolean
    iat?: boolean
    exp?: boolean
  }, ExtArgs["result"]["refreshToken"]>

  export type RefreshTokenSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    code?: boolean
    hmac?: boolean
    iat?: boolean
    exp?: boolean
  }, ExtArgs["result"]["refreshToken"]>

  export type RefreshTokenSelectScalar = {
    code?: boolean
    hmac?: boolean
    iat?: boolean
    exp?: boolean
  }

  export type RefreshTokenOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"code" | "hmac" | "iat" | "exp", ExtArgs["result"]["refreshToken"]>

  export type $RefreshTokenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RefreshToken"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      code: string
      hmac: string
      iat: Date
      exp: Date
    }, ExtArgs["result"]["refreshToken"]>
    composites: {}
  }

  type RefreshTokenGetPayload<S extends boolean | null | undefined | RefreshTokenDefaultArgs> = $Result.GetResult<Prisma.$RefreshTokenPayload, S>

  type RefreshTokenCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RefreshTokenFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RefreshTokenCountAggregateInputType | true
    }

  export interface RefreshTokenDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RefreshToken'], meta: { name: 'RefreshToken' } }
    /**
     * Find zero or one RefreshToken that matches the filter.
     * @param {RefreshTokenFindUniqueArgs} args - Arguments to find a RefreshToken
     * @example
     * // Get one RefreshToken
     * const refreshToken = await prisma.refreshToken.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RefreshTokenFindUniqueArgs>(args: SelectSubset<T, RefreshTokenFindUniqueArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RefreshToken that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RefreshTokenFindUniqueOrThrowArgs} args - Arguments to find a RefreshToken
     * @example
     * // Get one RefreshToken
     * const refreshToken = await prisma.refreshToken.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RefreshTokenFindUniqueOrThrowArgs>(args: SelectSubset<T, RefreshTokenFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RefreshToken that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenFindFirstArgs} args - Arguments to find a RefreshToken
     * @example
     * // Get one RefreshToken
     * const refreshToken = await prisma.refreshToken.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RefreshTokenFindFirstArgs>(args?: SelectSubset<T, RefreshTokenFindFirstArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RefreshToken that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenFindFirstOrThrowArgs} args - Arguments to find a RefreshToken
     * @example
     * // Get one RefreshToken
     * const refreshToken = await prisma.refreshToken.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RefreshTokenFindFirstOrThrowArgs>(args?: SelectSubset<T, RefreshTokenFindFirstOrThrowArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RefreshTokens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RefreshTokens
     * const refreshTokens = await prisma.refreshToken.findMany()
     * 
     * // Get first 10 RefreshTokens
     * const refreshTokens = await prisma.refreshToken.findMany({ take: 10 })
     * 
     * // Only select the `code`
     * const refreshTokenWithCodeOnly = await prisma.refreshToken.findMany({ select: { code: true } })
     * 
     */
    findMany<T extends RefreshTokenFindManyArgs>(args?: SelectSubset<T, RefreshTokenFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RefreshToken.
     * @param {RefreshTokenCreateArgs} args - Arguments to create a RefreshToken.
     * @example
     * // Create one RefreshToken
     * const RefreshToken = await prisma.refreshToken.create({
     *   data: {
     *     // ... data to create a RefreshToken
     *   }
     * })
     * 
     */
    create<T extends RefreshTokenCreateArgs>(args: SelectSubset<T, RefreshTokenCreateArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RefreshTokens.
     * @param {RefreshTokenCreateManyArgs} args - Arguments to create many RefreshTokens.
     * @example
     * // Create many RefreshTokens
     * const refreshToken = await prisma.refreshToken.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RefreshTokenCreateManyArgs>(args?: SelectSubset<T, RefreshTokenCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RefreshTokens and returns the data saved in the database.
     * @param {RefreshTokenCreateManyAndReturnArgs} args - Arguments to create many RefreshTokens.
     * @example
     * // Create many RefreshTokens
     * const refreshToken = await prisma.refreshToken.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RefreshTokens and only return the `code`
     * const refreshTokenWithCodeOnly = await prisma.refreshToken.createManyAndReturn({
     *   select: { code: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RefreshTokenCreateManyAndReturnArgs>(args?: SelectSubset<T, RefreshTokenCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RefreshToken.
     * @param {RefreshTokenDeleteArgs} args - Arguments to delete one RefreshToken.
     * @example
     * // Delete one RefreshToken
     * const RefreshToken = await prisma.refreshToken.delete({
     *   where: {
     *     // ... filter to delete one RefreshToken
     *   }
     * })
     * 
     */
    delete<T extends RefreshTokenDeleteArgs>(args: SelectSubset<T, RefreshTokenDeleteArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RefreshToken.
     * @param {RefreshTokenUpdateArgs} args - Arguments to update one RefreshToken.
     * @example
     * // Update one RefreshToken
     * const refreshToken = await prisma.refreshToken.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RefreshTokenUpdateArgs>(args: SelectSubset<T, RefreshTokenUpdateArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RefreshTokens.
     * @param {RefreshTokenDeleteManyArgs} args - Arguments to filter RefreshTokens to delete.
     * @example
     * // Delete a few RefreshTokens
     * const { count } = await prisma.refreshToken.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RefreshTokenDeleteManyArgs>(args?: SelectSubset<T, RefreshTokenDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RefreshTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RefreshTokens
     * const refreshToken = await prisma.refreshToken.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RefreshTokenUpdateManyArgs>(args: SelectSubset<T, RefreshTokenUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RefreshTokens and returns the data updated in the database.
     * @param {RefreshTokenUpdateManyAndReturnArgs} args - Arguments to update many RefreshTokens.
     * @example
     * // Update many RefreshTokens
     * const refreshToken = await prisma.refreshToken.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RefreshTokens and only return the `code`
     * const refreshTokenWithCodeOnly = await prisma.refreshToken.updateManyAndReturn({
     *   select: { code: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RefreshTokenUpdateManyAndReturnArgs>(args: SelectSubset<T, RefreshTokenUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RefreshToken.
     * @param {RefreshTokenUpsertArgs} args - Arguments to update or create a RefreshToken.
     * @example
     * // Update or create a RefreshToken
     * const refreshToken = await prisma.refreshToken.upsert({
     *   create: {
     *     // ... data to create a RefreshToken
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RefreshToken we want to update
     *   }
     * })
     */
    upsert<T extends RefreshTokenUpsertArgs>(args: SelectSubset<T, RefreshTokenUpsertArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RefreshTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenCountArgs} args - Arguments to filter RefreshTokens to count.
     * @example
     * // Count the number of RefreshTokens
     * const count = await prisma.refreshToken.count({
     *   where: {
     *     // ... the filter for the RefreshTokens we want to count
     *   }
     * })
    **/
    count<T extends RefreshTokenCountArgs>(
      args?: Subset<T, RefreshTokenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RefreshTokenCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RefreshToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RefreshTokenAggregateArgs>(args: Subset<T, RefreshTokenAggregateArgs>): Prisma.PrismaPromise<GetRefreshTokenAggregateType<T>>

    /**
     * Group by RefreshToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RefreshTokenGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RefreshTokenGroupByArgs['orderBy'] }
        : { orderBy?: RefreshTokenGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RefreshTokenGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRefreshTokenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RefreshToken model
   */
  readonly fields: RefreshTokenFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RefreshToken.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RefreshTokenClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RefreshToken model
   */
  interface RefreshTokenFieldRefs {
    readonly code: FieldRef<"RefreshToken", 'String'>
    readonly hmac: FieldRef<"RefreshToken", 'String'>
    readonly iat: FieldRef<"RefreshToken", 'DateTime'>
    readonly exp: FieldRef<"RefreshToken", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RefreshToken findUnique
   */
  export type RefreshTokenFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefreshToken
     */
    omit?: RefreshTokenOmit<ExtArgs> | null
    /**
     * Filter, which RefreshToken to fetch.
     */
    where: RefreshTokenWhereUniqueInput
  }

  /**
   * RefreshToken findUniqueOrThrow
   */
  export type RefreshTokenFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefreshToken
     */
    omit?: RefreshTokenOmit<ExtArgs> | null
    /**
     * Filter, which RefreshToken to fetch.
     */
    where: RefreshTokenWhereUniqueInput
  }

  /**
   * RefreshToken findFirst
   */
  export type RefreshTokenFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefreshToken
     */
    omit?: RefreshTokenOmit<ExtArgs> | null
    /**
     * Filter, which RefreshToken to fetch.
     */
    where?: RefreshTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RefreshTokens to fetch.
     */
    orderBy?: RefreshTokenOrderByWithRelationInput | RefreshTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RefreshTokens.
     */
    cursor?: RefreshTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RefreshTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RefreshTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RefreshTokens.
     */
    distinct?: RefreshTokenScalarFieldEnum | RefreshTokenScalarFieldEnum[]
  }

  /**
   * RefreshToken findFirstOrThrow
   */
  export type RefreshTokenFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefreshToken
     */
    omit?: RefreshTokenOmit<ExtArgs> | null
    /**
     * Filter, which RefreshToken to fetch.
     */
    where?: RefreshTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RefreshTokens to fetch.
     */
    orderBy?: RefreshTokenOrderByWithRelationInput | RefreshTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RefreshTokens.
     */
    cursor?: RefreshTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RefreshTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RefreshTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RefreshTokens.
     */
    distinct?: RefreshTokenScalarFieldEnum | RefreshTokenScalarFieldEnum[]
  }

  /**
   * RefreshToken findMany
   */
  export type RefreshTokenFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefreshToken
     */
    omit?: RefreshTokenOmit<ExtArgs> | null
    /**
     * Filter, which RefreshTokens to fetch.
     */
    where?: RefreshTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RefreshTokens to fetch.
     */
    orderBy?: RefreshTokenOrderByWithRelationInput | RefreshTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RefreshTokens.
     */
    cursor?: RefreshTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RefreshTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RefreshTokens.
     */
    skip?: number
    distinct?: RefreshTokenScalarFieldEnum | RefreshTokenScalarFieldEnum[]
  }

  /**
   * RefreshToken create
   */
  export type RefreshTokenCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefreshToken
     */
    omit?: RefreshTokenOmit<ExtArgs> | null
    /**
     * The data needed to create a RefreshToken.
     */
    data: XOR<RefreshTokenCreateInput, RefreshTokenUncheckedCreateInput>
  }

  /**
   * RefreshToken createMany
   */
  export type RefreshTokenCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RefreshTokens.
     */
    data: RefreshTokenCreateManyInput | RefreshTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RefreshToken createManyAndReturn
   */
  export type RefreshTokenCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RefreshToken
     */
    omit?: RefreshTokenOmit<ExtArgs> | null
    /**
     * The data used to create many RefreshTokens.
     */
    data: RefreshTokenCreateManyInput | RefreshTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RefreshToken update
   */
  export type RefreshTokenUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefreshToken
     */
    omit?: RefreshTokenOmit<ExtArgs> | null
    /**
     * The data needed to update a RefreshToken.
     */
    data: XOR<RefreshTokenUpdateInput, RefreshTokenUncheckedUpdateInput>
    /**
     * Choose, which RefreshToken to update.
     */
    where: RefreshTokenWhereUniqueInput
  }

  /**
   * RefreshToken updateMany
   */
  export type RefreshTokenUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RefreshTokens.
     */
    data: XOR<RefreshTokenUpdateManyMutationInput, RefreshTokenUncheckedUpdateManyInput>
    /**
     * Filter which RefreshTokens to update
     */
    where?: RefreshTokenWhereInput
    /**
     * Limit how many RefreshTokens to update.
     */
    limit?: number
  }

  /**
   * RefreshToken updateManyAndReturn
   */
  export type RefreshTokenUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RefreshToken
     */
    omit?: RefreshTokenOmit<ExtArgs> | null
    /**
     * The data used to update RefreshTokens.
     */
    data: XOR<RefreshTokenUpdateManyMutationInput, RefreshTokenUncheckedUpdateManyInput>
    /**
     * Filter which RefreshTokens to update
     */
    where?: RefreshTokenWhereInput
    /**
     * Limit how many RefreshTokens to update.
     */
    limit?: number
  }

  /**
   * RefreshToken upsert
   */
  export type RefreshTokenUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefreshToken
     */
    omit?: RefreshTokenOmit<ExtArgs> | null
    /**
     * The filter to search for the RefreshToken to update in case it exists.
     */
    where: RefreshTokenWhereUniqueInput
    /**
     * In case the RefreshToken found by the `where` argument doesn't exist, create a new RefreshToken with this data.
     */
    create: XOR<RefreshTokenCreateInput, RefreshTokenUncheckedCreateInput>
    /**
     * In case the RefreshToken was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RefreshTokenUpdateInput, RefreshTokenUncheckedUpdateInput>
  }

  /**
   * RefreshToken delete
   */
  export type RefreshTokenDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefreshToken
     */
    omit?: RefreshTokenOmit<ExtArgs> | null
    /**
     * Filter which RefreshToken to delete.
     */
    where: RefreshTokenWhereUniqueInput
  }

  /**
   * RefreshToken deleteMany
   */
  export type RefreshTokenDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RefreshTokens to delete
     */
    where?: RefreshTokenWhereInput
    /**
     * Limit how many RefreshTokens to delete.
     */
    limit?: number
  }

  /**
   * RefreshToken without action
   */
  export type RefreshTokenDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RefreshToken
     */
    omit?: RefreshTokenOmit<ExtArgs> | null
  }


  /**
   * Model Guide
   */

  export type AggregateGuide = {
    _count: GuideCountAggregateOutputType | null
    _avg: GuideAvgAggregateOutputType | null
    _sum: GuideSumAggregateOutputType | null
    _min: GuideMinAggregateOutputType | null
    _max: GuideMaxAggregateOutputType | null
  }

  export type GuideAvgAggregateOutputType = {
    id: number | null
    authorId: number | null
    positiveRatings: number | null
    negativeRatings: number | null
    visits: number | null
  }

  export type GuideSumAggregateOutputType = {
    id: number | null
    authorId: number | null
    positiveRatings: number | null
    negativeRatings: number | null
    visits: number | null
  }

  export type GuideMinAggregateOutputType = {
    id: number | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
    authorId: number | null
    positiveRatings: number | null
    negativeRatings: number | null
    content: string | null
    description: string | null
    category: string | null
    visits: number | null
  }

  export type GuideMaxAggregateOutputType = {
    id: number | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
    authorId: number | null
    positiveRatings: number | null
    negativeRatings: number | null
    content: string | null
    description: string | null
    category: string | null
    visits: number | null
  }

  export type GuideCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    updatedAt: number
    authorId: number
    positiveRatings: number
    negativeRatings: number
    content: number
    description: number
    category: number
    visits: number
    _all: number
  }


  export type GuideAvgAggregateInputType = {
    id?: true
    authorId?: true
    positiveRatings?: true
    negativeRatings?: true
    visits?: true
  }

  export type GuideSumAggregateInputType = {
    id?: true
    authorId?: true
    positiveRatings?: true
    negativeRatings?: true
    visits?: true
  }

  export type GuideMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    authorId?: true
    positiveRatings?: true
    negativeRatings?: true
    content?: true
    description?: true
    category?: true
    visits?: true
  }

  export type GuideMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    authorId?: true
    positiveRatings?: true
    negativeRatings?: true
    content?: true
    description?: true
    category?: true
    visits?: true
  }

  export type GuideCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    authorId?: true
    positiveRatings?: true
    negativeRatings?: true
    content?: true
    description?: true
    category?: true
    visits?: true
    _all?: true
  }

  export type GuideAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Guide to aggregate.
     */
    where?: GuideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guides to fetch.
     */
    orderBy?: GuideOrderByWithRelationInput | GuideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GuideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guides.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Guides
    **/
    _count?: true | GuideCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GuideAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GuideSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GuideMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GuideMaxAggregateInputType
  }

  export type GetGuideAggregateType<T extends GuideAggregateArgs> = {
        [P in keyof T & keyof AggregateGuide]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGuide[P]>
      : GetScalarType<T[P], AggregateGuide[P]>
  }




  export type GuideGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GuideWhereInput
    orderBy?: GuideOrderByWithAggregationInput | GuideOrderByWithAggregationInput[]
    by: GuideScalarFieldEnum[] | GuideScalarFieldEnum
    having?: GuideScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GuideCountAggregateInputType | true
    _avg?: GuideAvgAggregateInputType
    _sum?: GuideSumAggregateInputType
    _min?: GuideMinAggregateInputType
    _max?: GuideMaxAggregateInputType
  }

  export type GuideGroupByOutputType = {
    id: number
    name: string
    createdAt: Date
    updatedAt: Date
    authorId: number
    positiveRatings: number
    negativeRatings: number
    content: string
    description: string | null
    category: string | null
    visits: number
    _count: GuideCountAggregateOutputType | null
    _avg: GuideAvgAggregateOutputType | null
    _sum: GuideSumAggregateOutputType | null
    _min: GuideMinAggregateOutputType | null
    _max: GuideMaxAggregateOutputType | null
  }

  type GetGuideGroupByPayload<T extends GuideGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GuideGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GuideGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GuideGroupByOutputType[P]>
            : GetScalarType<T[P], GuideGroupByOutputType[P]>
        }
      >
    >


  export type GuideSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    authorId?: boolean
    positiveRatings?: boolean
    negativeRatings?: boolean
    content?: boolean
    description?: boolean
    category?: boolean
    visits?: boolean
    author?: boolean | UserDefaultArgs<ExtArgs>
    guideTags?: boolean | Guide$guideTagsArgs<ExtArgs>
    _count?: boolean | GuideCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["guide"]>

  export type GuideSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    authorId?: boolean
    positiveRatings?: boolean
    negativeRatings?: boolean
    content?: boolean
    description?: boolean
    category?: boolean
    visits?: boolean
    author?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["guide"]>

  export type GuideSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    authorId?: boolean
    positiveRatings?: boolean
    negativeRatings?: boolean
    content?: boolean
    description?: boolean
    category?: boolean
    visits?: boolean
    author?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["guide"]>

  export type GuideSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    authorId?: boolean
    positiveRatings?: boolean
    negativeRatings?: boolean
    content?: boolean
    description?: boolean
    category?: boolean
    visits?: boolean
  }

  export type GuideOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "createdAt" | "updatedAt" | "authorId" | "positiveRatings" | "negativeRatings" | "content" | "description" | "category" | "visits", ExtArgs["result"]["guide"]>
  export type GuideInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    author?: boolean | UserDefaultArgs<ExtArgs>
    guideTags?: boolean | Guide$guideTagsArgs<ExtArgs>
    _count?: boolean | GuideCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type GuideIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    author?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type GuideIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    author?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $GuidePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Guide"
    objects: {
      author: Prisma.$UserPayload<ExtArgs>
      guideTags: Prisma.$GuideTagPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      createdAt: Date
      updatedAt: Date
      authorId: number
      positiveRatings: number
      negativeRatings: number
      content: string
      description: string | null
      category: string | null
      visits: number
    }, ExtArgs["result"]["guide"]>
    composites: {}
  }

  type GuideGetPayload<S extends boolean | null | undefined | GuideDefaultArgs> = $Result.GetResult<Prisma.$GuidePayload, S>

  type GuideCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GuideFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GuideCountAggregateInputType | true
    }

  export interface GuideDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Guide'], meta: { name: 'Guide' } }
    /**
     * Find zero or one Guide that matches the filter.
     * @param {GuideFindUniqueArgs} args - Arguments to find a Guide
     * @example
     * // Get one Guide
     * const guide = await prisma.guide.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GuideFindUniqueArgs>(args: SelectSubset<T, GuideFindUniqueArgs<ExtArgs>>): Prisma__GuideClient<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Guide that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GuideFindUniqueOrThrowArgs} args - Arguments to find a Guide
     * @example
     * // Get one Guide
     * const guide = await prisma.guide.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GuideFindUniqueOrThrowArgs>(args: SelectSubset<T, GuideFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GuideClient<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Guide that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideFindFirstArgs} args - Arguments to find a Guide
     * @example
     * // Get one Guide
     * const guide = await prisma.guide.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GuideFindFirstArgs>(args?: SelectSubset<T, GuideFindFirstArgs<ExtArgs>>): Prisma__GuideClient<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Guide that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideFindFirstOrThrowArgs} args - Arguments to find a Guide
     * @example
     * // Get one Guide
     * const guide = await prisma.guide.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GuideFindFirstOrThrowArgs>(args?: SelectSubset<T, GuideFindFirstOrThrowArgs<ExtArgs>>): Prisma__GuideClient<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Guides that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Guides
     * const guides = await prisma.guide.findMany()
     * 
     * // Get first 10 Guides
     * const guides = await prisma.guide.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const guideWithIdOnly = await prisma.guide.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GuideFindManyArgs>(args?: SelectSubset<T, GuideFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Guide.
     * @param {GuideCreateArgs} args - Arguments to create a Guide.
     * @example
     * // Create one Guide
     * const Guide = await prisma.guide.create({
     *   data: {
     *     // ... data to create a Guide
     *   }
     * })
     * 
     */
    create<T extends GuideCreateArgs>(args: SelectSubset<T, GuideCreateArgs<ExtArgs>>): Prisma__GuideClient<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Guides.
     * @param {GuideCreateManyArgs} args - Arguments to create many Guides.
     * @example
     * // Create many Guides
     * const guide = await prisma.guide.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GuideCreateManyArgs>(args?: SelectSubset<T, GuideCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Guides and returns the data saved in the database.
     * @param {GuideCreateManyAndReturnArgs} args - Arguments to create many Guides.
     * @example
     * // Create many Guides
     * const guide = await prisma.guide.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Guides and only return the `id`
     * const guideWithIdOnly = await prisma.guide.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GuideCreateManyAndReturnArgs>(args?: SelectSubset<T, GuideCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Guide.
     * @param {GuideDeleteArgs} args - Arguments to delete one Guide.
     * @example
     * // Delete one Guide
     * const Guide = await prisma.guide.delete({
     *   where: {
     *     // ... filter to delete one Guide
     *   }
     * })
     * 
     */
    delete<T extends GuideDeleteArgs>(args: SelectSubset<T, GuideDeleteArgs<ExtArgs>>): Prisma__GuideClient<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Guide.
     * @param {GuideUpdateArgs} args - Arguments to update one Guide.
     * @example
     * // Update one Guide
     * const guide = await prisma.guide.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GuideUpdateArgs>(args: SelectSubset<T, GuideUpdateArgs<ExtArgs>>): Prisma__GuideClient<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Guides.
     * @param {GuideDeleteManyArgs} args - Arguments to filter Guides to delete.
     * @example
     * // Delete a few Guides
     * const { count } = await prisma.guide.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GuideDeleteManyArgs>(args?: SelectSubset<T, GuideDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Guides.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Guides
     * const guide = await prisma.guide.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GuideUpdateManyArgs>(args: SelectSubset<T, GuideUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Guides and returns the data updated in the database.
     * @param {GuideUpdateManyAndReturnArgs} args - Arguments to update many Guides.
     * @example
     * // Update many Guides
     * const guide = await prisma.guide.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Guides and only return the `id`
     * const guideWithIdOnly = await prisma.guide.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GuideUpdateManyAndReturnArgs>(args: SelectSubset<T, GuideUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Guide.
     * @param {GuideUpsertArgs} args - Arguments to update or create a Guide.
     * @example
     * // Update or create a Guide
     * const guide = await prisma.guide.upsert({
     *   create: {
     *     // ... data to create a Guide
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Guide we want to update
     *   }
     * })
     */
    upsert<T extends GuideUpsertArgs>(args: SelectSubset<T, GuideUpsertArgs<ExtArgs>>): Prisma__GuideClient<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Guides.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideCountArgs} args - Arguments to filter Guides to count.
     * @example
     * // Count the number of Guides
     * const count = await prisma.guide.count({
     *   where: {
     *     // ... the filter for the Guides we want to count
     *   }
     * })
    **/
    count<T extends GuideCountArgs>(
      args?: Subset<T, GuideCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GuideCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Guide.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GuideAggregateArgs>(args: Subset<T, GuideAggregateArgs>): Prisma.PrismaPromise<GetGuideAggregateType<T>>

    /**
     * Group by Guide.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GuideGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GuideGroupByArgs['orderBy'] }
        : { orderBy?: GuideGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GuideGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGuideGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Guide model
   */
  readonly fields: GuideFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Guide.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GuideClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    author<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    guideTags<T extends Guide$guideTagsArgs<ExtArgs> = {}>(args?: Subset<T, Guide$guideTagsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuideTagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Guide model
   */
  interface GuideFieldRefs {
    readonly id: FieldRef<"Guide", 'Int'>
    readonly name: FieldRef<"Guide", 'String'>
    readonly createdAt: FieldRef<"Guide", 'DateTime'>
    readonly updatedAt: FieldRef<"Guide", 'DateTime'>
    readonly authorId: FieldRef<"Guide", 'Int'>
    readonly positiveRatings: FieldRef<"Guide", 'Int'>
    readonly negativeRatings: FieldRef<"Guide", 'Int'>
    readonly content: FieldRef<"Guide", 'String'>
    readonly description: FieldRef<"Guide", 'String'>
    readonly category: FieldRef<"Guide", 'String'>
    readonly visits: FieldRef<"Guide", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Guide findUnique
   */
  export type GuideFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guide
     */
    omit?: GuideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * Filter, which Guide to fetch.
     */
    where: GuideWhereUniqueInput
  }

  /**
   * Guide findUniqueOrThrow
   */
  export type GuideFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guide
     */
    omit?: GuideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * Filter, which Guide to fetch.
     */
    where: GuideWhereUniqueInput
  }

  /**
   * Guide findFirst
   */
  export type GuideFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guide
     */
    omit?: GuideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * Filter, which Guide to fetch.
     */
    where?: GuideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guides to fetch.
     */
    orderBy?: GuideOrderByWithRelationInput | GuideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Guides.
     */
    cursor?: GuideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guides.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Guides.
     */
    distinct?: GuideScalarFieldEnum | GuideScalarFieldEnum[]
  }

  /**
   * Guide findFirstOrThrow
   */
  export type GuideFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guide
     */
    omit?: GuideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * Filter, which Guide to fetch.
     */
    where?: GuideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guides to fetch.
     */
    orderBy?: GuideOrderByWithRelationInput | GuideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Guides.
     */
    cursor?: GuideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guides.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Guides.
     */
    distinct?: GuideScalarFieldEnum | GuideScalarFieldEnum[]
  }

  /**
   * Guide findMany
   */
  export type GuideFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guide
     */
    omit?: GuideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * Filter, which Guides to fetch.
     */
    where?: GuideWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guides to fetch.
     */
    orderBy?: GuideOrderByWithRelationInput | GuideOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Guides.
     */
    cursor?: GuideWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guides from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guides.
     */
    skip?: number
    distinct?: GuideScalarFieldEnum | GuideScalarFieldEnum[]
  }

  /**
   * Guide create
   */
  export type GuideCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guide
     */
    omit?: GuideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * The data needed to create a Guide.
     */
    data: XOR<GuideCreateInput, GuideUncheckedCreateInput>
  }

  /**
   * Guide createMany
   */
  export type GuideCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Guides.
     */
    data: GuideCreateManyInput | GuideCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Guide createManyAndReturn
   */
  export type GuideCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Guide
     */
    omit?: GuideOmit<ExtArgs> | null
    /**
     * The data used to create many Guides.
     */
    data: GuideCreateManyInput | GuideCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Guide update
   */
  export type GuideUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guide
     */
    omit?: GuideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * The data needed to update a Guide.
     */
    data: XOR<GuideUpdateInput, GuideUncheckedUpdateInput>
    /**
     * Choose, which Guide to update.
     */
    where: GuideWhereUniqueInput
  }

  /**
   * Guide updateMany
   */
  export type GuideUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Guides.
     */
    data: XOR<GuideUpdateManyMutationInput, GuideUncheckedUpdateManyInput>
    /**
     * Filter which Guides to update
     */
    where?: GuideWhereInput
    /**
     * Limit how many Guides to update.
     */
    limit?: number
  }

  /**
   * Guide updateManyAndReturn
   */
  export type GuideUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Guide
     */
    omit?: GuideOmit<ExtArgs> | null
    /**
     * The data used to update Guides.
     */
    data: XOR<GuideUpdateManyMutationInput, GuideUncheckedUpdateManyInput>
    /**
     * Filter which Guides to update
     */
    where?: GuideWhereInput
    /**
     * Limit how many Guides to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Guide upsert
   */
  export type GuideUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guide
     */
    omit?: GuideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * The filter to search for the Guide to update in case it exists.
     */
    where: GuideWhereUniqueInput
    /**
     * In case the Guide found by the `where` argument doesn't exist, create a new Guide with this data.
     */
    create: XOR<GuideCreateInput, GuideUncheckedCreateInput>
    /**
     * In case the Guide was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GuideUpdateInput, GuideUncheckedUpdateInput>
  }

  /**
   * Guide delete
   */
  export type GuideDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guide
     */
    omit?: GuideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
    /**
     * Filter which Guide to delete.
     */
    where: GuideWhereUniqueInput
  }

  /**
   * Guide deleteMany
   */
  export type GuideDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Guides to delete
     */
    where?: GuideWhereInput
    /**
     * Limit how many Guides to delete.
     */
    limit?: number
  }

  /**
   * Guide.guideTags
   */
  export type Guide$guideTagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuideTag
     */
    select?: GuideTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GuideTag
     */
    omit?: GuideTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideTagInclude<ExtArgs> | null
    where?: GuideTagWhereInput
    orderBy?: GuideTagOrderByWithRelationInput | GuideTagOrderByWithRelationInput[]
    cursor?: GuideTagWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GuideTagScalarFieldEnum | GuideTagScalarFieldEnum[]
  }

  /**
   * Guide without action
   */
  export type GuideDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guide
     */
    select?: GuideSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Guide
     */
    omit?: GuideOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideInclude<ExtArgs> | null
  }


  /**
   * Model Tag
   */

  export type AggregateTag = {
    _count: TagCountAggregateOutputType | null
    _avg: TagAvgAggregateOutputType | null
    _sum: TagSumAggregateOutputType | null
    _min: TagMinAggregateOutputType | null
    _max: TagMaxAggregateOutputType | null
  }

  export type TagAvgAggregateOutputType = {
    id: number | null
  }

  export type TagSumAggregateOutputType = {
    id: number | null
  }

  export type TagMinAggregateOutputType = {
    id: number | null
    name: string | null
  }

  export type TagMaxAggregateOutputType = {
    id: number | null
    name: string | null
  }

  export type TagCountAggregateOutputType = {
    id: number
    name: number
    _all: number
  }


  export type TagAvgAggregateInputType = {
    id?: true
  }

  export type TagSumAggregateInputType = {
    id?: true
  }

  export type TagMinAggregateInputType = {
    id?: true
    name?: true
  }

  export type TagMaxAggregateInputType = {
    id?: true
    name?: true
  }

  export type TagCountAggregateInputType = {
    id?: true
    name?: true
    _all?: true
  }

  export type TagAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tag to aggregate.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tags
    **/
    _count?: true | TagCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TagAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TagSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TagMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TagMaxAggregateInputType
  }

  export type GetTagAggregateType<T extends TagAggregateArgs> = {
        [P in keyof T & keyof AggregateTag]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTag[P]>
      : GetScalarType<T[P], AggregateTag[P]>
  }




  export type TagGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TagWhereInput
    orderBy?: TagOrderByWithAggregationInput | TagOrderByWithAggregationInput[]
    by: TagScalarFieldEnum[] | TagScalarFieldEnum
    having?: TagScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TagCountAggregateInputType | true
    _avg?: TagAvgAggregateInputType
    _sum?: TagSumAggregateInputType
    _min?: TagMinAggregateInputType
    _max?: TagMaxAggregateInputType
  }

  export type TagGroupByOutputType = {
    id: number
    name: string
    _count: TagCountAggregateOutputType | null
    _avg: TagAvgAggregateOutputType | null
    _sum: TagSumAggregateOutputType | null
    _min: TagMinAggregateOutputType | null
    _max: TagMaxAggregateOutputType | null
  }

  type GetTagGroupByPayload<T extends TagGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TagGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TagGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TagGroupByOutputType[P]>
            : GetScalarType<T[P], TagGroupByOutputType[P]>
        }
      >
    >


  export type TagSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    guideTags?: boolean | Tag$guideTagsArgs<ExtArgs>
    _count?: boolean | TagCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tag"]>

  export type TagSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
  }, ExtArgs["result"]["tag"]>

  export type TagSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
  }, ExtArgs["result"]["tag"]>

  export type TagSelectScalar = {
    id?: boolean
    name?: boolean
  }

  export type TagOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name", ExtArgs["result"]["tag"]>
  export type TagInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    guideTags?: boolean | Tag$guideTagsArgs<ExtArgs>
    _count?: boolean | TagCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TagIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TagIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TagPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tag"
    objects: {
      guideTags: Prisma.$GuideTagPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
    }, ExtArgs["result"]["tag"]>
    composites: {}
  }

  type TagGetPayload<S extends boolean | null | undefined | TagDefaultArgs> = $Result.GetResult<Prisma.$TagPayload, S>

  type TagCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TagFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TagCountAggregateInputType | true
    }

  export interface TagDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tag'], meta: { name: 'Tag' } }
    /**
     * Find zero or one Tag that matches the filter.
     * @param {TagFindUniqueArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TagFindUniqueArgs>(args: SelectSubset<T, TagFindUniqueArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tag that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TagFindUniqueOrThrowArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TagFindUniqueOrThrowArgs>(args: SelectSubset<T, TagFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindFirstArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TagFindFirstArgs>(args?: SelectSubset<T, TagFindFirstArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindFirstOrThrowArgs} args - Arguments to find a Tag
     * @example
     * // Get one Tag
     * const tag = await prisma.tag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TagFindFirstOrThrowArgs>(args?: SelectSubset<T, TagFindFirstOrThrowArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tags
     * const tags = await prisma.tag.findMany()
     * 
     * // Get first 10 Tags
     * const tags = await prisma.tag.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tagWithIdOnly = await prisma.tag.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TagFindManyArgs>(args?: SelectSubset<T, TagFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tag.
     * @param {TagCreateArgs} args - Arguments to create a Tag.
     * @example
     * // Create one Tag
     * const Tag = await prisma.tag.create({
     *   data: {
     *     // ... data to create a Tag
     *   }
     * })
     * 
     */
    create<T extends TagCreateArgs>(args: SelectSubset<T, TagCreateArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tags.
     * @param {TagCreateManyArgs} args - Arguments to create many Tags.
     * @example
     * // Create many Tags
     * const tag = await prisma.tag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TagCreateManyArgs>(args?: SelectSubset<T, TagCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tags and returns the data saved in the database.
     * @param {TagCreateManyAndReturnArgs} args - Arguments to create many Tags.
     * @example
     * // Create many Tags
     * const tag = await prisma.tag.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tags and only return the `id`
     * const tagWithIdOnly = await prisma.tag.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TagCreateManyAndReturnArgs>(args?: SelectSubset<T, TagCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tag.
     * @param {TagDeleteArgs} args - Arguments to delete one Tag.
     * @example
     * // Delete one Tag
     * const Tag = await prisma.tag.delete({
     *   where: {
     *     // ... filter to delete one Tag
     *   }
     * })
     * 
     */
    delete<T extends TagDeleteArgs>(args: SelectSubset<T, TagDeleteArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tag.
     * @param {TagUpdateArgs} args - Arguments to update one Tag.
     * @example
     * // Update one Tag
     * const tag = await prisma.tag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TagUpdateArgs>(args: SelectSubset<T, TagUpdateArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tags.
     * @param {TagDeleteManyArgs} args - Arguments to filter Tags to delete.
     * @example
     * // Delete a few Tags
     * const { count } = await prisma.tag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TagDeleteManyArgs>(args?: SelectSubset<T, TagDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tags
     * const tag = await prisma.tag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TagUpdateManyArgs>(args: SelectSubset<T, TagUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tags and returns the data updated in the database.
     * @param {TagUpdateManyAndReturnArgs} args - Arguments to update many Tags.
     * @example
     * // Update many Tags
     * const tag = await prisma.tag.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tags and only return the `id`
     * const tagWithIdOnly = await prisma.tag.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TagUpdateManyAndReturnArgs>(args: SelectSubset<T, TagUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tag.
     * @param {TagUpsertArgs} args - Arguments to update or create a Tag.
     * @example
     * // Update or create a Tag
     * const tag = await prisma.tag.upsert({
     *   create: {
     *     // ... data to create a Tag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tag we want to update
     *   }
     * })
     */
    upsert<T extends TagUpsertArgs>(args: SelectSubset<T, TagUpsertArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagCountArgs} args - Arguments to filter Tags to count.
     * @example
     * // Count the number of Tags
     * const count = await prisma.tag.count({
     *   where: {
     *     // ... the filter for the Tags we want to count
     *   }
     * })
    **/
    count<T extends TagCountArgs>(
      args?: Subset<T, TagCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TagCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TagAggregateArgs>(args: Subset<T, TagAggregateArgs>): Prisma.PrismaPromise<GetTagAggregateType<T>>

    /**
     * Group by Tag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TagGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TagGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TagGroupByArgs['orderBy'] }
        : { orderBy?: TagGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tag model
   */
  readonly fields: TagFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tag.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TagClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    guideTags<T extends Tag$guideTagsArgs<ExtArgs> = {}>(args?: Subset<T, Tag$guideTagsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuideTagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tag model
   */
  interface TagFieldRefs {
    readonly id: FieldRef<"Tag", 'Int'>
    readonly name: FieldRef<"Tag", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Tag findUnique
   */
  export type TagFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag findUniqueOrThrow
   */
  export type TagFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag findFirst
   */
  export type TagFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tags.
     */
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag findFirstOrThrow
   */
  export type TagFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tag to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tags.
     */
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag findMany
   */
  export type TagFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter, which Tags to fetch.
     */
    where?: TagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tags to fetch.
     */
    orderBy?: TagOrderByWithRelationInput | TagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tags.
     */
    cursor?: TagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tags.
     */
    skip?: number
    distinct?: TagScalarFieldEnum | TagScalarFieldEnum[]
  }

  /**
   * Tag create
   */
  export type TagCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * The data needed to create a Tag.
     */
    data: XOR<TagCreateInput, TagUncheckedCreateInput>
  }

  /**
   * Tag createMany
   */
  export type TagCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tags.
     */
    data: TagCreateManyInput | TagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tag createManyAndReturn
   */
  export type TagCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * The data used to create many Tags.
     */
    data: TagCreateManyInput | TagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tag update
   */
  export type TagUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * The data needed to update a Tag.
     */
    data: XOR<TagUpdateInput, TagUncheckedUpdateInput>
    /**
     * Choose, which Tag to update.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag updateMany
   */
  export type TagUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tags.
     */
    data: XOR<TagUpdateManyMutationInput, TagUncheckedUpdateManyInput>
    /**
     * Filter which Tags to update
     */
    where?: TagWhereInput
    /**
     * Limit how many Tags to update.
     */
    limit?: number
  }

  /**
   * Tag updateManyAndReturn
   */
  export type TagUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * The data used to update Tags.
     */
    data: XOR<TagUpdateManyMutationInput, TagUncheckedUpdateManyInput>
    /**
     * Filter which Tags to update
     */
    where?: TagWhereInput
    /**
     * Limit how many Tags to update.
     */
    limit?: number
  }

  /**
   * Tag upsert
   */
  export type TagUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * The filter to search for the Tag to update in case it exists.
     */
    where: TagWhereUniqueInput
    /**
     * In case the Tag found by the `where` argument doesn't exist, create a new Tag with this data.
     */
    create: XOR<TagCreateInput, TagUncheckedCreateInput>
    /**
     * In case the Tag was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TagUpdateInput, TagUncheckedUpdateInput>
  }

  /**
   * Tag delete
   */
  export type TagDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
    /**
     * Filter which Tag to delete.
     */
    where: TagWhereUniqueInput
  }

  /**
   * Tag deleteMany
   */
  export type TagDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tags to delete
     */
    where?: TagWhereInput
    /**
     * Limit how many Tags to delete.
     */
    limit?: number
  }

  /**
   * Tag.guideTags
   */
  export type Tag$guideTagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuideTag
     */
    select?: GuideTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GuideTag
     */
    omit?: GuideTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideTagInclude<ExtArgs> | null
    where?: GuideTagWhereInput
    orderBy?: GuideTagOrderByWithRelationInput | GuideTagOrderByWithRelationInput[]
    cursor?: GuideTagWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GuideTagScalarFieldEnum | GuideTagScalarFieldEnum[]
  }

  /**
   * Tag without action
   */
  export type TagDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tag
     */
    select?: TagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tag
     */
    omit?: TagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TagInclude<ExtArgs> | null
  }


  /**
   * Model GuideTag
   */

  export type AggregateGuideTag = {
    _count: GuideTagCountAggregateOutputType | null
    _avg: GuideTagAvgAggregateOutputType | null
    _sum: GuideTagSumAggregateOutputType | null
    _min: GuideTagMinAggregateOutputType | null
    _max: GuideTagMaxAggregateOutputType | null
  }

  export type GuideTagAvgAggregateOutputType = {
    guideId: number | null
    tagId: number | null
  }

  export type GuideTagSumAggregateOutputType = {
    guideId: number | null
    tagId: number | null
  }

  export type GuideTagMinAggregateOutputType = {
    guideId: number | null
    tagId: number | null
  }

  export type GuideTagMaxAggregateOutputType = {
    guideId: number | null
    tagId: number | null
  }

  export type GuideTagCountAggregateOutputType = {
    guideId: number
    tagId: number
    _all: number
  }


  export type GuideTagAvgAggregateInputType = {
    guideId?: true
    tagId?: true
  }

  export type GuideTagSumAggregateInputType = {
    guideId?: true
    tagId?: true
  }

  export type GuideTagMinAggregateInputType = {
    guideId?: true
    tagId?: true
  }

  export type GuideTagMaxAggregateInputType = {
    guideId?: true
    tagId?: true
  }

  export type GuideTagCountAggregateInputType = {
    guideId?: true
    tagId?: true
    _all?: true
  }

  export type GuideTagAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GuideTag to aggregate.
     */
    where?: GuideTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GuideTags to fetch.
     */
    orderBy?: GuideTagOrderByWithRelationInput | GuideTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GuideTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GuideTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GuideTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GuideTags
    **/
    _count?: true | GuideTagCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GuideTagAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GuideTagSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GuideTagMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GuideTagMaxAggregateInputType
  }

  export type GetGuideTagAggregateType<T extends GuideTagAggregateArgs> = {
        [P in keyof T & keyof AggregateGuideTag]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGuideTag[P]>
      : GetScalarType<T[P], AggregateGuideTag[P]>
  }




  export type GuideTagGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GuideTagWhereInput
    orderBy?: GuideTagOrderByWithAggregationInput | GuideTagOrderByWithAggregationInput[]
    by: GuideTagScalarFieldEnum[] | GuideTagScalarFieldEnum
    having?: GuideTagScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GuideTagCountAggregateInputType | true
    _avg?: GuideTagAvgAggregateInputType
    _sum?: GuideTagSumAggregateInputType
    _min?: GuideTagMinAggregateInputType
    _max?: GuideTagMaxAggregateInputType
  }

  export type GuideTagGroupByOutputType = {
    guideId: number
    tagId: number
    _count: GuideTagCountAggregateOutputType | null
    _avg: GuideTagAvgAggregateOutputType | null
    _sum: GuideTagSumAggregateOutputType | null
    _min: GuideTagMinAggregateOutputType | null
    _max: GuideTagMaxAggregateOutputType | null
  }

  type GetGuideTagGroupByPayload<T extends GuideTagGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GuideTagGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GuideTagGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GuideTagGroupByOutputType[P]>
            : GetScalarType<T[P], GuideTagGroupByOutputType[P]>
        }
      >
    >


  export type GuideTagSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    guideId?: boolean
    tagId?: boolean
    guide?: boolean | GuideDefaultArgs<ExtArgs>
    tag?: boolean | TagDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["guideTag"]>

  export type GuideTagSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    guideId?: boolean
    tagId?: boolean
    guide?: boolean | GuideDefaultArgs<ExtArgs>
    tag?: boolean | TagDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["guideTag"]>

  export type GuideTagSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    guideId?: boolean
    tagId?: boolean
    guide?: boolean | GuideDefaultArgs<ExtArgs>
    tag?: boolean | TagDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["guideTag"]>

  export type GuideTagSelectScalar = {
    guideId?: boolean
    tagId?: boolean
  }

  export type GuideTagOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"guideId" | "tagId", ExtArgs["result"]["guideTag"]>
  export type GuideTagInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    guide?: boolean | GuideDefaultArgs<ExtArgs>
    tag?: boolean | TagDefaultArgs<ExtArgs>
  }
  export type GuideTagIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    guide?: boolean | GuideDefaultArgs<ExtArgs>
    tag?: boolean | TagDefaultArgs<ExtArgs>
  }
  export type GuideTagIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    guide?: boolean | GuideDefaultArgs<ExtArgs>
    tag?: boolean | TagDefaultArgs<ExtArgs>
  }

  export type $GuideTagPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GuideTag"
    objects: {
      guide: Prisma.$GuidePayload<ExtArgs>
      tag: Prisma.$TagPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      guideId: number
      tagId: number
    }, ExtArgs["result"]["guideTag"]>
    composites: {}
  }

  type GuideTagGetPayload<S extends boolean | null | undefined | GuideTagDefaultArgs> = $Result.GetResult<Prisma.$GuideTagPayload, S>

  type GuideTagCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GuideTagFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GuideTagCountAggregateInputType | true
    }

  export interface GuideTagDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GuideTag'], meta: { name: 'GuideTag' } }
    /**
     * Find zero or one GuideTag that matches the filter.
     * @param {GuideTagFindUniqueArgs} args - Arguments to find a GuideTag
     * @example
     * // Get one GuideTag
     * const guideTag = await prisma.guideTag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GuideTagFindUniqueArgs>(args: SelectSubset<T, GuideTagFindUniqueArgs<ExtArgs>>): Prisma__GuideTagClient<$Result.GetResult<Prisma.$GuideTagPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GuideTag that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GuideTagFindUniqueOrThrowArgs} args - Arguments to find a GuideTag
     * @example
     * // Get one GuideTag
     * const guideTag = await prisma.guideTag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GuideTagFindUniqueOrThrowArgs>(args: SelectSubset<T, GuideTagFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GuideTagClient<$Result.GetResult<Prisma.$GuideTagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GuideTag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideTagFindFirstArgs} args - Arguments to find a GuideTag
     * @example
     * // Get one GuideTag
     * const guideTag = await prisma.guideTag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GuideTagFindFirstArgs>(args?: SelectSubset<T, GuideTagFindFirstArgs<ExtArgs>>): Prisma__GuideTagClient<$Result.GetResult<Prisma.$GuideTagPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GuideTag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideTagFindFirstOrThrowArgs} args - Arguments to find a GuideTag
     * @example
     * // Get one GuideTag
     * const guideTag = await prisma.guideTag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GuideTagFindFirstOrThrowArgs>(args?: SelectSubset<T, GuideTagFindFirstOrThrowArgs<ExtArgs>>): Prisma__GuideTagClient<$Result.GetResult<Prisma.$GuideTagPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GuideTags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideTagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GuideTags
     * const guideTags = await prisma.guideTag.findMany()
     * 
     * // Get first 10 GuideTags
     * const guideTags = await prisma.guideTag.findMany({ take: 10 })
     * 
     * // Only select the `guideId`
     * const guideTagWithGuideIdOnly = await prisma.guideTag.findMany({ select: { guideId: true } })
     * 
     */
    findMany<T extends GuideTagFindManyArgs>(args?: SelectSubset<T, GuideTagFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuideTagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GuideTag.
     * @param {GuideTagCreateArgs} args - Arguments to create a GuideTag.
     * @example
     * // Create one GuideTag
     * const GuideTag = await prisma.guideTag.create({
     *   data: {
     *     // ... data to create a GuideTag
     *   }
     * })
     * 
     */
    create<T extends GuideTagCreateArgs>(args: SelectSubset<T, GuideTagCreateArgs<ExtArgs>>): Prisma__GuideTagClient<$Result.GetResult<Prisma.$GuideTagPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GuideTags.
     * @param {GuideTagCreateManyArgs} args - Arguments to create many GuideTags.
     * @example
     * // Create many GuideTags
     * const guideTag = await prisma.guideTag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GuideTagCreateManyArgs>(args?: SelectSubset<T, GuideTagCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GuideTags and returns the data saved in the database.
     * @param {GuideTagCreateManyAndReturnArgs} args - Arguments to create many GuideTags.
     * @example
     * // Create many GuideTags
     * const guideTag = await prisma.guideTag.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GuideTags and only return the `guideId`
     * const guideTagWithGuideIdOnly = await prisma.guideTag.createManyAndReturn({
     *   select: { guideId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GuideTagCreateManyAndReturnArgs>(args?: SelectSubset<T, GuideTagCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuideTagPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a GuideTag.
     * @param {GuideTagDeleteArgs} args - Arguments to delete one GuideTag.
     * @example
     * // Delete one GuideTag
     * const GuideTag = await prisma.guideTag.delete({
     *   where: {
     *     // ... filter to delete one GuideTag
     *   }
     * })
     * 
     */
    delete<T extends GuideTagDeleteArgs>(args: SelectSubset<T, GuideTagDeleteArgs<ExtArgs>>): Prisma__GuideTagClient<$Result.GetResult<Prisma.$GuideTagPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GuideTag.
     * @param {GuideTagUpdateArgs} args - Arguments to update one GuideTag.
     * @example
     * // Update one GuideTag
     * const guideTag = await prisma.guideTag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GuideTagUpdateArgs>(args: SelectSubset<T, GuideTagUpdateArgs<ExtArgs>>): Prisma__GuideTagClient<$Result.GetResult<Prisma.$GuideTagPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GuideTags.
     * @param {GuideTagDeleteManyArgs} args - Arguments to filter GuideTags to delete.
     * @example
     * // Delete a few GuideTags
     * const { count } = await prisma.guideTag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GuideTagDeleteManyArgs>(args?: SelectSubset<T, GuideTagDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GuideTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideTagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GuideTags
     * const guideTag = await prisma.guideTag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GuideTagUpdateManyArgs>(args: SelectSubset<T, GuideTagUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GuideTags and returns the data updated in the database.
     * @param {GuideTagUpdateManyAndReturnArgs} args - Arguments to update many GuideTags.
     * @example
     * // Update many GuideTags
     * const guideTag = await prisma.guideTag.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more GuideTags and only return the `guideId`
     * const guideTagWithGuideIdOnly = await prisma.guideTag.updateManyAndReturn({
     *   select: { guideId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GuideTagUpdateManyAndReturnArgs>(args: SelectSubset<T, GuideTagUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GuideTagPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one GuideTag.
     * @param {GuideTagUpsertArgs} args - Arguments to update or create a GuideTag.
     * @example
     * // Update or create a GuideTag
     * const guideTag = await prisma.guideTag.upsert({
     *   create: {
     *     // ... data to create a GuideTag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GuideTag we want to update
     *   }
     * })
     */
    upsert<T extends GuideTagUpsertArgs>(args: SelectSubset<T, GuideTagUpsertArgs<ExtArgs>>): Prisma__GuideTagClient<$Result.GetResult<Prisma.$GuideTagPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of GuideTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideTagCountArgs} args - Arguments to filter GuideTags to count.
     * @example
     * // Count the number of GuideTags
     * const count = await prisma.guideTag.count({
     *   where: {
     *     // ... the filter for the GuideTags we want to count
     *   }
     * })
    **/
    count<T extends GuideTagCountArgs>(
      args?: Subset<T, GuideTagCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GuideTagCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GuideTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideTagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GuideTagAggregateArgs>(args: Subset<T, GuideTagAggregateArgs>): Prisma.PrismaPromise<GetGuideTagAggregateType<T>>

    /**
     * Group by GuideTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuideTagGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GuideTagGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GuideTagGroupByArgs['orderBy'] }
        : { orderBy?: GuideTagGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GuideTagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGuideTagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GuideTag model
   */
  readonly fields: GuideTagFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GuideTag.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GuideTagClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    guide<T extends GuideDefaultArgs<ExtArgs> = {}>(args?: Subset<T, GuideDefaultArgs<ExtArgs>>): Prisma__GuideClient<$Result.GetResult<Prisma.$GuidePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    tag<T extends TagDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TagDefaultArgs<ExtArgs>>): Prisma__TagClient<$Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GuideTag model
   */
  interface GuideTagFieldRefs {
    readonly guideId: FieldRef<"GuideTag", 'Int'>
    readonly tagId: FieldRef<"GuideTag", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * GuideTag findUnique
   */
  export type GuideTagFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuideTag
     */
    select?: GuideTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GuideTag
     */
    omit?: GuideTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideTagInclude<ExtArgs> | null
    /**
     * Filter, which GuideTag to fetch.
     */
    where: GuideTagWhereUniqueInput
  }

  /**
   * GuideTag findUniqueOrThrow
   */
  export type GuideTagFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuideTag
     */
    select?: GuideTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GuideTag
     */
    omit?: GuideTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideTagInclude<ExtArgs> | null
    /**
     * Filter, which GuideTag to fetch.
     */
    where: GuideTagWhereUniqueInput
  }

  /**
   * GuideTag findFirst
   */
  export type GuideTagFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuideTag
     */
    select?: GuideTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GuideTag
     */
    omit?: GuideTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideTagInclude<ExtArgs> | null
    /**
     * Filter, which GuideTag to fetch.
     */
    where?: GuideTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GuideTags to fetch.
     */
    orderBy?: GuideTagOrderByWithRelationInput | GuideTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GuideTags.
     */
    cursor?: GuideTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GuideTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GuideTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GuideTags.
     */
    distinct?: GuideTagScalarFieldEnum | GuideTagScalarFieldEnum[]
  }

  /**
   * GuideTag findFirstOrThrow
   */
  export type GuideTagFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuideTag
     */
    select?: GuideTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GuideTag
     */
    omit?: GuideTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideTagInclude<ExtArgs> | null
    /**
     * Filter, which GuideTag to fetch.
     */
    where?: GuideTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GuideTags to fetch.
     */
    orderBy?: GuideTagOrderByWithRelationInput | GuideTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GuideTags.
     */
    cursor?: GuideTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GuideTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GuideTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GuideTags.
     */
    distinct?: GuideTagScalarFieldEnum | GuideTagScalarFieldEnum[]
  }

  /**
   * GuideTag findMany
   */
  export type GuideTagFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuideTag
     */
    select?: GuideTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GuideTag
     */
    omit?: GuideTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideTagInclude<ExtArgs> | null
    /**
     * Filter, which GuideTags to fetch.
     */
    where?: GuideTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GuideTags to fetch.
     */
    orderBy?: GuideTagOrderByWithRelationInput | GuideTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GuideTags.
     */
    cursor?: GuideTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GuideTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GuideTags.
     */
    skip?: number
    distinct?: GuideTagScalarFieldEnum | GuideTagScalarFieldEnum[]
  }

  /**
   * GuideTag create
   */
  export type GuideTagCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuideTag
     */
    select?: GuideTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GuideTag
     */
    omit?: GuideTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideTagInclude<ExtArgs> | null
    /**
     * The data needed to create a GuideTag.
     */
    data: XOR<GuideTagCreateInput, GuideTagUncheckedCreateInput>
  }

  /**
   * GuideTag createMany
   */
  export type GuideTagCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GuideTags.
     */
    data: GuideTagCreateManyInput | GuideTagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GuideTag createManyAndReturn
   */
  export type GuideTagCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuideTag
     */
    select?: GuideTagSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GuideTag
     */
    omit?: GuideTagOmit<ExtArgs> | null
    /**
     * The data used to create many GuideTags.
     */
    data: GuideTagCreateManyInput | GuideTagCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideTagIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * GuideTag update
   */
  export type GuideTagUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuideTag
     */
    select?: GuideTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GuideTag
     */
    omit?: GuideTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideTagInclude<ExtArgs> | null
    /**
     * The data needed to update a GuideTag.
     */
    data: XOR<GuideTagUpdateInput, GuideTagUncheckedUpdateInput>
    /**
     * Choose, which GuideTag to update.
     */
    where: GuideTagWhereUniqueInput
  }

  /**
   * GuideTag updateMany
   */
  export type GuideTagUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GuideTags.
     */
    data: XOR<GuideTagUpdateManyMutationInput, GuideTagUncheckedUpdateManyInput>
    /**
     * Filter which GuideTags to update
     */
    where?: GuideTagWhereInput
    /**
     * Limit how many GuideTags to update.
     */
    limit?: number
  }

  /**
   * GuideTag updateManyAndReturn
   */
  export type GuideTagUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuideTag
     */
    select?: GuideTagSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GuideTag
     */
    omit?: GuideTagOmit<ExtArgs> | null
    /**
     * The data used to update GuideTags.
     */
    data: XOR<GuideTagUpdateManyMutationInput, GuideTagUncheckedUpdateManyInput>
    /**
     * Filter which GuideTags to update
     */
    where?: GuideTagWhereInput
    /**
     * Limit how many GuideTags to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideTagIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * GuideTag upsert
   */
  export type GuideTagUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuideTag
     */
    select?: GuideTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GuideTag
     */
    omit?: GuideTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideTagInclude<ExtArgs> | null
    /**
     * The filter to search for the GuideTag to update in case it exists.
     */
    where: GuideTagWhereUniqueInput
    /**
     * In case the GuideTag found by the `where` argument doesn't exist, create a new GuideTag with this data.
     */
    create: XOR<GuideTagCreateInput, GuideTagUncheckedCreateInput>
    /**
     * In case the GuideTag was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GuideTagUpdateInput, GuideTagUncheckedUpdateInput>
  }

  /**
   * GuideTag delete
   */
  export type GuideTagDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuideTag
     */
    select?: GuideTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GuideTag
     */
    omit?: GuideTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideTagInclude<ExtArgs> | null
    /**
     * Filter which GuideTag to delete.
     */
    where: GuideTagWhereUniqueInput
  }

  /**
   * GuideTag deleteMany
   */
  export type GuideTagDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GuideTags to delete
     */
    where?: GuideTagWhereInput
    /**
     * Limit how many GuideTags to delete.
     */
    limit?: number
  }

  /**
   * GuideTag without action
   */
  export type GuideTagDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuideTag
     */
    select?: GuideTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GuideTag
     */
    omit?: GuideTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GuideTagInclude<ExtArgs> | null
  }


  /**
   * Model Problem
   */

  export type AggregateProblem = {
    _count: ProblemCountAggregateOutputType | null
    _avg: ProblemAvgAggregateOutputType | null
    _sum: ProblemSumAggregateOutputType | null
    _min: ProblemMinAggregateOutputType | null
    _max: ProblemMaxAggregateOutputType | null
  }

  export type ProblemAvgAggregateOutputType = {
    id: number | null
    positiveRatings: number | null
    negativeRatings: number | null
    averageTimeLimit: number | null
    averageMemLimit: number | null
  }

  export type ProblemSumAggregateOutputType = {
    id: number | null
    positiveRatings: number | null
    negativeRatings: number | null
    averageTimeLimit: number | null
    averageMemLimit: number | null
  }

  export type ProblemMinAggregateOutputType = {
    id: number | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
    author: string | null
    positiveRatings: number | null
    negativeRatings: number | null
    description: string | null
    averageTimeLimit: number | null
    averageMemLimit: number | null
    category: string | null
    sourceCode: string | null
    difficulty: $Enums.Difficulty | null
  }

  export type ProblemMaxAggregateOutputType = {
    id: number | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
    author: string | null
    positiveRatings: number | null
    negativeRatings: number | null
    description: string | null
    averageTimeLimit: number | null
    averageMemLimit: number | null
    category: string | null
    sourceCode: string | null
    difficulty: $Enums.Difficulty | null
  }

  export type ProblemCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    updatedAt: number
    author: number
    positiveRatings: number
    negativeRatings: number
    description: number
    requirement: number
    tests: number
    averageTimeLimit: number
    averageMemLimit: number
    category: number
    sourceCode: number
    difficulty: number
    tags: number
    _all: number
  }


  export type ProblemAvgAggregateInputType = {
    id?: true
    positiveRatings?: true
    negativeRatings?: true
    averageTimeLimit?: true
    averageMemLimit?: true
  }

  export type ProblemSumAggregateInputType = {
    id?: true
    positiveRatings?: true
    negativeRatings?: true
    averageTimeLimit?: true
    averageMemLimit?: true
  }

  export type ProblemMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    author?: true
    positiveRatings?: true
    negativeRatings?: true
    description?: true
    averageTimeLimit?: true
    averageMemLimit?: true
    category?: true
    sourceCode?: true
    difficulty?: true
  }

  export type ProblemMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    author?: true
    positiveRatings?: true
    negativeRatings?: true
    description?: true
    averageTimeLimit?: true
    averageMemLimit?: true
    category?: true
    sourceCode?: true
    difficulty?: true
  }

  export type ProblemCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    author?: true
    positiveRatings?: true
    negativeRatings?: true
    description?: true
    requirement?: true
    tests?: true
    averageTimeLimit?: true
    averageMemLimit?: true
    category?: true
    sourceCode?: true
    difficulty?: true
    tags?: true
    _all?: true
  }

  export type ProblemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Problem to aggregate.
     */
    where?: ProblemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Problems to fetch.
     */
    orderBy?: ProblemOrderByWithRelationInput | ProblemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProblemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Problems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Problems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Problems
    **/
    _count?: true | ProblemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProblemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProblemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProblemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProblemMaxAggregateInputType
  }

  export type GetProblemAggregateType<T extends ProblemAggregateArgs> = {
        [P in keyof T & keyof AggregateProblem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProblem[P]>
      : GetScalarType<T[P], AggregateProblem[P]>
  }




  export type ProblemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProblemWhereInput
    orderBy?: ProblemOrderByWithAggregationInput | ProblemOrderByWithAggregationInput[]
    by: ProblemScalarFieldEnum[] | ProblemScalarFieldEnum
    having?: ProblemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProblemCountAggregateInputType | true
    _avg?: ProblemAvgAggregateInputType
    _sum?: ProblemSumAggregateInputType
    _min?: ProblemMinAggregateInputType
    _max?: ProblemMaxAggregateInputType
  }

  export type ProblemGroupByOutputType = {
    id: number
    name: string
    createdAt: Date
    updatedAt: Date
    author: string
    positiveRatings: number
    negativeRatings: number
    description: string | null
    requirement: JsonValue | null
    tests: JsonValue[]
    averageTimeLimit: number
    averageMemLimit: number
    category: string | null
    sourceCode: string | null
    difficulty: $Enums.Difficulty | null
    tags: string[]
    _count: ProblemCountAggregateOutputType | null
    _avg: ProblemAvgAggregateOutputType | null
    _sum: ProblemSumAggregateOutputType | null
    _min: ProblemMinAggregateOutputType | null
    _max: ProblemMaxAggregateOutputType | null
  }

  type GetProblemGroupByPayload<T extends ProblemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProblemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProblemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProblemGroupByOutputType[P]>
            : GetScalarType<T[P], ProblemGroupByOutputType[P]>
        }
      >
    >


  export type ProblemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    author?: boolean
    positiveRatings?: boolean
    negativeRatings?: boolean
    description?: boolean
    requirement?: boolean
    tests?: boolean
    averageTimeLimit?: boolean
    averageMemLimit?: boolean
    category?: boolean
    sourceCode?: boolean
    difficulty?: boolean
    tags?: boolean
    solves?: boolean | Problem$solvesArgs<ExtArgs>
    _count?: boolean | ProblemCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["problem"]>

  export type ProblemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    author?: boolean
    positiveRatings?: boolean
    negativeRatings?: boolean
    description?: boolean
    requirement?: boolean
    tests?: boolean
    averageTimeLimit?: boolean
    averageMemLimit?: boolean
    category?: boolean
    sourceCode?: boolean
    difficulty?: boolean
    tags?: boolean
  }, ExtArgs["result"]["problem"]>

  export type ProblemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    author?: boolean
    positiveRatings?: boolean
    negativeRatings?: boolean
    description?: boolean
    requirement?: boolean
    tests?: boolean
    averageTimeLimit?: boolean
    averageMemLimit?: boolean
    category?: boolean
    sourceCode?: boolean
    difficulty?: boolean
    tags?: boolean
  }, ExtArgs["result"]["problem"]>

  export type ProblemSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    author?: boolean
    positiveRatings?: boolean
    negativeRatings?: boolean
    description?: boolean
    requirement?: boolean
    tests?: boolean
    averageTimeLimit?: boolean
    averageMemLimit?: boolean
    category?: boolean
    sourceCode?: boolean
    difficulty?: boolean
    tags?: boolean
  }

  export type ProblemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "createdAt" | "updatedAt" | "author" | "positiveRatings" | "negativeRatings" | "description" | "requirement" | "tests" | "averageTimeLimit" | "averageMemLimit" | "category" | "sourceCode" | "difficulty" | "tags", ExtArgs["result"]["problem"]>
  export type ProblemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    solves?: boolean | Problem$solvesArgs<ExtArgs>
    _count?: boolean | ProblemCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProblemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ProblemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ProblemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Problem"
    objects: {
      solves: Prisma.$SolvePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      createdAt: Date
      updatedAt: Date
      author: string
      positiveRatings: number
      negativeRatings: number
      description: string | null
      requirement: Prisma.JsonValue | null
      tests: Prisma.JsonValue[]
      averageTimeLimit: number
      averageMemLimit: number
      category: string | null
      sourceCode: string | null
      difficulty: $Enums.Difficulty | null
      tags: string[]
    }, ExtArgs["result"]["problem"]>
    composites: {}
  }

  type ProblemGetPayload<S extends boolean | null | undefined | ProblemDefaultArgs> = $Result.GetResult<Prisma.$ProblemPayload, S>

  type ProblemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProblemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProblemCountAggregateInputType | true
    }

  export interface ProblemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Problem'], meta: { name: 'Problem' } }
    /**
     * Find zero or one Problem that matches the filter.
     * @param {ProblemFindUniqueArgs} args - Arguments to find a Problem
     * @example
     * // Get one Problem
     * const problem = await prisma.problem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProblemFindUniqueArgs>(args: SelectSubset<T, ProblemFindUniqueArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Problem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProblemFindUniqueOrThrowArgs} args - Arguments to find a Problem
     * @example
     * // Get one Problem
     * const problem = await prisma.problem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProblemFindUniqueOrThrowArgs>(args: SelectSubset<T, ProblemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Problem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemFindFirstArgs} args - Arguments to find a Problem
     * @example
     * // Get one Problem
     * const problem = await prisma.problem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProblemFindFirstArgs>(args?: SelectSubset<T, ProblemFindFirstArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Problem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemFindFirstOrThrowArgs} args - Arguments to find a Problem
     * @example
     * // Get one Problem
     * const problem = await prisma.problem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProblemFindFirstOrThrowArgs>(args?: SelectSubset<T, ProblemFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Problems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Problems
     * const problems = await prisma.problem.findMany()
     * 
     * // Get first 10 Problems
     * const problems = await prisma.problem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const problemWithIdOnly = await prisma.problem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProblemFindManyArgs>(args?: SelectSubset<T, ProblemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Problem.
     * @param {ProblemCreateArgs} args - Arguments to create a Problem.
     * @example
     * // Create one Problem
     * const Problem = await prisma.problem.create({
     *   data: {
     *     // ... data to create a Problem
     *   }
     * })
     * 
     */
    create<T extends ProblemCreateArgs>(args: SelectSubset<T, ProblemCreateArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Problems.
     * @param {ProblemCreateManyArgs} args - Arguments to create many Problems.
     * @example
     * // Create many Problems
     * const problem = await prisma.problem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProblemCreateManyArgs>(args?: SelectSubset<T, ProblemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Problems and returns the data saved in the database.
     * @param {ProblemCreateManyAndReturnArgs} args - Arguments to create many Problems.
     * @example
     * // Create many Problems
     * const problem = await prisma.problem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Problems and only return the `id`
     * const problemWithIdOnly = await prisma.problem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProblemCreateManyAndReturnArgs>(args?: SelectSubset<T, ProblemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Problem.
     * @param {ProblemDeleteArgs} args - Arguments to delete one Problem.
     * @example
     * // Delete one Problem
     * const Problem = await prisma.problem.delete({
     *   where: {
     *     // ... filter to delete one Problem
     *   }
     * })
     * 
     */
    delete<T extends ProblemDeleteArgs>(args: SelectSubset<T, ProblemDeleteArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Problem.
     * @param {ProblemUpdateArgs} args - Arguments to update one Problem.
     * @example
     * // Update one Problem
     * const problem = await prisma.problem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProblemUpdateArgs>(args: SelectSubset<T, ProblemUpdateArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Problems.
     * @param {ProblemDeleteManyArgs} args - Arguments to filter Problems to delete.
     * @example
     * // Delete a few Problems
     * const { count } = await prisma.problem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProblemDeleteManyArgs>(args?: SelectSubset<T, ProblemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Problems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Problems
     * const problem = await prisma.problem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProblemUpdateManyArgs>(args: SelectSubset<T, ProblemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Problems and returns the data updated in the database.
     * @param {ProblemUpdateManyAndReturnArgs} args - Arguments to update many Problems.
     * @example
     * // Update many Problems
     * const problem = await prisma.problem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Problems and only return the `id`
     * const problemWithIdOnly = await prisma.problem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProblemUpdateManyAndReturnArgs>(args: SelectSubset<T, ProblemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Problem.
     * @param {ProblemUpsertArgs} args - Arguments to update or create a Problem.
     * @example
     * // Update or create a Problem
     * const problem = await prisma.problem.upsert({
     *   create: {
     *     // ... data to create a Problem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Problem we want to update
     *   }
     * })
     */
    upsert<T extends ProblemUpsertArgs>(args: SelectSubset<T, ProblemUpsertArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Problems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemCountArgs} args - Arguments to filter Problems to count.
     * @example
     * // Count the number of Problems
     * const count = await prisma.problem.count({
     *   where: {
     *     // ... the filter for the Problems we want to count
     *   }
     * })
    **/
    count<T extends ProblemCountArgs>(
      args?: Subset<T, ProblemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProblemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Problem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProblemAggregateArgs>(args: Subset<T, ProblemAggregateArgs>): Prisma.PrismaPromise<GetProblemAggregateType<T>>

    /**
     * Group by Problem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProblemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProblemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProblemGroupByArgs['orderBy'] }
        : { orderBy?: ProblemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProblemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProblemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Problem model
   */
  readonly fields: ProblemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Problem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProblemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    solves<T extends Problem$solvesArgs<ExtArgs> = {}>(args?: Subset<T, Problem$solvesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SolvePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Problem model
   */
  interface ProblemFieldRefs {
    readonly id: FieldRef<"Problem", 'Int'>
    readonly name: FieldRef<"Problem", 'String'>
    readonly createdAt: FieldRef<"Problem", 'DateTime'>
    readonly updatedAt: FieldRef<"Problem", 'DateTime'>
    readonly author: FieldRef<"Problem", 'String'>
    readonly positiveRatings: FieldRef<"Problem", 'Int'>
    readonly negativeRatings: FieldRef<"Problem", 'Int'>
    readonly description: FieldRef<"Problem", 'String'>
    readonly requirement: FieldRef<"Problem", 'Json'>
    readonly tests: FieldRef<"Problem", 'Json[]'>
    readonly averageTimeLimit: FieldRef<"Problem", 'Float'>
    readonly averageMemLimit: FieldRef<"Problem", 'Float'>
    readonly category: FieldRef<"Problem", 'String'>
    readonly sourceCode: FieldRef<"Problem", 'String'>
    readonly difficulty: FieldRef<"Problem", 'Difficulty'>
    readonly tags: FieldRef<"Problem", 'String[]'>
  }
    

  // Custom InputTypes
  /**
   * Problem findUnique
   */
  export type ProblemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * Filter, which Problem to fetch.
     */
    where: ProblemWhereUniqueInput
  }

  /**
   * Problem findUniqueOrThrow
   */
  export type ProblemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * Filter, which Problem to fetch.
     */
    where: ProblemWhereUniqueInput
  }

  /**
   * Problem findFirst
   */
  export type ProblemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * Filter, which Problem to fetch.
     */
    where?: ProblemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Problems to fetch.
     */
    orderBy?: ProblemOrderByWithRelationInput | ProblemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Problems.
     */
    cursor?: ProblemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Problems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Problems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Problems.
     */
    distinct?: ProblemScalarFieldEnum | ProblemScalarFieldEnum[]
  }

  /**
   * Problem findFirstOrThrow
   */
  export type ProblemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * Filter, which Problem to fetch.
     */
    where?: ProblemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Problems to fetch.
     */
    orderBy?: ProblemOrderByWithRelationInput | ProblemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Problems.
     */
    cursor?: ProblemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Problems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Problems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Problems.
     */
    distinct?: ProblemScalarFieldEnum | ProblemScalarFieldEnum[]
  }

  /**
   * Problem findMany
   */
  export type ProblemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * Filter, which Problems to fetch.
     */
    where?: ProblemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Problems to fetch.
     */
    orderBy?: ProblemOrderByWithRelationInput | ProblemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Problems.
     */
    cursor?: ProblemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Problems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Problems.
     */
    skip?: number
    distinct?: ProblemScalarFieldEnum | ProblemScalarFieldEnum[]
  }

  /**
   * Problem create
   */
  export type ProblemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * The data needed to create a Problem.
     */
    data: XOR<ProblemCreateInput, ProblemUncheckedCreateInput>
  }

  /**
   * Problem createMany
   */
  export type ProblemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Problems.
     */
    data: ProblemCreateManyInput | ProblemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Problem createManyAndReturn
   */
  export type ProblemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * The data used to create many Problems.
     */
    data: ProblemCreateManyInput | ProblemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Problem update
   */
  export type ProblemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * The data needed to update a Problem.
     */
    data: XOR<ProblemUpdateInput, ProblemUncheckedUpdateInput>
    /**
     * Choose, which Problem to update.
     */
    where: ProblemWhereUniqueInput
  }

  /**
   * Problem updateMany
   */
  export type ProblemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Problems.
     */
    data: XOR<ProblemUpdateManyMutationInput, ProblemUncheckedUpdateManyInput>
    /**
     * Filter which Problems to update
     */
    where?: ProblemWhereInput
    /**
     * Limit how many Problems to update.
     */
    limit?: number
  }

  /**
   * Problem updateManyAndReturn
   */
  export type ProblemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * The data used to update Problems.
     */
    data: XOR<ProblemUpdateManyMutationInput, ProblemUncheckedUpdateManyInput>
    /**
     * Filter which Problems to update
     */
    where?: ProblemWhereInput
    /**
     * Limit how many Problems to update.
     */
    limit?: number
  }

  /**
   * Problem upsert
   */
  export type ProblemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * The filter to search for the Problem to update in case it exists.
     */
    where: ProblemWhereUniqueInput
    /**
     * In case the Problem found by the `where` argument doesn't exist, create a new Problem with this data.
     */
    create: XOR<ProblemCreateInput, ProblemUncheckedCreateInput>
    /**
     * In case the Problem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProblemUpdateInput, ProblemUncheckedUpdateInput>
  }

  /**
   * Problem delete
   */
  export type ProblemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
    /**
     * Filter which Problem to delete.
     */
    where: ProblemWhereUniqueInput
  }

  /**
   * Problem deleteMany
   */
  export type ProblemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Problems to delete
     */
    where?: ProblemWhereInput
    /**
     * Limit how many Problems to delete.
     */
    limit?: number
  }

  /**
   * Problem.solves
   */
  export type Problem$solvesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Solve
     */
    select?: SolveSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Solve
     */
    omit?: SolveOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolveInclude<ExtArgs> | null
    where?: SolveWhereInput
    orderBy?: SolveOrderByWithRelationInput | SolveOrderByWithRelationInput[]
    cursor?: SolveWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SolveScalarFieldEnum | SolveScalarFieldEnum[]
  }

  /**
   * Problem without action
   */
  export type ProblemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Problem
     */
    select?: ProblemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Problem
     */
    omit?: ProblemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProblemInclude<ExtArgs> | null
  }


  /**
   * Model Solve
   */

  export type AggregateSolve = {
    _count: SolveCountAggregateOutputType | null
    _avg: SolveAvgAggregateOutputType | null
    _sum: SolveSumAggregateOutputType | null
    _min: SolveMinAggregateOutputType | null
    _max: SolveMaxAggregateOutputType | null
  }

  export type SolveAvgAggregateOutputType = {
    id: number | null
    userId: number | null
    problemid: number | null
    score: number | null
    time: number | null
  }

  export type SolveSumAggregateOutputType = {
    id: number | null
    userId: number | null
    problemid: number | null
    score: number | null
    time: number | null
  }

  export type SolveMinAggregateOutputType = {
    id: number | null
    userId: number | null
    problemid: number | null
    sourceCode: string | null
    uploadedAt: Date | null
    score: number | null
    time: number | null
  }

  export type SolveMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    problemid: number | null
    sourceCode: string | null
    uploadedAt: Date | null
    score: number | null
    time: number | null
  }

  export type SolveCountAggregateOutputType = {
    id: number
    userId: number
    problemid: number
    sourceCode: number
    uploadedAt: number
    score: number
    time: number
    _all: number
  }


  export type SolveAvgAggregateInputType = {
    id?: true
    userId?: true
    problemid?: true
    score?: true
    time?: true
  }

  export type SolveSumAggregateInputType = {
    id?: true
    userId?: true
    problemid?: true
    score?: true
    time?: true
  }

  export type SolveMinAggregateInputType = {
    id?: true
    userId?: true
    problemid?: true
    sourceCode?: true
    uploadedAt?: true
    score?: true
    time?: true
  }

  export type SolveMaxAggregateInputType = {
    id?: true
    userId?: true
    problemid?: true
    sourceCode?: true
    uploadedAt?: true
    score?: true
    time?: true
  }

  export type SolveCountAggregateInputType = {
    id?: true
    userId?: true
    problemid?: true
    sourceCode?: true
    uploadedAt?: true
    score?: true
    time?: true
    _all?: true
  }

  export type SolveAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Solve to aggregate.
     */
    where?: SolveWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Solves to fetch.
     */
    orderBy?: SolveOrderByWithRelationInput | SolveOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SolveWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Solves from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Solves.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Solves
    **/
    _count?: true | SolveCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SolveAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SolveSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SolveMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SolveMaxAggregateInputType
  }

  export type GetSolveAggregateType<T extends SolveAggregateArgs> = {
        [P in keyof T & keyof AggregateSolve]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSolve[P]>
      : GetScalarType<T[P], AggregateSolve[P]>
  }




  export type SolveGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SolveWhereInput
    orderBy?: SolveOrderByWithAggregationInput | SolveOrderByWithAggregationInput[]
    by: SolveScalarFieldEnum[] | SolveScalarFieldEnum
    having?: SolveScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SolveCountAggregateInputType | true
    _avg?: SolveAvgAggregateInputType
    _sum?: SolveSumAggregateInputType
    _min?: SolveMinAggregateInputType
    _max?: SolveMaxAggregateInputType
  }

  export type SolveGroupByOutputType = {
    id: number
    userId: number
    problemid: number
    sourceCode: string
    uploadedAt: Date
    score: number
    time: number
    _count: SolveCountAggregateOutputType | null
    _avg: SolveAvgAggregateOutputType | null
    _sum: SolveSumAggregateOutputType | null
    _min: SolveMinAggregateOutputType | null
    _max: SolveMaxAggregateOutputType | null
  }

  type GetSolveGroupByPayload<T extends SolveGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SolveGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SolveGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SolveGroupByOutputType[P]>
            : GetScalarType<T[P], SolveGroupByOutputType[P]>
        }
      >
    >


  export type SolveSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    problemid?: boolean
    sourceCode?: boolean
    uploadedAt?: boolean
    score?: boolean
    time?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["solve"]>

  export type SolveSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    problemid?: boolean
    sourceCode?: boolean
    uploadedAt?: boolean
    score?: boolean
    time?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["solve"]>

  export type SolveSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    problemid?: boolean
    sourceCode?: boolean
    uploadedAt?: boolean
    score?: boolean
    time?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["solve"]>

  export type SolveSelectScalar = {
    id?: boolean
    userId?: boolean
    problemid?: boolean
    sourceCode?: boolean
    uploadedAt?: boolean
    score?: boolean
    time?: boolean
  }

  export type SolveOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "problemid" | "sourceCode" | "uploadedAt" | "score" | "time", ExtArgs["result"]["solve"]>
  export type SolveInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
  }
  export type SolveIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
  }
  export type SolveIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    problem?: boolean | ProblemDefaultArgs<ExtArgs>
  }

  export type $SolvePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Solve"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      problem: Prisma.$ProblemPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number
      problemid: number
      sourceCode: string
      uploadedAt: Date
      score: number
      time: number
    }, ExtArgs["result"]["solve"]>
    composites: {}
  }

  type SolveGetPayload<S extends boolean | null | undefined | SolveDefaultArgs> = $Result.GetResult<Prisma.$SolvePayload, S>

  type SolveCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SolveFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SolveCountAggregateInputType | true
    }

  export interface SolveDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Solve'], meta: { name: 'Solve' } }
    /**
     * Find zero or one Solve that matches the filter.
     * @param {SolveFindUniqueArgs} args - Arguments to find a Solve
     * @example
     * // Get one Solve
     * const solve = await prisma.solve.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SolveFindUniqueArgs>(args: SelectSubset<T, SolveFindUniqueArgs<ExtArgs>>): Prisma__SolveClient<$Result.GetResult<Prisma.$SolvePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Solve that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SolveFindUniqueOrThrowArgs} args - Arguments to find a Solve
     * @example
     * // Get one Solve
     * const solve = await prisma.solve.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SolveFindUniqueOrThrowArgs>(args: SelectSubset<T, SolveFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SolveClient<$Result.GetResult<Prisma.$SolvePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Solve that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SolveFindFirstArgs} args - Arguments to find a Solve
     * @example
     * // Get one Solve
     * const solve = await prisma.solve.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SolveFindFirstArgs>(args?: SelectSubset<T, SolveFindFirstArgs<ExtArgs>>): Prisma__SolveClient<$Result.GetResult<Prisma.$SolvePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Solve that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SolveFindFirstOrThrowArgs} args - Arguments to find a Solve
     * @example
     * // Get one Solve
     * const solve = await prisma.solve.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SolveFindFirstOrThrowArgs>(args?: SelectSubset<T, SolveFindFirstOrThrowArgs<ExtArgs>>): Prisma__SolveClient<$Result.GetResult<Prisma.$SolvePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Solves that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SolveFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Solves
     * const solves = await prisma.solve.findMany()
     * 
     * // Get first 10 Solves
     * const solves = await prisma.solve.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const solveWithIdOnly = await prisma.solve.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SolveFindManyArgs>(args?: SelectSubset<T, SolveFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SolvePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Solve.
     * @param {SolveCreateArgs} args - Arguments to create a Solve.
     * @example
     * // Create one Solve
     * const Solve = await prisma.solve.create({
     *   data: {
     *     // ... data to create a Solve
     *   }
     * })
     * 
     */
    create<T extends SolveCreateArgs>(args: SelectSubset<T, SolveCreateArgs<ExtArgs>>): Prisma__SolveClient<$Result.GetResult<Prisma.$SolvePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Solves.
     * @param {SolveCreateManyArgs} args - Arguments to create many Solves.
     * @example
     * // Create many Solves
     * const solve = await prisma.solve.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SolveCreateManyArgs>(args?: SelectSubset<T, SolveCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Solves and returns the data saved in the database.
     * @param {SolveCreateManyAndReturnArgs} args - Arguments to create many Solves.
     * @example
     * // Create many Solves
     * const solve = await prisma.solve.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Solves and only return the `id`
     * const solveWithIdOnly = await prisma.solve.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SolveCreateManyAndReturnArgs>(args?: SelectSubset<T, SolveCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SolvePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Solve.
     * @param {SolveDeleteArgs} args - Arguments to delete one Solve.
     * @example
     * // Delete one Solve
     * const Solve = await prisma.solve.delete({
     *   where: {
     *     // ... filter to delete one Solve
     *   }
     * })
     * 
     */
    delete<T extends SolveDeleteArgs>(args: SelectSubset<T, SolveDeleteArgs<ExtArgs>>): Prisma__SolveClient<$Result.GetResult<Prisma.$SolvePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Solve.
     * @param {SolveUpdateArgs} args - Arguments to update one Solve.
     * @example
     * // Update one Solve
     * const solve = await prisma.solve.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SolveUpdateArgs>(args: SelectSubset<T, SolveUpdateArgs<ExtArgs>>): Prisma__SolveClient<$Result.GetResult<Prisma.$SolvePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Solves.
     * @param {SolveDeleteManyArgs} args - Arguments to filter Solves to delete.
     * @example
     * // Delete a few Solves
     * const { count } = await prisma.solve.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SolveDeleteManyArgs>(args?: SelectSubset<T, SolveDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Solves.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SolveUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Solves
     * const solve = await prisma.solve.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SolveUpdateManyArgs>(args: SelectSubset<T, SolveUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Solves and returns the data updated in the database.
     * @param {SolveUpdateManyAndReturnArgs} args - Arguments to update many Solves.
     * @example
     * // Update many Solves
     * const solve = await prisma.solve.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Solves and only return the `id`
     * const solveWithIdOnly = await prisma.solve.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SolveUpdateManyAndReturnArgs>(args: SelectSubset<T, SolveUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SolvePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Solve.
     * @param {SolveUpsertArgs} args - Arguments to update or create a Solve.
     * @example
     * // Update or create a Solve
     * const solve = await prisma.solve.upsert({
     *   create: {
     *     // ... data to create a Solve
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Solve we want to update
     *   }
     * })
     */
    upsert<T extends SolveUpsertArgs>(args: SelectSubset<T, SolveUpsertArgs<ExtArgs>>): Prisma__SolveClient<$Result.GetResult<Prisma.$SolvePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Solves.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SolveCountArgs} args - Arguments to filter Solves to count.
     * @example
     * // Count the number of Solves
     * const count = await prisma.solve.count({
     *   where: {
     *     // ... the filter for the Solves we want to count
     *   }
     * })
    **/
    count<T extends SolveCountArgs>(
      args?: Subset<T, SolveCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SolveCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Solve.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SolveAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SolveAggregateArgs>(args: Subset<T, SolveAggregateArgs>): Prisma.PrismaPromise<GetSolveAggregateType<T>>

    /**
     * Group by Solve.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SolveGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SolveGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SolveGroupByArgs['orderBy'] }
        : { orderBy?: SolveGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SolveGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSolveGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Solve model
   */
  readonly fields: SolveFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Solve.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SolveClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    problem<T extends ProblemDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProblemDefaultArgs<ExtArgs>>): Prisma__ProblemClient<$Result.GetResult<Prisma.$ProblemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Solve model
   */
  interface SolveFieldRefs {
    readonly id: FieldRef<"Solve", 'Int'>
    readonly userId: FieldRef<"Solve", 'Int'>
    readonly problemid: FieldRef<"Solve", 'Int'>
    readonly sourceCode: FieldRef<"Solve", 'String'>
    readonly uploadedAt: FieldRef<"Solve", 'DateTime'>
    readonly score: FieldRef<"Solve", 'Int'>
    readonly time: FieldRef<"Solve", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Solve findUnique
   */
  export type SolveFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Solve
     */
    select?: SolveSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Solve
     */
    omit?: SolveOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolveInclude<ExtArgs> | null
    /**
     * Filter, which Solve to fetch.
     */
    where: SolveWhereUniqueInput
  }

  /**
   * Solve findUniqueOrThrow
   */
  export type SolveFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Solve
     */
    select?: SolveSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Solve
     */
    omit?: SolveOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolveInclude<ExtArgs> | null
    /**
     * Filter, which Solve to fetch.
     */
    where: SolveWhereUniqueInput
  }

  /**
   * Solve findFirst
   */
  export type SolveFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Solve
     */
    select?: SolveSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Solve
     */
    omit?: SolveOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolveInclude<ExtArgs> | null
    /**
     * Filter, which Solve to fetch.
     */
    where?: SolveWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Solves to fetch.
     */
    orderBy?: SolveOrderByWithRelationInput | SolveOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Solves.
     */
    cursor?: SolveWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Solves from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Solves.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Solves.
     */
    distinct?: SolveScalarFieldEnum | SolveScalarFieldEnum[]
  }

  /**
   * Solve findFirstOrThrow
   */
  export type SolveFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Solve
     */
    select?: SolveSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Solve
     */
    omit?: SolveOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolveInclude<ExtArgs> | null
    /**
     * Filter, which Solve to fetch.
     */
    where?: SolveWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Solves to fetch.
     */
    orderBy?: SolveOrderByWithRelationInput | SolveOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Solves.
     */
    cursor?: SolveWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Solves from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Solves.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Solves.
     */
    distinct?: SolveScalarFieldEnum | SolveScalarFieldEnum[]
  }

  /**
   * Solve findMany
   */
  export type SolveFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Solve
     */
    select?: SolveSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Solve
     */
    omit?: SolveOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolveInclude<ExtArgs> | null
    /**
     * Filter, which Solves to fetch.
     */
    where?: SolveWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Solves to fetch.
     */
    orderBy?: SolveOrderByWithRelationInput | SolveOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Solves.
     */
    cursor?: SolveWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Solves from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Solves.
     */
    skip?: number
    distinct?: SolveScalarFieldEnum | SolveScalarFieldEnum[]
  }

  /**
   * Solve create
   */
  export type SolveCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Solve
     */
    select?: SolveSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Solve
     */
    omit?: SolveOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolveInclude<ExtArgs> | null
    /**
     * The data needed to create a Solve.
     */
    data: XOR<SolveCreateInput, SolveUncheckedCreateInput>
  }

  /**
   * Solve createMany
   */
  export type SolveCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Solves.
     */
    data: SolveCreateManyInput | SolveCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Solve createManyAndReturn
   */
  export type SolveCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Solve
     */
    select?: SolveSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Solve
     */
    omit?: SolveOmit<ExtArgs> | null
    /**
     * The data used to create many Solves.
     */
    data: SolveCreateManyInput | SolveCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolveIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Solve update
   */
  export type SolveUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Solve
     */
    select?: SolveSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Solve
     */
    omit?: SolveOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolveInclude<ExtArgs> | null
    /**
     * The data needed to update a Solve.
     */
    data: XOR<SolveUpdateInput, SolveUncheckedUpdateInput>
    /**
     * Choose, which Solve to update.
     */
    where: SolveWhereUniqueInput
  }

  /**
   * Solve updateMany
   */
  export type SolveUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Solves.
     */
    data: XOR<SolveUpdateManyMutationInput, SolveUncheckedUpdateManyInput>
    /**
     * Filter which Solves to update
     */
    where?: SolveWhereInput
    /**
     * Limit how many Solves to update.
     */
    limit?: number
  }

  /**
   * Solve updateManyAndReturn
   */
  export type SolveUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Solve
     */
    select?: SolveSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Solve
     */
    omit?: SolveOmit<ExtArgs> | null
    /**
     * The data used to update Solves.
     */
    data: XOR<SolveUpdateManyMutationInput, SolveUncheckedUpdateManyInput>
    /**
     * Filter which Solves to update
     */
    where?: SolveWhereInput
    /**
     * Limit how many Solves to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolveIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Solve upsert
   */
  export type SolveUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Solve
     */
    select?: SolveSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Solve
     */
    omit?: SolveOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolveInclude<ExtArgs> | null
    /**
     * The filter to search for the Solve to update in case it exists.
     */
    where: SolveWhereUniqueInput
    /**
     * In case the Solve found by the `where` argument doesn't exist, create a new Solve with this data.
     */
    create: XOR<SolveCreateInput, SolveUncheckedCreateInput>
    /**
     * In case the Solve was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SolveUpdateInput, SolveUncheckedUpdateInput>
  }

  /**
   * Solve delete
   */
  export type SolveDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Solve
     */
    select?: SolveSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Solve
     */
    omit?: SolveOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolveInclude<ExtArgs> | null
    /**
     * Filter which Solve to delete.
     */
    where: SolveWhereUniqueInput
  }

  /**
   * Solve deleteMany
   */
  export type SolveDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Solves to delete
     */
    where?: SolveWhereInput
    /**
     * Limit how many Solves to delete.
     */
    limit?: number
  }

  /**
   * Solve without action
   */
  export type SolveDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Solve
     */
    select?: SolveSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Solve
     */
    omit?: SolveOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolveInclude<ExtArgs> | null
  }


  /**
   * Model Course
   */

  export type AggregateCourse = {
    _count: CourseCountAggregateOutputType | null
    _avg: CourseAvgAggregateOutputType | null
    _sum: CourseSumAggregateOutputType | null
    _min: CourseMinAggregateOutputType | null
    _max: CourseMaxAggregateOutputType | null
  }

  export type CourseAvgAggregateOutputType = {
    id: number | null
    userId: number | null
    price: number | null
    courseLength: number | null
  }

  export type CourseSumAggregateOutputType = {
    id: number | null
    userId: number | null
    price: number | null
    courseLength: number | null
  }

  export type CourseMinAggregateOutputType = {
    id: number | null
    userId: number | null
    experience: string | null
    price: number | null
    courseLength: number | null
    description: string | null
    phone: string | null
    email: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CourseMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    experience: string | null
    price: number | null
    courseLength: number | null
    description: string | null
    phone: string | null
    email: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CourseCountAggregateOutputType = {
    id: number
    userId: number
    experience: number
    price: number
    courseLength: number
    description: number
    phone: number
    external: number
    email: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CourseAvgAggregateInputType = {
    id?: true
    userId?: true
    price?: true
    courseLength?: true
  }

  export type CourseSumAggregateInputType = {
    id?: true
    userId?: true
    price?: true
    courseLength?: true
  }

  export type CourseMinAggregateInputType = {
    id?: true
    userId?: true
    experience?: true
    price?: true
    courseLength?: true
    description?: true
    phone?: true
    email?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CourseMaxAggregateInputType = {
    id?: true
    userId?: true
    experience?: true
    price?: true
    courseLength?: true
    description?: true
    phone?: true
    email?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CourseCountAggregateInputType = {
    id?: true
    userId?: true
    experience?: true
    price?: true
    courseLength?: true
    description?: true
    phone?: true
    external?: true
    email?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CourseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Course to aggregate.
     */
    where?: CourseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Courses to fetch.
     */
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CourseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Courses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Courses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Courses
    **/
    _count?: true | CourseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CourseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CourseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CourseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CourseMaxAggregateInputType
  }

  export type GetCourseAggregateType<T extends CourseAggregateArgs> = {
        [P in keyof T & keyof AggregateCourse]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCourse[P]>
      : GetScalarType<T[P], AggregateCourse[P]>
  }




  export type CourseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CourseWhereInput
    orderBy?: CourseOrderByWithAggregationInput | CourseOrderByWithAggregationInput[]
    by: CourseScalarFieldEnum[] | CourseScalarFieldEnum
    having?: CourseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CourseCountAggregateInputType | true
    _avg?: CourseAvgAggregateInputType
    _sum?: CourseSumAggregateInputType
    _min?: CourseMinAggregateInputType
    _max?: CourseMaxAggregateInputType
  }

  export type CourseGroupByOutputType = {
    id: number
    userId: number
    experience: string
    price: number
    courseLength: number
    description: string
    phone: string | null
    external: string[]
    email: string | null
    createdAt: Date
    updatedAt: Date
    _count: CourseCountAggregateOutputType | null
    _avg: CourseAvgAggregateOutputType | null
    _sum: CourseSumAggregateOutputType | null
    _min: CourseMinAggregateOutputType | null
    _max: CourseMaxAggregateOutputType | null
  }

  type GetCourseGroupByPayload<T extends CourseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CourseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CourseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CourseGroupByOutputType[P]>
            : GetScalarType<T[P], CourseGroupByOutputType[P]>
        }
      >
    >


  export type CourseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    experience?: boolean
    price?: boolean
    courseLength?: boolean
    description?: boolean
    phone?: boolean
    external?: boolean
    email?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["course"]>

  export type CourseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    experience?: boolean
    price?: boolean
    courseLength?: boolean
    description?: boolean
    phone?: boolean
    external?: boolean
    email?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["course"]>

  export type CourseSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    experience?: boolean
    price?: boolean
    courseLength?: boolean
    description?: boolean
    phone?: boolean
    external?: boolean
    email?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["course"]>

  export type CourseSelectScalar = {
    id?: boolean
    userId?: boolean
    experience?: boolean
    price?: boolean
    courseLength?: boolean
    description?: boolean
    phone?: boolean
    external?: boolean
    email?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CourseOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "experience" | "price" | "courseLength" | "description" | "phone" | "external" | "email" | "createdAt" | "updatedAt", ExtArgs["result"]["course"]>
  export type CourseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CourseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type CourseIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $CoursePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Course"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number
      experience: string
      price: number
      courseLength: number
      description: string
      phone: string | null
      external: string[]
      email: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["course"]>
    composites: {}
  }

  type CourseGetPayload<S extends boolean | null | undefined | CourseDefaultArgs> = $Result.GetResult<Prisma.$CoursePayload, S>

  type CourseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CourseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CourseCountAggregateInputType | true
    }

  export interface CourseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Course'], meta: { name: 'Course' } }
    /**
     * Find zero or one Course that matches the filter.
     * @param {CourseFindUniqueArgs} args - Arguments to find a Course
     * @example
     * // Get one Course
     * const course = await prisma.course.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CourseFindUniqueArgs>(args: SelectSubset<T, CourseFindUniqueArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Course that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CourseFindUniqueOrThrowArgs} args - Arguments to find a Course
     * @example
     * // Get one Course
     * const course = await prisma.course.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CourseFindUniqueOrThrowArgs>(args: SelectSubset<T, CourseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Course that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseFindFirstArgs} args - Arguments to find a Course
     * @example
     * // Get one Course
     * const course = await prisma.course.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CourseFindFirstArgs>(args?: SelectSubset<T, CourseFindFirstArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Course that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseFindFirstOrThrowArgs} args - Arguments to find a Course
     * @example
     * // Get one Course
     * const course = await prisma.course.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CourseFindFirstOrThrowArgs>(args?: SelectSubset<T, CourseFindFirstOrThrowArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Courses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Courses
     * const courses = await prisma.course.findMany()
     * 
     * // Get first 10 Courses
     * const courses = await prisma.course.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const courseWithIdOnly = await prisma.course.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CourseFindManyArgs>(args?: SelectSubset<T, CourseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Course.
     * @param {CourseCreateArgs} args - Arguments to create a Course.
     * @example
     * // Create one Course
     * const Course = await prisma.course.create({
     *   data: {
     *     // ... data to create a Course
     *   }
     * })
     * 
     */
    create<T extends CourseCreateArgs>(args: SelectSubset<T, CourseCreateArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Courses.
     * @param {CourseCreateManyArgs} args - Arguments to create many Courses.
     * @example
     * // Create many Courses
     * const course = await prisma.course.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CourseCreateManyArgs>(args?: SelectSubset<T, CourseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Courses and returns the data saved in the database.
     * @param {CourseCreateManyAndReturnArgs} args - Arguments to create many Courses.
     * @example
     * // Create many Courses
     * const course = await prisma.course.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Courses and only return the `id`
     * const courseWithIdOnly = await prisma.course.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CourseCreateManyAndReturnArgs>(args?: SelectSubset<T, CourseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Course.
     * @param {CourseDeleteArgs} args - Arguments to delete one Course.
     * @example
     * // Delete one Course
     * const Course = await prisma.course.delete({
     *   where: {
     *     // ... filter to delete one Course
     *   }
     * })
     * 
     */
    delete<T extends CourseDeleteArgs>(args: SelectSubset<T, CourseDeleteArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Course.
     * @param {CourseUpdateArgs} args - Arguments to update one Course.
     * @example
     * // Update one Course
     * const course = await prisma.course.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CourseUpdateArgs>(args: SelectSubset<T, CourseUpdateArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Courses.
     * @param {CourseDeleteManyArgs} args - Arguments to filter Courses to delete.
     * @example
     * // Delete a few Courses
     * const { count } = await prisma.course.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CourseDeleteManyArgs>(args?: SelectSubset<T, CourseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Courses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Courses
     * const course = await prisma.course.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CourseUpdateManyArgs>(args: SelectSubset<T, CourseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Courses and returns the data updated in the database.
     * @param {CourseUpdateManyAndReturnArgs} args - Arguments to update many Courses.
     * @example
     * // Update many Courses
     * const course = await prisma.course.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Courses and only return the `id`
     * const courseWithIdOnly = await prisma.course.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CourseUpdateManyAndReturnArgs>(args: SelectSubset<T, CourseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Course.
     * @param {CourseUpsertArgs} args - Arguments to update or create a Course.
     * @example
     * // Update or create a Course
     * const course = await prisma.course.upsert({
     *   create: {
     *     // ... data to create a Course
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Course we want to update
     *   }
     * })
     */
    upsert<T extends CourseUpsertArgs>(args: SelectSubset<T, CourseUpsertArgs<ExtArgs>>): Prisma__CourseClient<$Result.GetResult<Prisma.$CoursePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Courses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseCountArgs} args - Arguments to filter Courses to count.
     * @example
     * // Count the number of Courses
     * const count = await prisma.course.count({
     *   where: {
     *     // ... the filter for the Courses we want to count
     *   }
     * })
    **/
    count<T extends CourseCountArgs>(
      args?: Subset<T, CourseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CourseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Course.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CourseAggregateArgs>(args: Subset<T, CourseAggregateArgs>): Prisma.PrismaPromise<GetCourseAggregateType<T>>

    /**
     * Group by Course.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CourseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CourseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CourseGroupByArgs['orderBy'] }
        : { orderBy?: CourseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CourseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCourseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Course model
   */
  readonly fields: CourseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Course.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CourseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Course model
   */
  interface CourseFieldRefs {
    readonly id: FieldRef<"Course", 'Int'>
    readonly userId: FieldRef<"Course", 'Int'>
    readonly experience: FieldRef<"Course", 'String'>
    readonly price: FieldRef<"Course", 'Int'>
    readonly courseLength: FieldRef<"Course", 'Int'>
    readonly description: FieldRef<"Course", 'String'>
    readonly phone: FieldRef<"Course", 'String'>
    readonly external: FieldRef<"Course", 'String[]'>
    readonly email: FieldRef<"Course", 'String'>
    readonly createdAt: FieldRef<"Course", 'DateTime'>
    readonly updatedAt: FieldRef<"Course", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Course findUnique
   */
  export type CourseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Course to fetch.
     */
    where: CourseWhereUniqueInput
  }

  /**
   * Course findUniqueOrThrow
   */
  export type CourseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Course to fetch.
     */
    where: CourseWhereUniqueInput
  }

  /**
   * Course findFirst
   */
  export type CourseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Course to fetch.
     */
    where?: CourseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Courses to fetch.
     */
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Courses.
     */
    cursor?: CourseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Courses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Courses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Courses.
     */
    distinct?: CourseScalarFieldEnum | CourseScalarFieldEnum[]
  }

  /**
   * Course findFirstOrThrow
   */
  export type CourseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Course to fetch.
     */
    where?: CourseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Courses to fetch.
     */
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Courses.
     */
    cursor?: CourseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Courses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Courses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Courses.
     */
    distinct?: CourseScalarFieldEnum | CourseScalarFieldEnum[]
  }

  /**
   * Course findMany
   */
  export type CourseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter, which Courses to fetch.
     */
    where?: CourseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Courses to fetch.
     */
    orderBy?: CourseOrderByWithRelationInput | CourseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Courses.
     */
    cursor?: CourseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Courses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Courses.
     */
    skip?: number
    distinct?: CourseScalarFieldEnum | CourseScalarFieldEnum[]
  }

  /**
   * Course create
   */
  export type CourseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * The data needed to create a Course.
     */
    data: XOR<CourseCreateInput, CourseUncheckedCreateInput>
  }

  /**
   * Course createMany
   */
  export type CourseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Courses.
     */
    data: CourseCreateManyInput | CourseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Course createManyAndReturn
   */
  export type CourseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * The data used to create many Courses.
     */
    data: CourseCreateManyInput | CourseCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Course update
   */
  export type CourseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * The data needed to update a Course.
     */
    data: XOR<CourseUpdateInput, CourseUncheckedUpdateInput>
    /**
     * Choose, which Course to update.
     */
    where: CourseWhereUniqueInput
  }

  /**
   * Course updateMany
   */
  export type CourseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Courses.
     */
    data: XOR<CourseUpdateManyMutationInput, CourseUncheckedUpdateManyInput>
    /**
     * Filter which Courses to update
     */
    where?: CourseWhereInput
    /**
     * Limit how many Courses to update.
     */
    limit?: number
  }

  /**
   * Course updateManyAndReturn
   */
  export type CourseUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * The data used to update Courses.
     */
    data: XOR<CourseUpdateManyMutationInput, CourseUncheckedUpdateManyInput>
    /**
     * Filter which Courses to update
     */
    where?: CourseWhereInput
    /**
     * Limit how many Courses to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Course upsert
   */
  export type CourseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * The filter to search for the Course to update in case it exists.
     */
    where: CourseWhereUniqueInput
    /**
     * In case the Course found by the `where` argument doesn't exist, create a new Course with this data.
     */
    create: XOR<CourseCreateInput, CourseUncheckedCreateInput>
    /**
     * In case the Course was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CourseUpdateInput, CourseUncheckedUpdateInput>
  }

  /**
   * Course delete
   */
  export type CourseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
    /**
     * Filter which Course to delete.
     */
    where: CourseWhereUniqueInput
  }

  /**
   * Course deleteMany
   */
  export type CourseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Courses to delete
     */
    where?: CourseWhereInput
    /**
     * Limit how many Courses to delete.
     */
    limit?: number
  }

  /**
   * Course without action
   */
  export type CourseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Course
     */
    select?: CourseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Course
     */
    omit?: CourseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CourseInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ProjectScalarFieldEnum: {
    id: 'id',
    name: 'name',
    fileUUID: 'fileUUID',
    createdAt: 'createdAt',
    userId: 'userId'
  };

  export type ProjectScalarFieldEnum = (typeof ProjectScalarFieldEnum)[keyof typeof ProjectScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    username: 'username',
    firstName: 'firstName',
    lastName: 'lastName',
    email: 'email',
    emailValidated: 'emailValidated',
    userColor: 'userColor',
    picture: 'picture',
    role: 'role',
    createdAt: 'createdAt',
    activeAt: 'activeAt',
    password: 'password',
    loginMethod: 'loginMethod',
    occupationType: 'occupationType'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const CodeScalarFieldEnum: {
    code: 'code',
    value: 'value',
    iat: 'iat',
    exp: 'exp'
  };

  export type CodeScalarFieldEnum = (typeof CodeScalarFieldEnum)[keyof typeof CodeScalarFieldEnum]


  export const RefreshTokenScalarFieldEnum: {
    code: 'code',
    hmac: 'hmac',
    iat: 'iat',
    exp: 'exp'
  };

  export type RefreshTokenScalarFieldEnum = (typeof RefreshTokenScalarFieldEnum)[keyof typeof RefreshTokenScalarFieldEnum]


  export const GuideScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    authorId: 'authorId',
    positiveRatings: 'positiveRatings',
    negativeRatings: 'negativeRatings',
    content: 'content',
    description: 'description',
    category: 'category',
    visits: 'visits'
  };

  export type GuideScalarFieldEnum = (typeof GuideScalarFieldEnum)[keyof typeof GuideScalarFieldEnum]


  export const TagScalarFieldEnum: {
    id: 'id',
    name: 'name'
  };

  export type TagScalarFieldEnum = (typeof TagScalarFieldEnum)[keyof typeof TagScalarFieldEnum]


  export const GuideTagScalarFieldEnum: {
    guideId: 'guideId',
    tagId: 'tagId'
  };

  export type GuideTagScalarFieldEnum = (typeof GuideTagScalarFieldEnum)[keyof typeof GuideTagScalarFieldEnum]


  export const ProblemScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    author: 'author',
    positiveRatings: 'positiveRatings',
    negativeRatings: 'negativeRatings',
    description: 'description',
    requirement: 'requirement',
    tests: 'tests',
    averageTimeLimit: 'averageTimeLimit',
    averageMemLimit: 'averageMemLimit',
    category: 'category',
    sourceCode: 'sourceCode',
    difficulty: 'difficulty',
    tags: 'tags'
  };

  export type ProblemScalarFieldEnum = (typeof ProblemScalarFieldEnum)[keyof typeof ProblemScalarFieldEnum]


  export const SolveScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    problemid: 'problemid',
    sourceCode: 'sourceCode',
    uploadedAt: 'uploadedAt',
    score: 'score',
    time: 'time'
  };

  export type SolveScalarFieldEnum = (typeof SolveScalarFieldEnum)[keyof typeof SolveScalarFieldEnum]


  export const CourseScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    experience: 'experience',
    price: 'price',
    courseLength: 'courseLength',
    description: 'description',
    phone: 'phone',
    external: 'external',
    email: 'email',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CourseScalarFieldEnum = (typeof CourseScalarFieldEnum)[keyof typeof CourseScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const ProjectOrderByRelevanceFieldEnum: {
    name: 'name',
    fileUUID: 'fileUUID'
  };

  export type ProjectOrderByRelevanceFieldEnum = (typeof ProjectOrderByRelevanceFieldEnum)[keyof typeof ProjectOrderByRelevanceFieldEnum]


  export const UserOrderByRelevanceFieldEnum: {
    username: 'username',
    firstName: 'firstName',
    lastName: 'lastName',
    email: 'email',
    userColor: 'userColor',
    picture: 'picture',
    password: 'password',
    loginMethod: 'loginMethod'
  };

  export type UserOrderByRelevanceFieldEnum = (typeof UserOrderByRelevanceFieldEnum)[keyof typeof UserOrderByRelevanceFieldEnum]


  export const CodeOrderByRelevanceFieldEnum: {
    code: 'code',
    value: 'value'
  };

  export type CodeOrderByRelevanceFieldEnum = (typeof CodeOrderByRelevanceFieldEnum)[keyof typeof CodeOrderByRelevanceFieldEnum]


  export const RefreshTokenOrderByRelevanceFieldEnum: {
    code: 'code',
    hmac: 'hmac'
  };

  export type RefreshTokenOrderByRelevanceFieldEnum = (typeof RefreshTokenOrderByRelevanceFieldEnum)[keyof typeof RefreshTokenOrderByRelevanceFieldEnum]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const GuideOrderByRelevanceFieldEnum: {
    name: 'name',
    content: 'content',
    description: 'description',
    category: 'category'
  };

  export type GuideOrderByRelevanceFieldEnum = (typeof GuideOrderByRelevanceFieldEnum)[keyof typeof GuideOrderByRelevanceFieldEnum]


  export const TagOrderByRelevanceFieldEnum: {
    name: 'name'
  };

  export type TagOrderByRelevanceFieldEnum = (typeof TagOrderByRelevanceFieldEnum)[keyof typeof TagOrderByRelevanceFieldEnum]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const ProblemOrderByRelevanceFieldEnum: {
    name: 'name',
    author: 'author',
    description: 'description',
    category: 'category',
    sourceCode: 'sourceCode',
    tags: 'tags'
  };

  export type ProblemOrderByRelevanceFieldEnum = (typeof ProblemOrderByRelevanceFieldEnum)[keyof typeof ProblemOrderByRelevanceFieldEnum]


  export const SolveOrderByRelevanceFieldEnum: {
    sourceCode: 'sourceCode'
  };

  export type SolveOrderByRelevanceFieldEnum = (typeof SolveOrderByRelevanceFieldEnum)[keyof typeof SolveOrderByRelevanceFieldEnum]


  export const CourseOrderByRelevanceFieldEnum: {
    experience: 'experience',
    description: 'description',
    phone: 'phone',
    external: 'external',
    email: 'email'
  };

  export type CourseOrderByRelevanceFieldEnum = (typeof CourseOrderByRelevanceFieldEnum)[keyof typeof CourseOrderByRelevanceFieldEnum]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'OccupationType'
   */
  export type EnumOccupationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OccupationType'>
    


  /**
   * Reference to a field of type 'OccupationType[]'
   */
  export type ListEnumOccupationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OccupationType[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Json[]'
   */
  export type ListJsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Difficulty'
   */
  export type EnumDifficultyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Difficulty'>
    


  /**
   * Reference to a field of type 'Difficulty[]'
   */
  export type ListEnumDifficultyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Difficulty[]'>
    
  /**
   * Deep Input Types
   */


  export type ProjectWhereInput = {
    AND?: ProjectWhereInput | ProjectWhereInput[]
    OR?: ProjectWhereInput[]
    NOT?: ProjectWhereInput | ProjectWhereInput[]
    id?: IntFilter<"Project"> | number
    name?: StringFilter<"Project"> | string
    fileUUID?: StringFilter<"Project"> | string
    createdAt?: DateTimeFilter<"Project"> | Date | string
    userId?: IntFilter<"Project"> | number
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type ProjectOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    fileUUID?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
    _relevance?: ProjectOrderByRelevanceInput
  }

  export type ProjectWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    fileUUID?: string
    AND?: ProjectWhereInput | ProjectWhereInput[]
    OR?: ProjectWhereInput[]
    NOT?: ProjectWhereInput | ProjectWhereInput[]
    name?: StringFilter<"Project"> | string
    createdAt?: DateTimeFilter<"Project"> | Date | string
    userId?: IntFilter<"Project"> | number
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "fileUUID">

  export type ProjectOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    fileUUID?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    _count?: ProjectCountOrderByAggregateInput
    _avg?: ProjectAvgOrderByAggregateInput
    _max?: ProjectMaxOrderByAggregateInput
    _min?: ProjectMinOrderByAggregateInput
    _sum?: ProjectSumOrderByAggregateInput
  }

  export type ProjectScalarWhereWithAggregatesInput = {
    AND?: ProjectScalarWhereWithAggregatesInput | ProjectScalarWhereWithAggregatesInput[]
    OR?: ProjectScalarWhereWithAggregatesInput[]
    NOT?: ProjectScalarWhereWithAggregatesInput | ProjectScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Project"> | number
    name?: StringWithAggregatesFilter<"Project"> | string
    fileUUID?: StringWithAggregatesFilter<"Project"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Project"> | Date | string
    userId?: IntWithAggregatesFilter<"Project"> | number
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    username?: StringFilter<"User"> | string
    firstName?: StringFilter<"User"> | string
    lastName?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    emailValidated?: BoolFilter<"User"> | boolean
    userColor?: StringFilter<"User"> | string
    picture?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    createdAt?: DateTimeFilter<"User"> | Date | string
    activeAt?: DateTimeFilter<"User"> | Date | string
    password?: StringFilter<"User"> | string
    loginMethod?: StringFilter<"User"> | string
    occupationType?: EnumOccupationTypeFilter<"User"> | $Enums.OccupationType
    projects?: ProjectListRelationFilter
    solves?: SolveListRelationFilter
    Guide?: GuideListRelationFilter
    Course?: XOR<CourseNullableScalarRelationFilter, CourseWhereInput> | null
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    username?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    emailValidated?: SortOrder
    userColor?: SortOrder
    picture?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    activeAt?: SortOrder
    password?: SortOrder
    loginMethod?: SortOrder
    occupationType?: SortOrder
    projects?: ProjectOrderByRelationAggregateInput
    solves?: SolveOrderByRelationAggregateInput
    Guide?: GuideOrderByRelationAggregateInput
    Course?: CourseOrderByWithRelationInput
    _relevance?: UserOrderByRelevanceInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    username?: StringFilter<"User"> | string
    firstName?: StringFilter<"User"> | string
    lastName?: StringFilter<"User"> | string
    emailValidated?: BoolFilter<"User"> | boolean
    userColor?: StringFilter<"User"> | string
    picture?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    createdAt?: DateTimeFilter<"User"> | Date | string
    activeAt?: DateTimeFilter<"User"> | Date | string
    password?: StringFilter<"User"> | string
    loginMethod?: StringFilter<"User"> | string
    occupationType?: EnumOccupationTypeFilter<"User"> | $Enums.OccupationType
    projects?: ProjectListRelationFilter
    solves?: SolveListRelationFilter
    Guide?: GuideListRelationFilter
    Course?: XOR<CourseNullableScalarRelationFilter, CourseWhereInput> | null
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    username?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    emailValidated?: SortOrder
    userColor?: SortOrder
    picture?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    activeAt?: SortOrder
    password?: SortOrder
    loginMethod?: SortOrder
    occupationType?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    username?: StringWithAggregatesFilter<"User"> | string
    firstName?: StringWithAggregatesFilter<"User"> | string
    lastName?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    emailValidated?: BoolWithAggregatesFilter<"User"> | boolean
    userColor?: StringWithAggregatesFilter<"User"> | string
    picture?: StringWithAggregatesFilter<"User"> | string
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    activeAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    password?: StringWithAggregatesFilter<"User"> | string
    loginMethod?: StringWithAggregatesFilter<"User"> | string
    occupationType?: EnumOccupationTypeWithAggregatesFilter<"User"> | $Enums.OccupationType
  }

  export type CodeWhereInput = {
    AND?: CodeWhereInput | CodeWhereInput[]
    OR?: CodeWhereInput[]
    NOT?: CodeWhereInput | CodeWhereInput[]
    code?: StringFilter<"Code"> | string
    value?: StringFilter<"Code"> | string
    iat?: DateTimeFilter<"Code"> | Date | string
    exp?: DateTimeFilter<"Code"> | Date | string
  }

  export type CodeOrderByWithRelationInput = {
    code?: SortOrder
    value?: SortOrder
    iat?: SortOrder
    exp?: SortOrder
    _relevance?: CodeOrderByRelevanceInput
  }

  export type CodeWhereUniqueInput = Prisma.AtLeast<{
    code?: string
    AND?: CodeWhereInput | CodeWhereInput[]
    OR?: CodeWhereInput[]
    NOT?: CodeWhereInput | CodeWhereInput[]
    value?: StringFilter<"Code"> | string
    iat?: DateTimeFilter<"Code"> | Date | string
    exp?: DateTimeFilter<"Code"> | Date | string
  }, "code" | "code">

  export type CodeOrderByWithAggregationInput = {
    code?: SortOrder
    value?: SortOrder
    iat?: SortOrder
    exp?: SortOrder
    _count?: CodeCountOrderByAggregateInput
    _max?: CodeMaxOrderByAggregateInput
    _min?: CodeMinOrderByAggregateInput
  }

  export type CodeScalarWhereWithAggregatesInput = {
    AND?: CodeScalarWhereWithAggregatesInput | CodeScalarWhereWithAggregatesInput[]
    OR?: CodeScalarWhereWithAggregatesInput[]
    NOT?: CodeScalarWhereWithAggregatesInput | CodeScalarWhereWithAggregatesInput[]
    code?: StringWithAggregatesFilter<"Code"> | string
    value?: StringWithAggregatesFilter<"Code"> | string
    iat?: DateTimeWithAggregatesFilter<"Code"> | Date | string
    exp?: DateTimeWithAggregatesFilter<"Code"> | Date | string
  }

  export type RefreshTokenWhereInput = {
    AND?: RefreshTokenWhereInput | RefreshTokenWhereInput[]
    OR?: RefreshTokenWhereInput[]
    NOT?: RefreshTokenWhereInput | RefreshTokenWhereInput[]
    code?: StringFilter<"RefreshToken"> | string
    hmac?: StringFilter<"RefreshToken"> | string
    iat?: DateTimeFilter<"RefreshToken"> | Date | string
    exp?: DateTimeFilter<"RefreshToken"> | Date | string
  }

  export type RefreshTokenOrderByWithRelationInput = {
    code?: SortOrder
    hmac?: SortOrder
    iat?: SortOrder
    exp?: SortOrder
    _relevance?: RefreshTokenOrderByRelevanceInput
  }

  export type RefreshTokenWhereUniqueInput = Prisma.AtLeast<{
    code?: string
    AND?: RefreshTokenWhereInput | RefreshTokenWhereInput[]
    OR?: RefreshTokenWhereInput[]
    NOT?: RefreshTokenWhereInput | RefreshTokenWhereInput[]
    hmac?: StringFilter<"RefreshToken"> | string
    iat?: DateTimeFilter<"RefreshToken"> | Date | string
    exp?: DateTimeFilter<"RefreshToken"> | Date | string
  }, "code" | "code">

  export type RefreshTokenOrderByWithAggregationInput = {
    code?: SortOrder
    hmac?: SortOrder
    iat?: SortOrder
    exp?: SortOrder
    _count?: RefreshTokenCountOrderByAggregateInput
    _max?: RefreshTokenMaxOrderByAggregateInput
    _min?: RefreshTokenMinOrderByAggregateInput
  }

  export type RefreshTokenScalarWhereWithAggregatesInput = {
    AND?: RefreshTokenScalarWhereWithAggregatesInput | RefreshTokenScalarWhereWithAggregatesInput[]
    OR?: RefreshTokenScalarWhereWithAggregatesInput[]
    NOT?: RefreshTokenScalarWhereWithAggregatesInput | RefreshTokenScalarWhereWithAggregatesInput[]
    code?: StringWithAggregatesFilter<"RefreshToken"> | string
    hmac?: StringWithAggregatesFilter<"RefreshToken"> | string
    iat?: DateTimeWithAggregatesFilter<"RefreshToken"> | Date | string
    exp?: DateTimeWithAggregatesFilter<"RefreshToken"> | Date | string
  }

  export type GuideWhereInput = {
    AND?: GuideWhereInput | GuideWhereInput[]
    OR?: GuideWhereInput[]
    NOT?: GuideWhereInput | GuideWhereInput[]
    id?: IntFilter<"Guide"> | number
    name?: StringFilter<"Guide"> | string
    createdAt?: DateTimeFilter<"Guide"> | Date | string
    updatedAt?: DateTimeFilter<"Guide"> | Date | string
    authorId?: IntFilter<"Guide"> | number
    positiveRatings?: IntFilter<"Guide"> | number
    negativeRatings?: IntFilter<"Guide"> | number
    content?: StringFilter<"Guide"> | string
    description?: StringNullableFilter<"Guide"> | string | null
    category?: StringNullableFilter<"Guide"> | string | null
    visits?: IntFilter<"Guide"> | number
    author?: XOR<UserScalarRelationFilter, UserWhereInput>
    guideTags?: GuideTagListRelationFilter
  }

  export type GuideOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    authorId?: SortOrder
    positiveRatings?: SortOrder
    negativeRatings?: SortOrder
    content?: SortOrder
    description?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    visits?: SortOrder
    author?: UserOrderByWithRelationInput
    guideTags?: GuideTagOrderByRelationAggregateInput
    _relevance?: GuideOrderByRelevanceInput
  }

  export type GuideWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name?: string
    AND?: GuideWhereInput | GuideWhereInput[]
    OR?: GuideWhereInput[]
    NOT?: GuideWhereInput | GuideWhereInput[]
    createdAt?: DateTimeFilter<"Guide"> | Date | string
    updatedAt?: DateTimeFilter<"Guide"> | Date | string
    authorId?: IntFilter<"Guide"> | number
    positiveRatings?: IntFilter<"Guide"> | number
    negativeRatings?: IntFilter<"Guide"> | number
    content?: StringFilter<"Guide"> | string
    description?: StringNullableFilter<"Guide"> | string | null
    category?: StringNullableFilter<"Guide"> | string | null
    visits?: IntFilter<"Guide"> | number
    author?: XOR<UserScalarRelationFilter, UserWhereInput>
    guideTags?: GuideTagListRelationFilter
  }, "id" | "name">

  export type GuideOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    authorId?: SortOrder
    positiveRatings?: SortOrder
    negativeRatings?: SortOrder
    content?: SortOrder
    description?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    visits?: SortOrder
    _count?: GuideCountOrderByAggregateInput
    _avg?: GuideAvgOrderByAggregateInput
    _max?: GuideMaxOrderByAggregateInput
    _min?: GuideMinOrderByAggregateInput
    _sum?: GuideSumOrderByAggregateInput
  }

  export type GuideScalarWhereWithAggregatesInput = {
    AND?: GuideScalarWhereWithAggregatesInput | GuideScalarWhereWithAggregatesInput[]
    OR?: GuideScalarWhereWithAggregatesInput[]
    NOT?: GuideScalarWhereWithAggregatesInput | GuideScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Guide"> | number
    name?: StringWithAggregatesFilter<"Guide"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Guide"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Guide"> | Date | string
    authorId?: IntWithAggregatesFilter<"Guide"> | number
    positiveRatings?: IntWithAggregatesFilter<"Guide"> | number
    negativeRatings?: IntWithAggregatesFilter<"Guide"> | number
    content?: StringWithAggregatesFilter<"Guide"> | string
    description?: StringNullableWithAggregatesFilter<"Guide"> | string | null
    category?: StringNullableWithAggregatesFilter<"Guide"> | string | null
    visits?: IntWithAggregatesFilter<"Guide"> | number
  }

  export type TagWhereInput = {
    AND?: TagWhereInput | TagWhereInput[]
    OR?: TagWhereInput[]
    NOT?: TagWhereInput | TagWhereInput[]
    id?: IntFilter<"Tag"> | number
    name?: StringFilter<"Tag"> | string
    guideTags?: GuideTagListRelationFilter
  }

  export type TagOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    guideTags?: GuideTagOrderByRelationAggregateInput
    _relevance?: TagOrderByRelevanceInput
  }

  export type TagWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name?: string
    AND?: TagWhereInput | TagWhereInput[]
    OR?: TagWhereInput[]
    NOT?: TagWhereInput | TagWhereInput[]
    guideTags?: GuideTagListRelationFilter
  }, "id" | "name">

  export type TagOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    _count?: TagCountOrderByAggregateInput
    _avg?: TagAvgOrderByAggregateInput
    _max?: TagMaxOrderByAggregateInput
    _min?: TagMinOrderByAggregateInput
    _sum?: TagSumOrderByAggregateInput
  }

  export type TagScalarWhereWithAggregatesInput = {
    AND?: TagScalarWhereWithAggregatesInput | TagScalarWhereWithAggregatesInput[]
    OR?: TagScalarWhereWithAggregatesInput[]
    NOT?: TagScalarWhereWithAggregatesInput | TagScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Tag"> | number
    name?: StringWithAggregatesFilter<"Tag"> | string
  }

  export type GuideTagWhereInput = {
    AND?: GuideTagWhereInput | GuideTagWhereInput[]
    OR?: GuideTagWhereInput[]
    NOT?: GuideTagWhereInput | GuideTagWhereInput[]
    guideId?: IntFilter<"GuideTag"> | number
    tagId?: IntFilter<"GuideTag"> | number
    guide?: XOR<GuideScalarRelationFilter, GuideWhereInput>
    tag?: XOR<TagScalarRelationFilter, TagWhereInput>
  }

  export type GuideTagOrderByWithRelationInput = {
    guideId?: SortOrder
    tagId?: SortOrder
    guide?: GuideOrderByWithRelationInput
    tag?: TagOrderByWithRelationInput
  }

  export type GuideTagWhereUniqueInput = Prisma.AtLeast<{
    guideId_tagId?: GuideTagGuideIdTagIdCompoundUniqueInput
    AND?: GuideTagWhereInput | GuideTagWhereInput[]
    OR?: GuideTagWhereInput[]
    NOT?: GuideTagWhereInput | GuideTagWhereInput[]
    guideId?: IntFilter<"GuideTag"> | number
    tagId?: IntFilter<"GuideTag"> | number
    guide?: XOR<GuideScalarRelationFilter, GuideWhereInput>
    tag?: XOR<TagScalarRelationFilter, TagWhereInput>
  }, "guideId_tagId">

  export type GuideTagOrderByWithAggregationInput = {
    guideId?: SortOrder
    tagId?: SortOrder
    _count?: GuideTagCountOrderByAggregateInput
    _avg?: GuideTagAvgOrderByAggregateInput
    _max?: GuideTagMaxOrderByAggregateInput
    _min?: GuideTagMinOrderByAggregateInput
    _sum?: GuideTagSumOrderByAggregateInput
  }

  export type GuideTagScalarWhereWithAggregatesInput = {
    AND?: GuideTagScalarWhereWithAggregatesInput | GuideTagScalarWhereWithAggregatesInput[]
    OR?: GuideTagScalarWhereWithAggregatesInput[]
    NOT?: GuideTagScalarWhereWithAggregatesInput | GuideTagScalarWhereWithAggregatesInput[]
    guideId?: IntWithAggregatesFilter<"GuideTag"> | number
    tagId?: IntWithAggregatesFilter<"GuideTag"> | number
  }

  export type ProblemWhereInput = {
    AND?: ProblemWhereInput | ProblemWhereInput[]
    OR?: ProblemWhereInput[]
    NOT?: ProblemWhereInput | ProblemWhereInput[]
    id?: IntFilter<"Problem"> | number
    name?: StringFilter<"Problem"> | string
    createdAt?: DateTimeFilter<"Problem"> | Date | string
    updatedAt?: DateTimeFilter<"Problem"> | Date | string
    author?: StringFilter<"Problem"> | string
    positiveRatings?: IntFilter<"Problem"> | number
    negativeRatings?: IntFilter<"Problem"> | number
    description?: StringNullableFilter<"Problem"> | string | null
    requirement?: JsonNullableFilter<"Problem">
    tests?: JsonNullableListFilter<"Problem">
    averageTimeLimit?: FloatFilter<"Problem"> | number
    averageMemLimit?: FloatFilter<"Problem"> | number
    category?: StringNullableFilter<"Problem"> | string | null
    sourceCode?: StringNullableFilter<"Problem"> | string | null
    difficulty?: EnumDifficultyNullableFilter<"Problem"> | $Enums.Difficulty | null
    tags?: StringNullableListFilter<"Problem">
    solves?: SolveListRelationFilter
  }

  export type ProblemOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    author?: SortOrder
    positiveRatings?: SortOrder
    negativeRatings?: SortOrder
    description?: SortOrderInput | SortOrder
    requirement?: SortOrderInput | SortOrder
    tests?: SortOrder
    averageTimeLimit?: SortOrder
    averageMemLimit?: SortOrder
    category?: SortOrderInput | SortOrder
    sourceCode?: SortOrderInput | SortOrder
    difficulty?: SortOrderInput | SortOrder
    tags?: SortOrder
    solves?: SolveOrderByRelationAggregateInput
    _relevance?: ProblemOrderByRelevanceInput
  }

  export type ProblemWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: ProblemWhereInput | ProblemWhereInput[]
    OR?: ProblemWhereInput[]
    NOT?: ProblemWhereInput | ProblemWhereInput[]
    name?: StringFilter<"Problem"> | string
    createdAt?: DateTimeFilter<"Problem"> | Date | string
    updatedAt?: DateTimeFilter<"Problem"> | Date | string
    author?: StringFilter<"Problem"> | string
    positiveRatings?: IntFilter<"Problem"> | number
    negativeRatings?: IntFilter<"Problem"> | number
    description?: StringNullableFilter<"Problem"> | string | null
    requirement?: JsonNullableFilter<"Problem">
    tests?: JsonNullableListFilter<"Problem">
    averageTimeLimit?: FloatFilter<"Problem"> | number
    averageMemLimit?: FloatFilter<"Problem"> | number
    category?: StringNullableFilter<"Problem"> | string | null
    sourceCode?: StringNullableFilter<"Problem"> | string | null
    difficulty?: EnumDifficultyNullableFilter<"Problem"> | $Enums.Difficulty | null
    tags?: StringNullableListFilter<"Problem">
    solves?: SolveListRelationFilter
  }, "id">

  export type ProblemOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    author?: SortOrder
    positiveRatings?: SortOrder
    negativeRatings?: SortOrder
    description?: SortOrderInput | SortOrder
    requirement?: SortOrderInput | SortOrder
    tests?: SortOrder
    averageTimeLimit?: SortOrder
    averageMemLimit?: SortOrder
    category?: SortOrderInput | SortOrder
    sourceCode?: SortOrderInput | SortOrder
    difficulty?: SortOrderInput | SortOrder
    tags?: SortOrder
    _count?: ProblemCountOrderByAggregateInput
    _avg?: ProblemAvgOrderByAggregateInput
    _max?: ProblemMaxOrderByAggregateInput
    _min?: ProblemMinOrderByAggregateInput
    _sum?: ProblemSumOrderByAggregateInput
  }

  export type ProblemScalarWhereWithAggregatesInput = {
    AND?: ProblemScalarWhereWithAggregatesInput | ProblemScalarWhereWithAggregatesInput[]
    OR?: ProblemScalarWhereWithAggregatesInput[]
    NOT?: ProblemScalarWhereWithAggregatesInput | ProblemScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Problem"> | number
    name?: StringWithAggregatesFilter<"Problem"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Problem"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Problem"> | Date | string
    author?: StringWithAggregatesFilter<"Problem"> | string
    positiveRatings?: IntWithAggregatesFilter<"Problem"> | number
    negativeRatings?: IntWithAggregatesFilter<"Problem"> | number
    description?: StringNullableWithAggregatesFilter<"Problem"> | string | null
    requirement?: JsonNullableWithAggregatesFilter<"Problem">
    tests?: JsonNullableListFilter<"Problem">
    averageTimeLimit?: FloatWithAggregatesFilter<"Problem"> | number
    averageMemLimit?: FloatWithAggregatesFilter<"Problem"> | number
    category?: StringNullableWithAggregatesFilter<"Problem"> | string | null
    sourceCode?: StringNullableWithAggregatesFilter<"Problem"> | string | null
    difficulty?: EnumDifficultyNullableWithAggregatesFilter<"Problem"> | $Enums.Difficulty | null
    tags?: StringNullableListFilter<"Problem">
  }

  export type SolveWhereInput = {
    AND?: SolveWhereInput | SolveWhereInput[]
    OR?: SolveWhereInput[]
    NOT?: SolveWhereInput | SolveWhereInput[]
    id?: IntFilter<"Solve"> | number
    userId?: IntFilter<"Solve"> | number
    problemid?: IntFilter<"Solve"> | number
    sourceCode?: StringFilter<"Solve"> | string
    uploadedAt?: DateTimeFilter<"Solve"> | Date | string
    score?: IntFilter<"Solve"> | number
    time?: IntFilter<"Solve"> | number
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    problem?: XOR<ProblemScalarRelationFilter, ProblemWhereInput>
  }

  export type SolveOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    problemid?: SortOrder
    sourceCode?: SortOrder
    uploadedAt?: SortOrder
    score?: SortOrder
    time?: SortOrder
    user?: UserOrderByWithRelationInput
    problem?: ProblemOrderByWithRelationInput
    _relevance?: SolveOrderByRelevanceInput
  }

  export type SolveWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: SolveWhereInput | SolveWhereInput[]
    OR?: SolveWhereInput[]
    NOT?: SolveWhereInput | SolveWhereInput[]
    userId?: IntFilter<"Solve"> | number
    problemid?: IntFilter<"Solve"> | number
    sourceCode?: StringFilter<"Solve"> | string
    uploadedAt?: DateTimeFilter<"Solve"> | Date | string
    score?: IntFilter<"Solve"> | number
    time?: IntFilter<"Solve"> | number
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    problem?: XOR<ProblemScalarRelationFilter, ProblemWhereInput>
  }, "id">

  export type SolveOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    problemid?: SortOrder
    sourceCode?: SortOrder
    uploadedAt?: SortOrder
    score?: SortOrder
    time?: SortOrder
    _count?: SolveCountOrderByAggregateInput
    _avg?: SolveAvgOrderByAggregateInput
    _max?: SolveMaxOrderByAggregateInput
    _min?: SolveMinOrderByAggregateInput
    _sum?: SolveSumOrderByAggregateInput
  }

  export type SolveScalarWhereWithAggregatesInput = {
    AND?: SolveScalarWhereWithAggregatesInput | SolveScalarWhereWithAggregatesInput[]
    OR?: SolveScalarWhereWithAggregatesInput[]
    NOT?: SolveScalarWhereWithAggregatesInput | SolveScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Solve"> | number
    userId?: IntWithAggregatesFilter<"Solve"> | number
    problemid?: IntWithAggregatesFilter<"Solve"> | number
    sourceCode?: StringWithAggregatesFilter<"Solve"> | string
    uploadedAt?: DateTimeWithAggregatesFilter<"Solve"> | Date | string
    score?: IntWithAggregatesFilter<"Solve"> | number
    time?: IntWithAggregatesFilter<"Solve"> | number
  }

  export type CourseWhereInput = {
    AND?: CourseWhereInput | CourseWhereInput[]
    OR?: CourseWhereInput[]
    NOT?: CourseWhereInput | CourseWhereInput[]
    id?: IntFilter<"Course"> | number
    userId?: IntFilter<"Course"> | number
    experience?: StringFilter<"Course"> | string
    price?: IntFilter<"Course"> | number
    courseLength?: IntFilter<"Course"> | number
    description?: StringFilter<"Course"> | string
    phone?: StringNullableFilter<"Course"> | string | null
    external?: StringNullableListFilter<"Course">
    email?: StringNullableFilter<"Course"> | string | null
    createdAt?: DateTimeFilter<"Course"> | Date | string
    updatedAt?: DateTimeFilter<"Course"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type CourseOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    experience?: SortOrder
    price?: SortOrder
    courseLength?: SortOrder
    description?: SortOrder
    phone?: SortOrderInput | SortOrder
    external?: SortOrder
    email?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    _relevance?: CourseOrderByRelevanceInput
  }

  export type CourseWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    userId?: number
    AND?: CourseWhereInput | CourseWhereInput[]
    OR?: CourseWhereInput[]
    NOT?: CourseWhereInput | CourseWhereInput[]
    experience?: StringFilter<"Course"> | string
    price?: IntFilter<"Course"> | number
    courseLength?: IntFilter<"Course"> | number
    description?: StringFilter<"Course"> | string
    phone?: StringNullableFilter<"Course"> | string | null
    external?: StringNullableListFilter<"Course">
    email?: StringNullableFilter<"Course"> | string | null
    createdAt?: DateTimeFilter<"Course"> | Date | string
    updatedAt?: DateTimeFilter<"Course"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type CourseOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    experience?: SortOrder
    price?: SortOrder
    courseLength?: SortOrder
    description?: SortOrder
    phone?: SortOrderInput | SortOrder
    external?: SortOrder
    email?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CourseCountOrderByAggregateInput
    _avg?: CourseAvgOrderByAggregateInput
    _max?: CourseMaxOrderByAggregateInput
    _min?: CourseMinOrderByAggregateInput
    _sum?: CourseSumOrderByAggregateInput
  }

  export type CourseScalarWhereWithAggregatesInput = {
    AND?: CourseScalarWhereWithAggregatesInput | CourseScalarWhereWithAggregatesInput[]
    OR?: CourseScalarWhereWithAggregatesInput[]
    NOT?: CourseScalarWhereWithAggregatesInput | CourseScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Course"> | number
    userId?: IntWithAggregatesFilter<"Course"> | number
    experience?: StringWithAggregatesFilter<"Course"> | string
    price?: IntWithAggregatesFilter<"Course"> | number
    courseLength?: IntWithAggregatesFilter<"Course"> | number
    description?: StringWithAggregatesFilter<"Course"> | string
    phone?: StringNullableWithAggregatesFilter<"Course"> | string | null
    external?: StringNullableListFilter<"Course">
    email?: StringNullableWithAggregatesFilter<"Course"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Course"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Course"> | Date | string
  }

  export type ProjectCreateInput = {
    name: string
    fileUUID: string
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutProjectsInput
  }

  export type ProjectUncheckedCreateInput = {
    id?: number
    name: string
    fileUUID: string
    createdAt?: Date | string
    userId: number
  }

  export type ProjectUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    fileUUID?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutProjectsNestedInput
  }

  export type ProjectUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    fileUUID?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
  }

  export type ProjectCreateManyInput = {
    id?: number
    name: string
    fileUUID: string
    createdAt?: Date | string
    userId: number
  }

  export type ProjectUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    fileUUID?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProjectUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    fileUUID?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
  }

  export type UserCreateInput = {
    username: string
    firstName: string
    lastName: string
    email: string
    emailValidated?: boolean
    userColor?: string
    picture?: string
    role?: $Enums.Role
    createdAt?: Date | string
    activeAt?: Date | string
    password: string
    loginMethod?: string
    occupationType?: $Enums.OccupationType
    projects?: ProjectCreateNestedManyWithoutUserInput
    solves?: SolveCreateNestedManyWithoutUserInput
    Guide?: GuideCreateNestedManyWithoutAuthorInput
    Course?: CourseCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: number
    username: string
    firstName: string
    lastName: string
    email: string
    emailValidated?: boolean
    userColor?: string
    picture?: string
    role?: $Enums.Role
    createdAt?: Date | string
    activeAt?: Date | string
    password: string
    loginMethod?: string
    occupationType?: $Enums.OccupationType
    projects?: ProjectUncheckedCreateNestedManyWithoutUserInput
    solves?: SolveUncheckedCreateNestedManyWithoutUserInput
    Guide?: GuideUncheckedCreateNestedManyWithoutAuthorInput
    Course?: CourseUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserUpdateInput = {
    username?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailValidated?: BoolFieldUpdateOperationsInput | boolean
    userColor?: StringFieldUpdateOperationsInput | string
    picture?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeAt?: DateTimeFieldUpdateOperationsInput | Date | string
    password?: StringFieldUpdateOperationsInput | string
    loginMethod?: StringFieldUpdateOperationsInput | string
    occupationType?: EnumOccupationTypeFieldUpdateOperationsInput | $Enums.OccupationType
    projects?: ProjectUpdateManyWithoutUserNestedInput
    solves?: SolveUpdateManyWithoutUserNestedInput
    Guide?: GuideUpdateManyWithoutAuthorNestedInput
    Course?: CourseUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailValidated?: BoolFieldUpdateOperationsInput | boolean
    userColor?: StringFieldUpdateOperationsInput | string
    picture?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeAt?: DateTimeFieldUpdateOperationsInput | Date | string
    password?: StringFieldUpdateOperationsInput | string
    loginMethod?: StringFieldUpdateOperationsInput | string
    occupationType?: EnumOccupationTypeFieldUpdateOperationsInput | $Enums.OccupationType
    projects?: ProjectUncheckedUpdateManyWithoutUserNestedInput
    solves?: SolveUncheckedUpdateManyWithoutUserNestedInput
    Guide?: GuideUncheckedUpdateManyWithoutAuthorNestedInput
    Course?: CourseUncheckedUpdateOneWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: number
    username: string
    firstName: string
    lastName: string
    email: string
    emailValidated?: boolean
    userColor?: string
    picture?: string
    role?: $Enums.Role
    createdAt?: Date | string
    activeAt?: Date | string
    password: string
    loginMethod?: string
    occupationType?: $Enums.OccupationType
  }

  export type UserUpdateManyMutationInput = {
    username?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailValidated?: BoolFieldUpdateOperationsInput | boolean
    userColor?: StringFieldUpdateOperationsInput | string
    picture?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeAt?: DateTimeFieldUpdateOperationsInput | Date | string
    password?: StringFieldUpdateOperationsInput | string
    loginMethod?: StringFieldUpdateOperationsInput | string
    occupationType?: EnumOccupationTypeFieldUpdateOperationsInput | $Enums.OccupationType
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailValidated?: BoolFieldUpdateOperationsInput | boolean
    userColor?: StringFieldUpdateOperationsInput | string
    picture?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeAt?: DateTimeFieldUpdateOperationsInput | Date | string
    password?: StringFieldUpdateOperationsInput | string
    loginMethod?: StringFieldUpdateOperationsInput | string
    occupationType?: EnumOccupationTypeFieldUpdateOperationsInput | $Enums.OccupationType
  }

  export type CodeCreateInput = {
    code: string
    value: string
    iat?: Date | string
    exp?: Date | string
  }

  export type CodeUncheckedCreateInput = {
    code: string
    value: string
    iat?: Date | string
    exp?: Date | string
  }

  export type CodeUpdateInput = {
    code?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    iat?: DateTimeFieldUpdateOperationsInput | Date | string
    exp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodeUncheckedUpdateInput = {
    code?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    iat?: DateTimeFieldUpdateOperationsInput | Date | string
    exp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodeCreateManyInput = {
    code: string
    value: string
    iat?: Date | string
    exp?: Date | string
  }

  export type CodeUpdateManyMutationInput = {
    code?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    iat?: DateTimeFieldUpdateOperationsInput | Date | string
    exp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodeUncheckedUpdateManyInput = {
    code?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    iat?: DateTimeFieldUpdateOperationsInput | Date | string
    exp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefreshTokenCreateInput = {
    code: string
    hmac: string
    iat?: Date | string
    exp?: Date | string
  }

  export type RefreshTokenUncheckedCreateInput = {
    code: string
    hmac: string
    iat?: Date | string
    exp?: Date | string
  }

  export type RefreshTokenUpdateInput = {
    code?: StringFieldUpdateOperationsInput | string
    hmac?: StringFieldUpdateOperationsInput | string
    iat?: DateTimeFieldUpdateOperationsInput | Date | string
    exp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefreshTokenUncheckedUpdateInput = {
    code?: StringFieldUpdateOperationsInput | string
    hmac?: StringFieldUpdateOperationsInput | string
    iat?: DateTimeFieldUpdateOperationsInput | Date | string
    exp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefreshTokenCreateManyInput = {
    code: string
    hmac: string
    iat?: Date | string
    exp?: Date | string
  }

  export type RefreshTokenUpdateManyMutationInput = {
    code?: StringFieldUpdateOperationsInput | string
    hmac?: StringFieldUpdateOperationsInput | string
    iat?: DateTimeFieldUpdateOperationsInput | Date | string
    exp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefreshTokenUncheckedUpdateManyInput = {
    code?: StringFieldUpdateOperationsInput | string
    hmac?: StringFieldUpdateOperationsInput | string
    iat?: DateTimeFieldUpdateOperationsInput | Date | string
    exp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuideCreateInput = {
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    positiveRatings?: number
    negativeRatings?: number
    content: string
    description?: string | null
    category?: string | null
    visits?: number
    author?: UserCreateNestedOneWithoutGuideInput
    guideTags?: GuideTagCreateNestedManyWithoutGuideInput
  }

  export type GuideUncheckedCreateInput = {
    id?: number
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    authorId?: number
    positiveRatings?: number
    negativeRatings?: number
    content: string
    description?: string | null
    category?: string | null
    visits?: number
    guideTags?: GuideTagUncheckedCreateNestedManyWithoutGuideInput
  }

  export type GuideUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    positiveRatings?: IntFieldUpdateOperationsInput | number
    negativeRatings?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    visits?: IntFieldUpdateOperationsInput | number
    author?: UserUpdateOneRequiredWithoutGuideNestedInput
    guideTags?: GuideTagUpdateManyWithoutGuideNestedInput
  }

  export type GuideUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    authorId?: IntFieldUpdateOperationsInput | number
    positiveRatings?: IntFieldUpdateOperationsInput | number
    negativeRatings?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    visits?: IntFieldUpdateOperationsInput | number
    guideTags?: GuideTagUncheckedUpdateManyWithoutGuideNestedInput
  }

  export type GuideCreateManyInput = {
    id?: number
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    authorId?: number
    positiveRatings?: number
    negativeRatings?: number
    content: string
    description?: string | null
    category?: string | null
    visits?: number
  }

  export type GuideUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    positiveRatings?: IntFieldUpdateOperationsInput | number
    negativeRatings?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    visits?: IntFieldUpdateOperationsInput | number
  }

  export type GuideUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    authorId?: IntFieldUpdateOperationsInput | number
    positiveRatings?: IntFieldUpdateOperationsInput | number
    negativeRatings?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    visits?: IntFieldUpdateOperationsInput | number
  }

  export type TagCreateInput = {
    name: string
    guideTags?: GuideTagCreateNestedManyWithoutTagInput
  }

  export type TagUncheckedCreateInput = {
    id?: number
    name: string
    guideTags?: GuideTagUncheckedCreateNestedManyWithoutTagInput
  }

  export type TagUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    guideTags?: GuideTagUpdateManyWithoutTagNestedInput
  }

  export type TagUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    guideTags?: GuideTagUncheckedUpdateManyWithoutTagNestedInput
  }

  export type TagCreateManyInput = {
    id?: number
    name: string
  }

  export type TagUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
  }

  export type TagUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
  }

  export type GuideTagCreateInput = {
    guide: GuideCreateNestedOneWithoutGuideTagsInput
    tag: TagCreateNestedOneWithoutGuideTagsInput
  }

  export type GuideTagUncheckedCreateInput = {
    guideId: number
    tagId: number
  }

  export type GuideTagUpdateInput = {
    guide?: GuideUpdateOneRequiredWithoutGuideTagsNestedInput
    tag?: TagUpdateOneRequiredWithoutGuideTagsNestedInput
  }

  export type GuideTagUncheckedUpdateInput = {
    guideId?: IntFieldUpdateOperationsInput | number
    tagId?: IntFieldUpdateOperationsInput | number
  }

  export type GuideTagCreateManyInput = {
    guideId: number
    tagId: number
  }

  export type GuideTagUpdateManyMutationInput = {

  }

  export type GuideTagUncheckedUpdateManyInput = {
    guideId?: IntFieldUpdateOperationsInput | number
    tagId?: IntFieldUpdateOperationsInput | number
  }

  export type ProblemCreateInput = {
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    author?: string
    positiveRatings?: number
    negativeRatings?: number
    description?: string | null
    requirement?: NullableJsonNullValueInput | InputJsonValue
    tests?: ProblemCreatetestsInput | InputJsonValue[]
    averageTimeLimit: number
    averageMemLimit: number
    category?: string | null
    sourceCode?: string | null
    difficulty?: $Enums.Difficulty | null
    tags?: ProblemCreatetagsInput | string[]
    solves?: SolveCreateNestedManyWithoutProblemInput
  }

  export type ProblemUncheckedCreateInput = {
    id?: number
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    author?: string
    positiveRatings?: number
    negativeRatings?: number
    description?: string | null
    requirement?: NullableJsonNullValueInput | InputJsonValue
    tests?: ProblemCreatetestsInput | InputJsonValue[]
    averageTimeLimit: number
    averageMemLimit: number
    category?: string | null
    sourceCode?: string | null
    difficulty?: $Enums.Difficulty | null
    tags?: ProblemCreatetagsInput | string[]
    solves?: SolveUncheckedCreateNestedManyWithoutProblemInput
  }

  export type ProblemUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    author?: StringFieldUpdateOperationsInput | string
    positiveRatings?: IntFieldUpdateOperationsInput | number
    negativeRatings?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    requirement?: NullableJsonNullValueInput | InputJsonValue
    tests?: ProblemUpdatetestsInput | InputJsonValue[]
    averageTimeLimit?: FloatFieldUpdateOperationsInput | number
    averageMemLimit?: FloatFieldUpdateOperationsInput | number
    category?: NullableStringFieldUpdateOperationsInput | string | null
    sourceCode?: NullableStringFieldUpdateOperationsInput | string | null
    difficulty?: NullableEnumDifficultyFieldUpdateOperationsInput | $Enums.Difficulty | null
    tags?: ProblemUpdatetagsInput | string[]
    solves?: SolveUpdateManyWithoutProblemNestedInput
  }

  export type ProblemUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    author?: StringFieldUpdateOperationsInput | string
    positiveRatings?: IntFieldUpdateOperationsInput | number
    negativeRatings?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    requirement?: NullableJsonNullValueInput | InputJsonValue
    tests?: ProblemUpdatetestsInput | InputJsonValue[]
    averageTimeLimit?: FloatFieldUpdateOperationsInput | number
    averageMemLimit?: FloatFieldUpdateOperationsInput | number
    category?: NullableStringFieldUpdateOperationsInput | string | null
    sourceCode?: NullableStringFieldUpdateOperationsInput | string | null
    difficulty?: NullableEnumDifficultyFieldUpdateOperationsInput | $Enums.Difficulty | null
    tags?: ProblemUpdatetagsInput | string[]
    solves?: SolveUncheckedUpdateManyWithoutProblemNestedInput
  }

  export type ProblemCreateManyInput = {
    id?: number
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    author?: string
    positiveRatings?: number
    negativeRatings?: number
    description?: string | null
    requirement?: NullableJsonNullValueInput | InputJsonValue
    tests?: ProblemCreatetestsInput | InputJsonValue[]
    averageTimeLimit: number
    averageMemLimit: number
    category?: string | null
    sourceCode?: string | null
    difficulty?: $Enums.Difficulty | null
    tags?: ProblemCreatetagsInput | string[]
  }

  export type ProblemUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    author?: StringFieldUpdateOperationsInput | string
    positiveRatings?: IntFieldUpdateOperationsInput | number
    negativeRatings?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    requirement?: NullableJsonNullValueInput | InputJsonValue
    tests?: ProblemUpdatetestsInput | InputJsonValue[]
    averageTimeLimit?: FloatFieldUpdateOperationsInput | number
    averageMemLimit?: FloatFieldUpdateOperationsInput | number
    category?: NullableStringFieldUpdateOperationsInput | string | null
    sourceCode?: NullableStringFieldUpdateOperationsInput | string | null
    difficulty?: NullableEnumDifficultyFieldUpdateOperationsInput | $Enums.Difficulty | null
    tags?: ProblemUpdatetagsInput | string[]
  }

  export type ProblemUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    author?: StringFieldUpdateOperationsInput | string
    positiveRatings?: IntFieldUpdateOperationsInput | number
    negativeRatings?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    requirement?: NullableJsonNullValueInput | InputJsonValue
    tests?: ProblemUpdatetestsInput | InputJsonValue[]
    averageTimeLimit?: FloatFieldUpdateOperationsInput | number
    averageMemLimit?: FloatFieldUpdateOperationsInput | number
    category?: NullableStringFieldUpdateOperationsInput | string | null
    sourceCode?: NullableStringFieldUpdateOperationsInput | string | null
    difficulty?: NullableEnumDifficultyFieldUpdateOperationsInput | $Enums.Difficulty | null
    tags?: ProblemUpdatetagsInput | string[]
  }

  export type SolveCreateInput = {
    sourceCode: string
    uploadedAt?: Date | string
    score: number
    time?: number
    user: UserCreateNestedOneWithoutSolvesInput
    problem: ProblemCreateNestedOneWithoutSolvesInput
  }

  export type SolveUncheckedCreateInput = {
    id?: number
    userId: number
    problemid: number
    sourceCode: string
    uploadedAt?: Date | string
    score: number
    time?: number
  }

  export type SolveUpdateInput = {
    sourceCode?: StringFieldUpdateOperationsInput | string
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    score?: IntFieldUpdateOperationsInput | number
    time?: IntFieldUpdateOperationsInput | number
    user?: UserUpdateOneRequiredWithoutSolvesNestedInput
    problem?: ProblemUpdateOneRequiredWithoutSolvesNestedInput
  }

  export type SolveUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    problemid?: IntFieldUpdateOperationsInput | number
    sourceCode?: StringFieldUpdateOperationsInput | string
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    score?: IntFieldUpdateOperationsInput | number
    time?: IntFieldUpdateOperationsInput | number
  }

  export type SolveCreateManyInput = {
    id?: number
    userId: number
    problemid: number
    sourceCode: string
    uploadedAt?: Date | string
    score: number
    time?: number
  }

  export type SolveUpdateManyMutationInput = {
    sourceCode?: StringFieldUpdateOperationsInput | string
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    score?: IntFieldUpdateOperationsInput | number
    time?: IntFieldUpdateOperationsInput | number
  }

  export type SolveUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    problemid?: IntFieldUpdateOperationsInput | number
    sourceCode?: StringFieldUpdateOperationsInput | string
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    score?: IntFieldUpdateOperationsInput | number
    time?: IntFieldUpdateOperationsInput | number
  }

  export type CourseCreateInput = {
    experience: string
    price: number
    courseLength: number
    description: string
    phone?: string | null
    external?: CourseCreateexternalInput | string[]
    email?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutCourseInput
  }

  export type CourseUncheckedCreateInput = {
    id?: number
    userId: number
    experience: string
    price: number
    courseLength: number
    description: string
    phone?: string | null
    external?: CourseCreateexternalInput | string[]
    email?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CourseUpdateInput = {
    experience?: StringFieldUpdateOperationsInput | string
    price?: IntFieldUpdateOperationsInput | number
    courseLength?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    external?: CourseUpdateexternalInput | string[]
    email?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutCourseNestedInput
  }

  export type CourseUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    experience?: StringFieldUpdateOperationsInput | string
    price?: IntFieldUpdateOperationsInput | number
    courseLength?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    external?: CourseUpdateexternalInput | string[]
    email?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseCreateManyInput = {
    id?: number
    userId: number
    experience: string
    price: number
    courseLength: number
    description: string
    phone?: string | null
    external?: CourseCreateexternalInput | string[]
    email?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CourseUpdateManyMutationInput = {
    experience?: StringFieldUpdateOperationsInput | string
    price?: IntFieldUpdateOperationsInput | number
    courseLength?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    external?: CourseUpdateexternalInput | string[]
    email?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    experience?: StringFieldUpdateOperationsInput | string
    price?: IntFieldUpdateOperationsInput | number
    courseLength?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    external?: CourseUpdateexternalInput | string[]
    email?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type ProjectOrderByRelevanceInput = {
    fields: ProjectOrderByRelevanceFieldEnum | ProjectOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ProjectCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    fileUUID?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
  }

  export type ProjectAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type ProjectMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    fileUUID?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
  }

  export type ProjectMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    fileUUID?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
  }

  export type ProjectSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type EnumOccupationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.OccupationType | EnumOccupationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.OccupationType[] | ListEnumOccupationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OccupationType[] | ListEnumOccupationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumOccupationTypeFilter<$PrismaModel> | $Enums.OccupationType
  }

  export type ProjectListRelationFilter = {
    every?: ProjectWhereInput
    some?: ProjectWhereInput
    none?: ProjectWhereInput
  }

  export type SolveListRelationFilter = {
    every?: SolveWhereInput
    some?: SolveWhereInput
    none?: SolveWhereInput
  }

  export type GuideListRelationFilter = {
    every?: GuideWhereInput
    some?: GuideWhereInput
    none?: GuideWhereInput
  }

  export type CourseNullableScalarRelationFilter = {
    is?: CourseWhereInput | null
    isNot?: CourseWhereInput | null
  }

  export type ProjectOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SolveOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GuideOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserOrderByRelevanceInput = {
    fields: UserOrderByRelevanceFieldEnum | UserOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    emailValidated?: SortOrder
    userColor?: SortOrder
    picture?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    activeAt?: SortOrder
    password?: SortOrder
    loginMethod?: SortOrder
    occupationType?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    emailValidated?: SortOrder
    userColor?: SortOrder
    picture?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    activeAt?: SortOrder
    password?: SortOrder
    loginMethod?: SortOrder
    occupationType?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    emailValidated?: SortOrder
    userColor?: SortOrder
    picture?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    activeAt?: SortOrder
    password?: SortOrder
    loginMethod?: SortOrder
    occupationType?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type EnumOccupationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OccupationType | EnumOccupationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.OccupationType[] | ListEnumOccupationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OccupationType[] | ListEnumOccupationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumOccupationTypeWithAggregatesFilter<$PrismaModel> | $Enums.OccupationType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOccupationTypeFilter<$PrismaModel>
    _max?: NestedEnumOccupationTypeFilter<$PrismaModel>
  }

  export type CodeOrderByRelevanceInput = {
    fields: CodeOrderByRelevanceFieldEnum | CodeOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type CodeCountOrderByAggregateInput = {
    code?: SortOrder
    value?: SortOrder
    iat?: SortOrder
    exp?: SortOrder
  }

  export type CodeMaxOrderByAggregateInput = {
    code?: SortOrder
    value?: SortOrder
    iat?: SortOrder
    exp?: SortOrder
  }

  export type CodeMinOrderByAggregateInput = {
    code?: SortOrder
    value?: SortOrder
    iat?: SortOrder
    exp?: SortOrder
  }

  export type RefreshTokenOrderByRelevanceInput = {
    fields: RefreshTokenOrderByRelevanceFieldEnum | RefreshTokenOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type RefreshTokenCountOrderByAggregateInput = {
    code?: SortOrder
    hmac?: SortOrder
    iat?: SortOrder
    exp?: SortOrder
  }

  export type RefreshTokenMaxOrderByAggregateInput = {
    code?: SortOrder
    hmac?: SortOrder
    iat?: SortOrder
    exp?: SortOrder
  }

  export type RefreshTokenMinOrderByAggregateInput = {
    code?: SortOrder
    hmac?: SortOrder
    iat?: SortOrder
    exp?: SortOrder
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type GuideTagListRelationFilter = {
    every?: GuideTagWhereInput
    some?: GuideTagWhereInput
    none?: GuideTagWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type GuideTagOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GuideOrderByRelevanceInput = {
    fields: GuideOrderByRelevanceFieldEnum | GuideOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type GuideCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    authorId?: SortOrder
    positiveRatings?: SortOrder
    negativeRatings?: SortOrder
    content?: SortOrder
    description?: SortOrder
    category?: SortOrder
    visits?: SortOrder
  }

  export type GuideAvgOrderByAggregateInput = {
    id?: SortOrder
    authorId?: SortOrder
    positiveRatings?: SortOrder
    negativeRatings?: SortOrder
    visits?: SortOrder
  }

  export type GuideMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    authorId?: SortOrder
    positiveRatings?: SortOrder
    negativeRatings?: SortOrder
    content?: SortOrder
    description?: SortOrder
    category?: SortOrder
    visits?: SortOrder
  }

  export type GuideMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    authorId?: SortOrder
    positiveRatings?: SortOrder
    negativeRatings?: SortOrder
    content?: SortOrder
    description?: SortOrder
    category?: SortOrder
    visits?: SortOrder
  }

  export type GuideSumOrderByAggregateInput = {
    id?: SortOrder
    authorId?: SortOrder
    positiveRatings?: SortOrder
    negativeRatings?: SortOrder
    visits?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type TagOrderByRelevanceInput = {
    fields: TagOrderByRelevanceFieldEnum | TagOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type TagCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type TagAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type TagMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type TagMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type TagSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type GuideScalarRelationFilter = {
    is?: GuideWhereInput
    isNot?: GuideWhereInput
  }

  export type TagScalarRelationFilter = {
    is?: TagWhereInput
    isNot?: TagWhereInput
  }

  export type GuideTagGuideIdTagIdCompoundUniqueInput = {
    guideId: number
    tagId: number
  }

  export type GuideTagCountOrderByAggregateInput = {
    guideId?: SortOrder
    tagId?: SortOrder
  }

  export type GuideTagAvgOrderByAggregateInput = {
    guideId?: SortOrder
    tagId?: SortOrder
  }

  export type GuideTagMaxOrderByAggregateInput = {
    guideId?: SortOrder
    tagId?: SortOrder
  }

  export type GuideTagMinOrderByAggregateInput = {
    guideId?: SortOrder
    tagId?: SortOrder
  }

  export type GuideTagSumOrderByAggregateInput = {
    guideId?: SortOrder
    tagId?: SortOrder
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }
  export type JsonNullableListFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableListFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableListFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableListFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableListFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableListFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue[] | ListJsonFieldRefInput<$PrismaModel> | null
    has?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    hasEvery?: InputJsonValue[] | ListJsonFieldRefInput<$PrismaModel>
    hasSome?: InputJsonValue[] | ListJsonFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type EnumDifficultyNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Difficulty | EnumDifficultyFieldRefInput<$PrismaModel> | null
    in?: $Enums.Difficulty[] | ListEnumDifficultyFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Difficulty[] | ListEnumDifficultyFieldRefInput<$PrismaModel> | null
    not?: NestedEnumDifficultyNullableFilter<$PrismaModel> | $Enums.Difficulty | null
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type ProblemOrderByRelevanceInput = {
    fields: ProblemOrderByRelevanceFieldEnum | ProblemOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ProblemCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    author?: SortOrder
    positiveRatings?: SortOrder
    negativeRatings?: SortOrder
    description?: SortOrder
    requirement?: SortOrder
    tests?: SortOrder
    averageTimeLimit?: SortOrder
    averageMemLimit?: SortOrder
    category?: SortOrder
    sourceCode?: SortOrder
    difficulty?: SortOrder
    tags?: SortOrder
  }

  export type ProblemAvgOrderByAggregateInput = {
    id?: SortOrder
    positiveRatings?: SortOrder
    negativeRatings?: SortOrder
    averageTimeLimit?: SortOrder
    averageMemLimit?: SortOrder
  }

  export type ProblemMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    author?: SortOrder
    positiveRatings?: SortOrder
    negativeRatings?: SortOrder
    description?: SortOrder
    averageTimeLimit?: SortOrder
    averageMemLimit?: SortOrder
    category?: SortOrder
    sourceCode?: SortOrder
    difficulty?: SortOrder
  }

  export type ProblemMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    author?: SortOrder
    positiveRatings?: SortOrder
    negativeRatings?: SortOrder
    description?: SortOrder
    averageTimeLimit?: SortOrder
    averageMemLimit?: SortOrder
    category?: SortOrder
    sourceCode?: SortOrder
    difficulty?: SortOrder
  }

  export type ProblemSumOrderByAggregateInput = {
    id?: SortOrder
    positiveRatings?: SortOrder
    negativeRatings?: SortOrder
    averageTimeLimit?: SortOrder
    averageMemLimit?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type EnumDifficultyNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Difficulty | EnumDifficultyFieldRefInput<$PrismaModel> | null
    in?: $Enums.Difficulty[] | ListEnumDifficultyFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Difficulty[] | ListEnumDifficultyFieldRefInput<$PrismaModel> | null
    not?: NestedEnumDifficultyNullableWithAggregatesFilter<$PrismaModel> | $Enums.Difficulty | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumDifficultyNullableFilter<$PrismaModel>
    _max?: NestedEnumDifficultyNullableFilter<$PrismaModel>
  }

  export type ProblemScalarRelationFilter = {
    is?: ProblemWhereInput
    isNot?: ProblemWhereInput
  }

  export type SolveOrderByRelevanceInput = {
    fields: SolveOrderByRelevanceFieldEnum | SolveOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type SolveCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    problemid?: SortOrder
    sourceCode?: SortOrder
    uploadedAt?: SortOrder
    score?: SortOrder
    time?: SortOrder
  }

  export type SolveAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    problemid?: SortOrder
    score?: SortOrder
    time?: SortOrder
  }

  export type SolveMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    problemid?: SortOrder
    sourceCode?: SortOrder
    uploadedAt?: SortOrder
    score?: SortOrder
    time?: SortOrder
  }

  export type SolveMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    problemid?: SortOrder
    sourceCode?: SortOrder
    uploadedAt?: SortOrder
    score?: SortOrder
    time?: SortOrder
  }

  export type SolveSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    problemid?: SortOrder
    score?: SortOrder
    time?: SortOrder
  }

  export type CourseOrderByRelevanceInput = {
    fields: CourseOrderByRelevanceFieldEnum | CourseOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type CourseCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    experience?: SortOrder
    price?: SortOrder
    courseLength?: SortOrder
    description?: SortOrder
    phone?: SortOrder
    external?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CourseAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    price?: SortOrder
    courseLength?: SortOrder
  }

  export type CourseMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    experience?: SortOrder
    price?: SortOrder
    courseLength?: SortOrder
    description?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CourseMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    experience?: SortOrder
    price?: SortOrder
    courseLength?: SortOrder
    description?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CourseSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    price?: SortOrder
    courseLength?: SortOrder
  }

  export type UserCreateNestedOneWithoutProjectsInput = {
    create?: XOR<UserCreateWithoutProjectsInput, UserUncheckedCreateWithoutProjectsInput>
    connectOrCreate?: UserCreateOrConnectWithoutProjectsInput
    connect?: UserWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateOneRequiredWithoutProjectsNestedInput = {
    create?: XOR<UserCreateWithoutProjectsInput, UserUncheckedCreateWithoutProjectsInput>
    connectOrCreate?: UserCreateOrConnectWithoutProjectsInput
    upsert?: UserUpsertWithoutProjectsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutProjectsInput, UserUpdateWithoutProjectsInput>, UserUncheckedUpdateWithoutProjectsInput>
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ProjectCreateNestedManyWithoutUserInput = {
    create?: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput> | ProjectCreateWithoutUserInput[] | ProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutUserInput | ProjectCreateOrConnectWithoutUserInput[]
    createMany?: ProjectCreateManyUserInputEnvelope
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
  }

  export type SolveCreateNestedManyWithoutUserInput = {
    create?: XOR<SolveCreateWithoutUserInput, SolveUncheckedCreateWithoutUserInput> | SolveCreateWithoutUserInput[] | SolveUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SolveCreateOrConnectWithoutUserInput | SolveCreateOrConnectWithoutUserInput[]
    createMany?: SolveCreateManyUserInputEnvelope
    connect?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
  }

  export type GuideCreateNestedManyWithoutAuthorInput = {
    create?: XOR<GuideCreateWithoutAuthorInput, GuideUncheckedCreateWithoutAuthorInput> | GuideCreateWithoutAuthorInput[] | GuideUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: GuideCreateOrConnectWithoutAuthorInput | GuideCreateOrConnectWithoutAuthorInput[]
    createMany?: GuideCreateManyAuthorInputEnvelope
    connect?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
  }

  export type CourseCreateNestedOneWithoutUserInput = {
    create?: XOR<CourseCreateWithoutUserInput, CourseUncheckedCreateWithoutUserInput>
    connectOrCreate?: CourseCreateOrConnectWithoutUserInput
    connect?: CourseWhereUniqueInput
  }

  export type ProjectUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput> | ProjectCreateWithoutUserInput[] | ProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutUserInput | ProjectCreateOrConnectWithoutUserInput[]
    createMany?: ProjectCreateManyUserInputEnvelope
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
  }

  export type SolveUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SolveCreateWithoutUserInput, SolveUncheckedCreateWithoutUserInput> | SolveCreateWithoutUserInput[] | SolveUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SolveCreateOrConnectWithoutUserInput | SolveCreateOrConnectWithoutUserInput[]
    createMany?: SolveCreateManyUserInputEnvelope
    connect?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
  }

  export type GuideUncheckedCreateNestedManyWithoutAuthorInput = {
    create?: XOR<GuideCreateWithoutAuthorInput, GuideUncheckedCreateWithoutAuthorInput> | GuideCreateWithoutAuthorInput[] | GuideUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: GuideCreateOrConnectWithoutAuthorInput | GuideCreateOrConnectWithoutAuthorInput[]
    createMany?: GuideCreateManyAuthorInputEnvelope
    connect?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
  }

  export type CourseUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<CourseCreateWithoutUserInput, CourseUncheckedCreateWithoutUserInput>
    connectOrCreate?: CourseCreateOrConnectWithoutUserInput
    connect?: CourseWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type EnumOccupationTypeFieldUpdateOperationsInput = {
    set?: $Enums.OccupationType
  }

  export type ProjectUpdateManyWithoutUserNestedInput = {
    create?: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput> | ProjectCreateWithoutUserInput[] | ProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutUserInput | ProjectCreateOrConnectWithoutUserInput[]
    upsert?: ProjectUpsertWithWhereUniqueWithoutUserInput | ProjectUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ProjectCreateManyUserInputEnvelope
    set?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    disconnect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    delete?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    update?: ProjectUpdateWithWhereUniqueWithoutUserInput | ProjectUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ProjectUpdateManyWithWhereWithoutUserInput | ProjectUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
  }

  export type SolveUpdateManyWithoutUserNestedInput = {
    create?: XOR<SolveCreateWithoutUserInput, SolveUncheckedCreateWithoutUserInput> | SolveCreateWithoutUserInput[] | SolveUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SolveCreateOrConnectWithoutUserInput | SolveCreateOrConnectWithoutUserInput[]
    upsert?: SolveUpsertWithWhereUniqueWithoutUserInput | SolveUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SolveCreateManyUserInputEnvelope
    set?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
    disconnect?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
    delete?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
    connect?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
    update?: SolveUpdateWithWhereUniqueWithoutUserInput | SolveUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SolveUpdateManyWithWhereWithoutUserInput | SolveUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SolveScalarWhereInput | SolveScalarWhereInput[]
  }

  export type GuideUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<GuideCreateWithoutAuthorInput, GuideUncheckedCreateWithoutAuthorInput> | GuideCreateWithoutAuthorInput[] | GuideUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: GuideCreateOrConnectWithoutAuthorInput | GuideCreateOrConnectWithoutAuthorInput[]
    upsert?: GuideUpsertWithWhereUniqueWithoutAuthorInput | GuideUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: GuideCreateManyAuthorInputEnvelope
    set?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
    disconnect?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
    delete?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
    connect?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
    update?: GuideUpdateWithWhereUniqueWithoutAuthorInput | GuideUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: GuideUpdateManyWithWhereWithoutAuthorInput | GuideUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: GuideScalarWhereInput | GuideScalarWhereInput[]
  }

  export type CourseUpdateOneWithoutUserNestedInput = {
    create?: XOR<CourseCreateWithoutUserInput, CourseUncheckedCreateWithoutUserInput>
    connectOrCreate?: CourseCreateOrConnectWithoutUserInput
    upsert?: CourseUpsertWithoutUserInput
    disconnect?: CourseWhereInput | boolean
    delete?: CourseWhereInput | boolean
    connect?: CourseWhereUniqueInput
    update?: XOR<XOR<CourseUpdateToOneWithWhereWithoutUserInput, CourseUpdateWithoutUserInput>, CourseUncheckedUpdateWithoutUserInput>
  }

  export type ProjectUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput> | ProjectCreateWithoutUserInput[] | ProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutUserInput | ProjectCreateOrConnectWithoutUserInput[]
    upsert?: ProjectUpsertWithWhereUniqueWithoutUserInput | ProjectUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ProjectCreateManyUserInputEnvelope
    set?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    disconnect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    delete?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    update?: ProjectUpdateWithWhereUniqueWithoutUserInput | ProjectUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ProjectUpdateManyWithWhereWithoutUserInput | ProjectUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
  }

  export type SolveUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SolveCreateWithoutUserInput, SolveUncheckedCreateWithoutUserInput> | SolveCreateWithoutUserInput[] | SolveUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SolveCreateOrConnectWithoutUserInput | SolveCreateOrConnectWithoutUserInput[]
    upsert?: SolveUpsertWithWhereUniqueWithoutUserInput | SolveUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SolveCreateManyUserInputEnvelope
    set?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
    disconnect?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
    delete?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
    connect?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
    update?: SolveUpdateWithWhereUniqueWithoutUserInput | SolveUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SolveUpdateManyWithWhereWithoutUserInput | SolveUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SolveScalarWhereInput | SolveScalarWhereInput[]
  }

  export type GuideUncheckedUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<GuideCreateWithoutAuthorInput, GuideUncheckedCreateWithoutAuthorInput> | GuideCreateWithoutAuthorInput[] | GuideUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: GuideCreateOrConnectWithoutAuthorInput | GuideCreateOrConnectWithoutAuthorInput[]
    upsert?: GuideUpsertWithWhereUniqueWithoutAuthorInput | GuideUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: GuideCreateManyAuthorInputEnvelope
    set?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
    disconnect?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
    delete?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
    connect?: GuideWhereUniqueInput | GuideWhereUniqueInput[]
    update?: GuideUpdateWithWhereUniqueWithoutAuthorInput | GuideUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: GuideUpdateManyWithWhereWithoutAuthorInput | GuideUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: GuideScalarWhereInput | GuideScalarWhereInput[]
  }

  export type CourseUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<CourseCreateWithoutUserInput, CourseUncheckedCreateWithoutUserInput>
    connectOrCreate?: CourseCreateOrConnectWithoutUserInput
    upsert?: CourseUpsertWithoutUserInput
    disconnect?: CourseWhereInput | boolean
    delete?: CourseWhereInput | boolean
    connect?: CourseWhereUniqueInput
    update?: XOR<XOR<CourseUpdateToOneWithWhereWithoutUserInput, CourseUpdateWithoutUserInput>, CourseUncheckedUpdateWithoutUserInput>
  }

  export type UserCreateNestedOneWithoutGuideInput = {
    create?: XOR<UserCreateWithoutGuideInput, UserUncheckedCreateWithoutGuideInput>
    connectOrCreate?: UserCreateOrConnectWithoutGuideInput
    connect?: UserWhereUniqueInput
  }

  export type GuideTagCreateNestedManyWithoutGuideInput = {
    create?: XOR<GuideTagCreateWithoutGuideInput, GuideTagUncheckedCreateWithoutGuideInput> | GuideTagCreateWithoutGuideInput[] | GuideTagUncheckedCreateWithoutGuideInput[]
    connectOrCreate?: GuideTagCreateOrConnectWithoutGuideInput | GuideTagCreateOrConnectWithoutGuideInput[]
    createMany?: GuideTagCreateManyGuideInputEnvelope
    connect?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
  }

  export type GuideTagUncheckedCreateNestedManyWithoutGuideInput = {
    create?: XOR<GuideTagCreateWithoutGuideInput, GuideTagUncheckedCreateWithoutGuideInput> | GuideTagCreateWithoutGuideInput[] | GuideTagUncheckedCreateWithoutGuideInput[]
    connectOrCreate?: GuideTagCreateOrConnectWithoutGuideInput | GuideTagCreateOrConnectWithoutGuideInput[]
    createMany?: GuideTagCreateManyGuideInputEnvelope
    connect?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type UserUpdateOneRequiredWithoutGuideNestedInput = {
    create?: XOR<UserCreateWithoutGuideInput, UserUncheckedCreateWithoutGuideInput>
    connectOrCreate?: UserCreateOrConnectWithoutGuideInput
    upsert?: UserUpsertWithoutGuideInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutGuideInput, UserUpdateWithoutGuideInput>, UserUncheckedUpdateWithoutGuideInput>
  }

  export type GuideTagUpdateManyWithoutGuideNestedInput = {
    create?: XOR<GuideTagCreateWithoutGuideInput, GuideTagUncheckedCreateWithoutGuideInput> | GuideTagCreateWithoutGuideInput[] | GuideTagUncheckedCreateWithoutGuideInput[]
    connectOrCreate?: GuideTagCreateOrConnectWithoutGuideInput | GuideTagCreateOrConnectWithoutGuideInput[]
    upsert?: GuideTagUpsertWithWhereUniqueWithoutGuideInput | GuideTagUpsertWithWhereUniqueWithoutGuideInput[]
    createMany?: GuideTagCreateManyGuideInputEnvelope
    set?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
    disconnect?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
    delete?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
    connect?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
    update?: GuideTagUpdateWithWhereUniqueWithoutGuideInput | GuideTagUpdateWithWhereUniqueWithoutGuideInput[]
    updateMany?: GuideTagUpdateManyWithWhereWithoutGuideInput | GuideTagUpdateManyWithWhereWithoutGuideInput[]
    deleteMany?: GuideTagScalarWhereInput | GuideTagScalarWhereInput[]
  }

  export type GuideTagUncheckedUpdateManyWithoutGuideNestedInput = {
    create?: XOR<GuideTagCreateWithoutGuideInput, GuideTagUncheckedCreateWithoutGuideInput> | GuideTagCreateWithoutGuideInput[] | GuideTagUncheckedCreateWithoutGuideInput[]
    connectOrCreate?: GuideTagCreateOrConnectWithoutGuideInput | GuideTagCreateOrConnectWithoutGuideInput[]
    upsert?: GuideTagUpsertWithWhereUniqueWithoutGuideInput | GuideTagUpsertWithWhereUniqueWithoutGuideInput[]
    createMany?: GuideTagCreateManyGuideInputEnvelope
    set?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
    disconnect?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
    delete?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
    connect?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
    update?: GuideTagUpdateWithWhereUniqueWithoutGuideInput | GuideTagUpdateWithWhereUniqueWithoutGuideInput[]
    updateMany?: GuideTagUpdateManyWithWhereWithoutGuideInput | GuideTagUpdateManyWithWhereWithoutGuideInput[]
    deleteMany?: GuideTagScalarWhereInput | GuideTagScalarWhereInput[]
  }

  export type GuideTagCreateNestedManyWithoutTagInput = {
    create?: XOR<GuideTagCreateWithoutTagInput, GuideTagUncheckedCreateWithoutTagInput> | GuideTagCreateWithoutTagInput[] | GuideTagUncheckedCreateWithoutTagInput[]
    connectOrCreate?: GuideTagCreateOrConnectWithoutTagInput | GuideTagCreateOrConnectWithoutTagInput[]
    createMany?: GuideTagCreateManyTagInputEnvelope
    connect?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
  }

  export type GuideTagUncheckedCreateNestedManyWithoutTagInput = {
    create?: XOR<GuideTagCreateWithoutTagInput, GuideTagUncheckedCreateWithoutTagInput> | GuideTagCreateWithoutTagInput[] | GuideTagUncheckedCreateWithoutTagInput[]
    connectOrCreate?: GuideTagCreateOrConnectWithoutTagInput | GuideTagCreateOrConnectWithoutTagInput[]
    createMany?: GuideTagCreateManyTagInputEnvelope
    connect?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
  }

  export type GuideTagUpdateManyWithoutTagNestedInput = {
    create?: XOR<GuideTagCreateWithoutTagInput, GuideTagUncheckedCreateWithoutTagInput> | GuideTagCreateWithoutTagInput[] | GuideTagUncheckedCreateWithoutTagInput[]
    connectOrCreate?: GuideTagCreateOrConnectWithoutTagInput | GuideTagCreateOrConnectWithoutTagInput[]
    upsert?: GuideTagUpsertWithWhereUniqueWithoutTagInput | GuideTagUpsertWithWhereUniqueWithoutTagInput[]
    createMany?: GuideTagCreateManyTagInputEnvelope
    set?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
    disconnect?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
    delete?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
    connect?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
    update?: GuideTagUpdateWithWhereUniqueWithoutTagInput | GuideTagUpdateWithWhereUniqueWithoutTagInput[]
    updateMany?: GuideTagUpdateManyWithWhereWithoutTagInput | GuideTagUpdateManyWithWhereWithoutTagInput[]
    deleteMany?: GuideTagScalarWhereInput | GuideTagScalarWhereInput[]
  }

  export type GuideTagUncheckedUpdateManyWithoutTagNestedInput = {
    create?: XOR<GuideTagCreateWithoutTagInput, GuideTagUncheckedCreateWithoutTagInput> | GuideTagCreateWithoutTagInput[] | GuideTagUncheckedCreateWithoutTagInput[]
    connectOrCreate?: GuideTagCreateOrConnectWithoutTagInput | GuideTagCreateOrConnectWithoutTagInput[]
    upsert?: GuideTagUpsertWithWhereUniqueWithoutTagInput | GuideTagUpsertWithWhereUniqueWithoutTagInput[]
    createMany?: GuideTagCreateManyTagInputEnvelope
    set?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
    disconnect?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
    delete?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
    connect?: GuideTagWhereUniqueInput | GuideTagWhereUniqueInput[]
    update?: GuideTagUpdateWithWhereUniqueWithoutTagInput | GuideTagUpdateWithWhereUniqueWithoutTagInput[]
    updateMany?: GuideTagUpdateManyWithWhereWithoutTagInput | GuideTagUpdateManyWithWhereWithoutTagInput[]
    deleteMany?: GuideTagScalarWhereInput | GuideTagScalarWhereInput[]
  }

  export type GuideCreateNestedOneWithoutGuideTagsInput = {
    create?: XOR<GuideCreateWithoutGuideTagsInput, GuideUncheckedCreateWithoutGuideTagsInput>
    connectOrCreate?: GuideCreateOrConnectWithoutGuideTagsInput
    connect?: GuideWhereUniqueInput
  }

  export type TagCreateNestedOneWithoutGuideTagsInput = {
    create?: XOR<TagCreateWithoutGuideTagsInput, TagUncheckedCreateWithoutGuideTagsInput>
    connectOrCreate?: TagCreateOrConnectWithoutGuideTagsInput
    connect?: TagWhereUniqueInput
  }

  export type GuideUpdateOneRequiredWithoutGuideTagsNestedInput = {
    create?: XOR<GuideCreateWithoutGuideTagsInput, GuideUncheckedCreateWithoutGuideTagsInput>
    connectOrCreate?: GuideCreateOrConnectWithoutGuideTagsInput
    upsert?: GuideUpsertWithoutGuideTagsInput
    connect?: GuideWhereUniqueInput
    update?: XOR<XOR<GuideUpdateToOneWithWhereWithoutGuideTagsInput, GuideUpdateWithoutGuideTagsInput>, GuideUncheckedUpdateWithoutGuideTagsInput>
  }

  export type TagUpdateOneRequiredWithoutGuideTagsNestedInput = {
    create?: XOR<TagCreateWithoutGuideTagsInput, TagUncheckedCreateWithoutGuideTagsInput>
    connectOrCreate?: TagCreateOrConnectWithoutGuideTagsInput
    upsert?: TagUpsertWithoutGuideTagsInput
    connect?: TagWhereUniqueInput
    update?: XOR<XOR<TagUpdateToOneWithWhereWithoutGuideTagsInput, TagUpdateWithoutGuideTagsInput>, TagUncheckedUpdateWithoutGuideTagsInput>
  }

  export type ProblemCreatetestsInput = {
    set: InputJsonValue[]
  }

  export type ProblemCreatetagsInput = {
    set: string[]
  }

  export type SolveCreateNestedManyWithoutProblemInput = {
    create?: XOR<SolveCreateWithoutProblemInput, SolveUncheckedCreateWithoutProblemInput> | SolveCreateWithoutProblemInput[] | SolveUncheckedCreateWithoutProblemInput[]
    connectOrCreate?: SolveCreateOrConnectWithoutProblemInput | SolveCreateOrConnectWithoutProblemInput[]
    createMany?: SolveCreateManyProblemInputEnvelope
    connect?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
  }

  export type SolveUncheckedCreateNestedManyWithoutProblemInput = {
    create?: XOR<SolveCreateWithoutProblemInput, SolveUncheckedCreateWithoutProblemInput> | SolveCreateWithoutProblemInput[] | SolveUncheckedCreateWithoutProblemInput[]
    connectOrCreate?: SolveCreateOrConnectWithoutProblemInput | SolveCreateOrConnectWithoutProblemInput[]
    createMany?: SolveCreateManyProblemInputEnvelope
    connect?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
  }

  export type ProblemUpdatetestsInput = {
    set?: InputJsonValue[]
    push?: InputJsonValue | InputJsonValue[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableEnumDifficultyFieldUpdateOperationsInput = {
    set?: $Enums.Difficulty | null
  }

  export type ProblemUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type SolveUpdateManyWithoutProblemNestedInput = {
    create?: XOR<SolveCreateWithoutProblemInput, SolveUncheckedCreateWithoutProblemInput> | SolveCreateWithoutProblemInput[] | SolveUncheckedCreateWithoutProblemInput[]
    connectOrCreate?: SolveCreateOrConnectWithoutProblemInput | SolveCreateOrConnectWithoutProblemInput[]
    upsert?: SolveUpsertWithWhereUniqueWithoutProblemInput | SolveUpsertWithWhereUniqueWithoutProblemInput[]
    createMany?: SolveCreateManyProblemInputEnvelope
    set?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
    disconnect?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
    delete?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
    connect?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
    update?: SolveUpdateWithWhereUniqueWithoutProblemInput | SolveUpdateWithWhereUniqueWithoutProblemInput[]
    updateMany?: SolveUpdateManyWithWhereWithoutProblemInput | SolveUpdateManyWithWhereWithoutProblemInput[]
    deleteMany?: SolveScalarWhereInput | SolveScalarWhereInput[]
  }

  export type SolveUncheckedUpdateManyWithoutProblemNestedInput = {
    create?: XOR<SolveCreateWithoutProblemInput, SolveUncheckedCreateWithoutProblemInput> | SolveCreateWithoutProblemInput[] | SolveUncheckedCreateWithoutProblemInput[]
    connectOrCreate?: SolveCreateOrConnectWithoutProblemInput | SolveCreateOrConnectWithoutProblemInput[]
    upsert?: SolveUpsertWithWhereUniqueWithoutProblemInput | SolveUpsertWithWhereUniqueWithoutProblemInput[]
    createMany?: SolveCreateManyProblemInputEnvelope
    set?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
    disconnect?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
    delete?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
    connect?: SolveWhereUniqueInput | SolveWhereUniqueInput[]
    update?: SolveUpdateWithWhereUniqueWithoutProblemInput | SolveUpdateWithWhereUniqueWithoutProblemInput[]
    updateMany?: SolveUpdateManyWithWhereWithoutProblemInput | SolveUpdateManyWithWhereWithoutProblemInput[]
    deleteMany?: SolveScalarWhereInput | SolveScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutSolvesInput = {
    create?: XOR<UserCreateWithoutSolvesInput, UserUncheckedCreateWithoutSolvesInput>
    connectOrCreate?: UserCreateOrConnectWithoutSolvesInput
    connect?: UserWhereUniqueInput
  }

  export type ProblemCreateNestedOneWithoutSolvesInput = {
    create?: XOR<ProblemCreateWithoutSolvesInput, ProblemUncheckedCreateWithoutSolvesInput>
    connectOrCreate?: ProblemCreateOrConnectWithoutSolvesInput
    connect?: ProblemWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutSolvesNestedInput = {
    create?: XOR<UserCreateWithoutSolvesInput, UserUncheckedCreateWithoutSolvesInput>
    connectOrCreate?: UserCreateOrConnectWithoutSolvesInput
    upsert?: UserUpsertWithoutSolvesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSolvesInput, UserUpdateWithoutSolvesInput>, UserUncheckedUpdateWithoutSolvesInput>
  }

  export type ProblemUpdateOneRequiredWithoutSolvesNestedInput = {
    create?: XOR<ProblemCreateWithoutSolvesInput, ProblemUncheckedCreateWithoutSolvesInput>
    connectOrCreate?: ProblemCreateOrConnectWithoutSolvesInput
    upsert?: ProblemUpsertWithoutSolvesInput
    connect?: ProblemWhereUniqueInput
    update?: XOR<XOR<ProblemUpdateToOneWithWhereWithoutSolvesInput, ProblemUpdateWithoutSolvesInput>, ProblemUncheckedUpdateWithoutSolvesInput>
  }

  export type CourseCreateexternalInput = {
    set: string[]
  }

  export type UserCreateNestedOneWithoutCourseInput = {
    create?: XOR<UserCreateWithoutCourseInput, UserUncheckedCreateWithoutCourseInput>
    connectOrCreate?: UserCreateOrConnectWithoutCourseInput
    connect?: UserWhereUniqueInput
  }

  export type CourseUpdateexternalInput = {
    set?: string[]
    push?: string | string[]
  }

  export type UserUpdateOneRequiredWithoutCourseNestedInput = {
    create?: XOR<UserCreateWithoutCourseInput, UserUncheckedCreateWithoutCourseInput>
    connectOrCreate?: UserCreateOrConnectWithoutCourseInput
    upsert?: UserUpsertWithoutCourseInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCourseInput, UserUpdateWithoutCourseInput>, UserUncheckedUpdateWithoutCourseInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedEnumOccupationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.OccupationType | EnumOccupationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.OccupationType[] | ListEnumOccupationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OccupationType[] | ListEnumOccupationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumOccupationTypeFilter<$PrismaModel> | $Enums.OccupationType
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedEnumOccupationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OccupationType | EnumOccupationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.OccupationType[] | ListEnumOccupationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OccupationType[] | ListEnumOccupationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumOccupationTypeWithAggregatesFilter<$PrismaModel> | $Enums.OccupationType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOccupationTypeFilter<$PrismaModel>
    _max?: NestedEnumOccupationTypeFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumDifficultyNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Difficulty | EnumDifficultyFieldRefInput<$PrismaModel> | null
    in?: $Enums.Difficulty[] | ListEnumDifficultyFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Difficulty[] | ListEnumDifficultyFieldRefInput<$PrismaModel> | null
    not?: NestedEnumDifficultyNullableFilter<$PrismaModel> | $Enums.Difficulty | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedEnumDifficultyNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Difficulty | EnumDifficultyFieldRefInput<$PrismaModel> | null
    in?: $Enums.Difficulty[] | ListEnumDifficultyFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Difficulty[] | ListEnumDifficultyFieldRefInput<$PrismaModel> | null
    not?: NestedEnumDifficultyNullableWithAggregatesFilter<$PrismaModel> | $Enums.Difficulty | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumDifficultyNullableFilter<$PrismaModel>
    _max?: NestedEnumDifficultyNullableFilter<$PrismaModel>
  }

  export type UserCreateWithoutProjectsInput = {
    username: string
    firstName: string
    lastName: string
    email: string
    emailValidated?: boolean
    userColor?: string
    picture?: string
    role?: $Enums.Role
    createdAt?: Date | string
    activeAt?: Date | string
    password: string
    loginMethod?: string
    occupationType?: $Enums.OccupationType
    solves?: SolveCreateNestedManyWithoutUserInput
    Guide?: GuideCreateNestedManyWithoutAuthorInput
    Course?: CourseCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutProjectsInput = {
    id?: number
    username: string
    firstName: string
    lastName: string
    email: string
    emailValidated?: boolean
    userColor?: string
    picture?: string
    role?: $Enums.Role
    createdAt?: Date | string
    activeAt?: Date | string
    password: string
    loginMethod?: string
    occupationType?: $Enums.OccupationType
    solves?: SolveUncheckedCreateNestedManyWithoutUserInput
    Guide?: GuideUncheckedCreateNestedManyWithoutAuthorInput
    Course?: CourseUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutProjectsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutProjectsInput, UserUncheckedCreateWithoutProjectsInput>
  }

  export type UserUpsertWithoutProjectsInput = {
    update: XOR<UserUpdateWithoutProjectsInput, UserUncheckedUpdateWithoutProjectsInput>
    create: XOR<UserCreateWithoutProjectsInput, UserUncheckedCreateWithoutProjectsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutProjectsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutProjectsInput, UserUncheckedUpdateWithoutProjectsInput>
  }

  export type UserUpdateWithoutProjectsInput = {
    username?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailValidated?: BoolFieldUpdateOperationsInput | boolean
    userColor?: StringFieldUpdateOperationsInput | string
    picture?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeAt?: DateTimeFieldUpdateOperationsInput | Date | string
    password?: StringFieldUpdateOperationsInput | string
    loginMethod?: StringFieldUpdateOperationsInput | string
    occupationType?: EnumOccupationTypeFieldUpdateOperationsInput | $Enums.OccupationType
    solves?: SolveUpdateManyWithoutUserNestedInput
    Guide?: GuideUpdateManyWithoutAuthorNestedInput
    Course?: CourseUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutProjectsInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailValidated?: BoolFieldUpdateOperationsInput | boolean
    userColor?: StringFieldUpdateOperationsInput | string
    picture?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeAt?: DateTimeFieldUpdateOperationsInput | Date | string
    password?: StringFieldUpdateOperationsInput | string
    loginMethod?: StringFieldUpdateOperationsInput | string
    occupationType?: EnumOccupationTypeFieldUpdateOperationsInput | $Enums.OccupationType
    solves?: SolveUncheckedUpdateManyWithoutUserNestedInput
    Guide?: GuideUncheckedUpdateManyWithoutAuthorNestedInput
    Course?: CourseUncheckedUpdateOneWithoutUserNestedInput
  }

  export type ProjectCreateWithoutUserInput = {
    name: string
    fileUUID: string
    createdAt?: Date | string
  }

  export type ProjectUncheckedCreateWithoutUserInput = {
    id?: number
    name: string
    fileUUID: string
    createdAt?: Date | string
  }

  export type ProjectCreateOrConnectWithoutUserInput = {
    where: ProjectWhereUniqueInput
    create: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput>
  }

  export type ProjectCreateManyUserInputEnvelope = {
    data: ProjectCreateManyUserInput | ProjectCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SolveCreateWithoutUserInput = {
    sourceCode: string
    uploadedAt?: Date | string
    score: number
    time?: number
    problem: ProblemCreateNestedOneWithoutSolvesInput
  }

  export type SolveUncheckedCreateWithoutUserInput = {
    id?: number
    problemid: number
    sourceCode: string
    uploadedAt?: Date | string
    score: number
    time?: number
  }

  export type SolveCreateOrConnectWithoutUserInput = {
    where: SolveWhereUniqueInput
    create: XOR<SolveCreateWithoutUserInput, SolveUncheckedCreateWithoutUserInput>
  }

  export type SolveCreateManyUserInputEnvelope = {
    data: SolveCreateManyUserInput | SolveCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type GuideCreateWithoutAuthorInput = {
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    positiveRatings?: number
    negativeRatings?: number
    content: string
    description?: string | null
    category?: string | null
    visits?: number
    guideTags?: GuideTagCreateNestedManyWithoutGuideInput
  }

  export type GuideUncheckedCreateWithoutAuthorInput = {
    id?: number
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    positiveRatings?: number
    negativeRatings?: number
    content: string
    description?: string | null
    category?: string | null
    visits?: number
    guideTags?: GuideTagUncheckedCreateNestedManyWithoutGuideInput
  }

  export type GuideCreateOrConnectWithoutAuthorInput = {
    where: GuideWhereUniqueInput
    create: XOR<GuideCreateWithoutAuthorInput, GuideUncheckedCreateWithoutAuthorInput>
  }

  export type GuideCreateManyAuthorInputEnvelope = {
    data: GuideCreateManyAuthorInput | GuideCreateManyAuthorInput[]
    skipDuplicates?: boolean
  }

  export type CourseCreateWithoutUserInput = {
    experience: string
    price: number
    courseLength: number
    description: string
    phone?: string | null
    external?: CourseCreateexternalInput | string[]
    email?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CourseUncheckedCreateWithoutUserInput = {
    id?: number
    experience: string
    price: number
    courseLength: number
    description: string
    phone?: string | null
    external?: CourseCreateexternalInput | string[]
    email?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CourseCreateOrConnectWithoutUserInput = {
    where: CourseWhereUniqueInput
    create: XOR<CourseCreateWithoutUserInput, CourseUncheckedCreateWithoutUserInput>
  }

  export type ProjectUpsertWithWhereUniqueWithoutUserInput = {
    where: ProjectWhereUniqueInput
    update: XOR<ProjectUpdateWithoutUserInput, ProjectUncheckedUpdateWithoutUserInput>
    create: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput>
  }

  export type ProjectUpdateWithWhereUniqueWithoutUserInput = {
    where: ProjectWhereUniqueInput
    data: XOR<ProjectUpdateWithoutUserInput, ProjectUncheckedUpdateWithoutUserInput>
  }

  export type ProjectUpdateManyWithWhereWithoutUserInput = {
    where: ProjectScalarWhereInput
    data: XOR<ProjectUpdateManyMutationInput, ProjectUncheckedUpdateManyWithoutUserInput>
  }

  export type ProjectScalarWhereInput = {
    AND?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
    OR?: ProjectScalarWhereInput[]
    NOT?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
    id?: IntFilter<"Project"> | number
    name?: StringFilter<"Project"> | string
    fileUUID?: StringFilter<"Project"> | string
    createdAt?: DateTimeFilter<"Project"> | Date | string
    userId?: IntFilter<"Project"> | number
  }

  export type SolveUpsertWithWhereUniqueWithoutUserInput = {
    where: SolveWhereUniqueInput
    update: XOR<SolveUpdateWithoutUserInput, SolveUncheckedUpdateWithoutUserInput>
    create: XOR<SolveCreateWithoutUserInput, SolveUncheckedCreateWithoutUserInput>
  }

  export type SolveUpdateWithWhereUniqueWithoutUserInput = {
    where: SolveWhereUniqueInput
    data: XOR<SolveUpdateWithoutUserInput, SolveUncheckedUpdateWithoutUserInput>
  }

  export type SolveUpdateManyWithWhereWithoutUserInput = {
    where: SolveScalarWhereInput
    data: XOR<SolveUpdateManyMutationInput, SolveUncheckedUpdateManyWithoutUserInput>
  }

  export type SolveScalarWhereInput = {
    AND?: SolveScalarWhereInput | SolveScalarWhereInput[]
    OR?: SolveScalarWhereInput[]
    NOT?: SolveScalarWhereInput | SolveScalarWhereInput[]
    id?: IntFilter<"Solve"> | number
    userId?: IntFilter<"Solve"> | number
    problemid?: IntFilter<"Solve"> | number
    sourceCode?: StringFilter<"Solve"> | string
    uploadedAt?: DateTimeFilter<"Solve"> | Date | string
    score?: IntFilter<"Solve"> | number
    time?: IntFilter<"Solve"> | number
  }

  export type GuideUpsertWithWhereUniqueWithoutAuthorInput = {
    where: GuideWhereUniqueInput
    update: XOR<GuideUpdateWithoutAuthorInput, GuideUncheckedUpdateWithoutAuthorInput>
    create: XOR<GuideCreateWithoutAuthorInput, GuideUncheckedCreateWithoutAuthorInput>
  }

  export type GuideUpdateWithWhereUniqueWithoutAuthorInput = {
    where: GuideWhereUniqueInput
    data: XOR<GuideUpdateWithoutAuthorInput, GuideUncheckedUpdateWithoutAuthorInput>
  }

  export type GuideUpdateManyWithWhereWithoutAuthorInput = {
    where: GuideScalarWhereInput
    data: XOR<GuideUpdateManyMutationInput, GuideUncheckedUpdateManyWithoutAuthorInput>
  }

  export type GuideScalarWhereInput = {
    AND?: GuideScalarWhereInput | GuideScalarWhereInput[]
    OR?: GuideScalarWhereInput[]
    NOT?: GuideScalarWhereInput | GuideScalarWhereInput[]
    id?: IntFilter<"Guide"> | number
    name?: StringFilter<"Guide"> | string
    createdAt?: DateTimeFilter<"Guide"> | Date | string
    updatedAt?: DateTimeFilter<"Guide"> | Date | string
    authorId?: IntFilter<"Guide"> | number
    positiveRatings?: IntFilter<"Guide"> | number
    negativeRatings?: IntFilter<"Guide"> | number
    content?: StringFilter<"Guide"> | string
    description?: StringNullableFilter<"Guide"> | string | null
    category?: StringNullableFilter<"Guide"> | string | null
    visits?: IntFilter<"Guide"> | number
  }

  export type CourseUpsertWithoutUserInput = {
    update: XOR<CourseUpdateWithoutUserInput, CourseUncheckedUpdateWithoutUserInput>
    create: XOR<CourseCreateWithoutUserInput, CourseUncheckedCreateWithoutUserInput>
    where?: CourseWhereInput
  }

  export type CourseUpdateToOneWithWhereWithoutUserInput = {
    where?: CourseWhereInput
    data: XOR<CourseUpdateWithoutUserInput, CourseUncheckedUpdateWithoutUserInput>
  }

  export type CourseUpdateWithoutUserInput = {
    experience?: StringFieldUpdateOperationsInput | string
    price?: IntFieldUpdateOperationsInput | number
    courseLength?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    external?: CourseUpdateexternalInput | string[]
    email?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CourseUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    experience?: StringFieldUpdateOperationsInput | string
    price?: IntFieldUpdateOperationsInput | number
    courseLength?: IntFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    external?: CourseUpdateexternalInput | string[]
    email?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutGuideInput = {
    username: string
    firstName: string
    lastName: string
    email: string
    emailValidated?: boolean
    userColor?: string
    picture?: string
    role?: $Enums.Role
    createdAt?: Date | string
    activeAt?: Date | string
    password: string
    loginMethod?: string
    occupationType?: $Enums.OccupationType
    projects?: ProjectCreateNestedManyWithoutUserInput
    solves?: SolveCreateNestedManyWithoutUserInput
    Course?: CourseCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutGuideInput = {
    id?: number
    username: string
    firstName: string
    lastName: string
    email: string
    emailValidated?: boolean
    userColor?: string
    picture?: string
    role?: $Enums.Role
    createdAt?: Date | string
    activeAt?: Date | string
    password: string
    loginMethod?: string
    occupationType?: $Enums.OccupationType
    projects?: ProjectUncheckedCreateNestedManyWithoutUserInput
    solves?: SolveUncheckedCreateNestedManyWithoutUserInput
    Course?: CourseUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutGuideInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutGuideInput, UserUncheckedCreateWithoutGuideInput>
  }

  export type GuideTagCreateWithoutGuideInput = {
    tag: TagCreateNestedOneWithoutGuideTagsInput
  }

  export type GuideTagUncheckedCreateWithoutGuideInput = {
    tagId: number
  }

  export type GuideTagCreateOrConnectWithoutGuideInput = {
    where: GuideTagWhereUniqueInput
    create: XOR<GuideTagCreateWithoutGuideInput, GuideTagUncheckedCreateWithoutGuideInput>
  }

  export type GuideTagCreateManyGuideInputEnvelope = {
    data: GuideTagCreateManyGuideInput | GuideTagCreateManyGuideInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutGuideInput = {
    update: XOR<UserUpdateWithoutGuideInput, UserUncheckedUpdateWithoutGuideInput>
    create: XOR<UserCreateWithoutGuideInput, UserUncheckedCreateWithoutGuideInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutGuideInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutGuideInput, UserUncheckedUpdateWithoutGuideInput>
  }

  export type UserUpdateWithoutGuideInput = {
    username?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailValidated?: BoolFieldUpdateOperationsInput | boolean
    userColor?: StringFieldUpdateOperationsInput | string
    picture?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeAt?: DateTimeFieldUpdateOperationsInput | Date | string
    password?: StringFieldUpdateOperationsInput | string
    loginMethod?: StringFieldUpdateOperationsInput | string
    occupationType?: EnumOccupationTypeFieldUpdateOperationsInput | $Enums.OccupationType
    projects?: ProjectUpdateManyWithoutUserNestedInput
    solves?: SolveUpdateManyWithoutUserNestedInput
    Course?: CourseUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutGuideInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailValidated?: BoolFieldUpdateOperationsInput | boolean
    userColor?: StringFieldUpdateOperationsInput | string
    picture?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeAt?: DateTimeFieldUpdateOperationsInput | Date | string
    password?: StringFieldUpdateOperationsInput | string
    loginMethod?: StringFieldUpdateOperationsInput | string
    occupationType?: EnumOccupationTypeFieldUpdateOperationsInput | $Enums.OccupationType
    projects?: ProjectUncheckedUpdateManyWithoutUserNestedInput
    solves?: SolveUncheckedUpdateManyWithoutUserNestedInput
    Course?: CourseUncheckedUpdateOneWithoutUserNestedInput
  }

  export type GuideTagUpsertWithWhereUniqueWithoutGuideInput = {
    where: GuideTagWhereUniqueInput
    update: XOR<GuideTagUpdateWithoutGuideInput, GuideTagUncheckedUpdateWithoutGuideInput>
    create: XOR<GuideTagCreateWithoutGuideInput, GuideTagUncheckedCreateWithoutGuideInput>
  }

  export type GuideTagUpdateWithWhereUniqueWithoutGuideInput = {
    where: GuideTagWhereUniqueInput
    data: XOR<GuideTagUpdateWithoutGuideInput, GuideTagUncheckedUpdateWithoutGuideInput>
  }

  export type GuideTagUpdateManyWithWhereWithoutGuideInput = {
    where: GuideTagScalarWhereInput
    data: XOR<GuideTagUpdateManyMutationInput, GuideTagUncheckedUpdateManyWithoutGuideInput>
  }

  export type GuideTagScalarWhereInput = {
    AND?: GuideTagScalarWhereInput | GuideTagScalarWhereInput[]
    OR?: GuideTagScalarWhereInput[]
    NOT?: GuideTagScalarWhereInput | GuideTagScalarWhereInput[]
    guideId?: IntFilter<"GuideTag"> | number
    tagId?: IntFilter<"GuideTag"> | number
  }

  export type GuideTagCreateWithoutTagInput = {
    guide: GuideCreateNestedOneWithoutGuideTagsInput
  }

  export type GuideTagUncheckedCreateWithoutTagInput = {
    guideId: number
  }

  export type GuideTagCreateOrConnectWithoutTagInput = {
    where: GuideTagWhereUniqueInput
    create: XOR<GuideTagCreateWithoutTagInput, GuideTagUncheckedCreateWithoutTagInput>
  }

  export type GuideTagCreateManyTagInputEnvelope = {
    data: GuideTagCreateManyTagInput | GuideTagCreateManyTagInput[]
    skipDuplicates?: boolean
  }

  export type GuideTagUpsertWithWhereUniqueWithoutTagInput = {
    where: GuideTagWhereUniqueInput
    update: XOR<GuideTagUpdateWithoutTagInput, GuideTagUncheckedUpdateWithoutTagInput>
    create: XOR<GuideTagCreateWithoutTagInput, GuideTagUncheckedCreateWithoutTagInput>
  }

  export type GuideTagUpdateWithWhereUniqueWithoutTagInput = {
    where: GuideTagWhereUniqueInput
    data: XOR<GuideTagUpdateWithoutTagInput, GuideTagUncheckedUpdateWithoutTagInput>
  }

  export type GuideTagUpdateManyWithWhereWithoutTagInput = {
    where: GuideTagScalarWhereInput
    data: XOR<GuideTagUpdateManyMutationInput, GuideTagUncheckedUpdateManyWithoutTagInput>
  }

  export type GuideCreateWithoutGuideTagsInput = {
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    positiveRatings?: number
    negativeRatings?: number
    content: string
    description?: string | null
    category?: string | null
    visits?: number
    author?: UserCreateNestedOneWithoutGuideInput
  }

  export type GuideUncheckedCreateWithoutGuideTagsInput = {
    id?: number
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    authorId?: number
    positiveRatings?: number
    negativeRatings?: number
    content: string
    description?: string | null
    category?: string | null
    visits?: number
  }

  export type GuideCreateOrConnectWithoutGuideTagsInput = {
    where: GuideWhereUniqueInput
    create: XOR<GuideCreateWithoutGuideTagsInput, GuideUncheckedCreateWithoutGuideTagsInput>
  }

  export type TagCreateWithoutGuideTagsInput = {
    name: string
  }

  export type TagUncheckedCreateWithoutGuideTagsInput = {
    id?: number
    name: string
  }

  export type TagCreateOrConnectWithoutGuideTagsInput = {
    where: TagWhereUniqueInput
    create: XOR<TagCreateWithoutGuideTagsInput, TagUncheckedCreateWithoutGuideTagsInput>
  }

  export type GuideUpsertWithoutGuideTagsInput = {
    update: XOR<GuideUpdateWithoutGuideTagsInput, GuideUncheckedUpdateWithoutGuideTagsInput>
    create: XOR<GuideCreateWithoutGuideTagsInput, GuideUncheckedCreateWithoutGuideTagsInput>
    where?: GuideWhereInput
  }

  export type GuideUpdateToOneWithWhereWithoutGuideTagsInput = {
    where?: GuideWhereInput
    data: XOR<GuideUpdateWithoutGuideTagsInput, GuideUncheckedUpdateWithoutGuideTagsInput>
  }

  export type GuideUpdateWithoutGuideTagsInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    positiveRatings?: IntFieldUpdateOperationsInput | number
    negativeRatings?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    visits?: IntFieldUpdateOperationsInput | number
    author?: UserUpdateOneRequiredWithoutGuideNestedInput
  }

  export type GuideUncheckedUpdateWithoutGuideTagsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    authorId?: IntFieldUpdateOperationsInput | number
    positiveRatings?: IntFieldUpdateOperationsInput | number
    negativeRatings?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    visits?: IntFieldUpdateOperationsInput | number
  }

  export type TagUpsertWithoutGuideTagsInput = {
    update: XOR<TagUpdateWithoutGuideTagsInput, TagUncheckedUpdateWithoutGuideTagsInput>
    create: XOR<TagCreateWithoutGuideTagsInput, TagUncheckedCreateWithoutGuideTagsInput>
    where?: TagWhereInput
  }

  export type TagUpdateToOneWithWhereWithoutGuideTagsInput = {
    where?: TagWhereInput
    data: XOR<TagUpdateWithoutGuideTagsInput, TagUncheckedUpdateWithoutGuideTagsInput>
  }

  export type TagUpdateWithoutGuideTagsInput = {
    name?: StringFieldUpdateOperationsInput | string
  }

  export type TagUncheckedUpdateWithoutGuideTagsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
  }

  export type SolveCreateWithoutProblemInput = {
    sourceCode: string
    uploadedAt?: Date | string
    score: number
    time?: number
    user: UserCreateNestedOneWithoutSolvesInput
  }

  export type SolveUncheckedCreateWithoutProblemInput = {
    id?: number
    userId: number
    sourceCode: string
    uploadedAt?: Date | string
    score: number
    time?: number
  }

  export type SolveCreateOrConnectWithoutProblemInput = {
    where: SolveWhereUniqueInput
    create: XOR<SolveCreateWithoutProblemInput, SolveUncheckedCreateWithoutProblemInput>
  }

  export type SolveCreateManyProblemInputEnvelope = {
    data: SolveCreateManyProblemInput | SolveCreateManyProblemInput[]
    skipDuplicates?: boolean
  }

  export type SolveUpsertWithWhereUniqueWithoutProblemInput = {
    where: SolveWhereUniqueInput
    update: XOR<SolveUpdateWithoutProblemInput, SolveUncheckedUpdateWithoutProblemInput>
    create: XOR<SolveCreateWithoutProblemInput, SolveUncheckedCreateWithoutProblemInput>
  }

  export type SolveUpdateWithWhereUniqueWithoutProblemInput = {
    where: SolveWhereUniqueInput
    data: XOR<SolveUpdateWithoutProblemInput, SolveUncheckedUpdateWithoutProblemInput>
  }

  export type SolveUpdateManyWithWhereWithoutProblemInput = {
    where: SolveScalarWhereInput
    data: XOR<SolveUpdateManyMutationInput, SolveUncheckedUpdateManyWithoutProblemInput>
  }

  export type UserCreateWithoutSolvesInput = {
    username: string
    firstName: string
    lastName: string
    email: string
    emailValidated?: boolean
    userColor?: string
    picture?: string
    role?: $Enums.Role
    createdAt?: Date | string
    activeAt?: Date | string
    password: string
    loginMethod?: string
    occupationType?: $Enums.OccupationType
    projects?: ProjectCreateNestedManyWithoutUserInput
    Guide?: GuideCreateNestedManyWithoutAuthorInput
    Course?: CourseCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSolvesInput = {
    id?: number
    username: string
    firstName: string
    lastName: string
    email: string
    emailValidated?: boolean
    userColor?: string
    picture?: string
    role?: $Enums.Role
    createdAt?: Date | string
    activeAt?: Date | string
    password: string
    loginMethod?: string
    occupationType?: $Enums.OccupationType
    projects?: ProjectUncheckedCreateNestedManyWithoutUserInput
    Guide?: GuideUncheckedCreateNestedManyWithoutAuthorInput
    Course?: CourseUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSolvesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSolvesInput, UserUncheckedCreateWithoutSolvesInput>
  }

  export type ProblemCreateWithoutSolvesInput = {
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    author?: string
    positiveRatings?: number
    negativeRatings?: number
    description?: string | null
    requirement?: NullableJsonNullValueInput | InputJsonValue
    tests?: ProblemCreatetestsInput | InputJsonValue[]
    averageTimeLimit: number
    averageMemLimit: number
    category?: string | null
    sourceCode?: string | null
    difficulty?: $Enums.Difficulty | null
    tags?: ProblemCreatetagsInput | string[]
  }

  export type ProblemUncheckedCreateWithoutSolvesInput = {
    id?: number
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    author?: string
    positiveRatings?: number
    negativeRatings?: number
    description?: string | null
    requirement?: NullableJsonNullValueInput | InputJsonValue
    tests?: ProblemCreatetestsInput | InputJsonValue[]
    averageTimeLimit: number
    averageMemLimit: number
    category?: string | null
    sourceCode?: string | null
    difficulty?: $Enums.Difficulty | null
    tags?: ProblemCreatetagsInput | string[]
  }

  export type ProblemCreateOrConnectWithoutSolvesInput = {
    where: ProblemWhereUniqueInput
    create: XOR<ProblemCreateWithoutSolvesInput, ProblemUncheckedCreateWithoutSolvesInput>
  }

  export type UserUpsertWithoutSolvesInput = {
    update: XOR<UserUpdateWithoutSolvesInput, UserUncheckedUpdateWithoutSolvesInput>
    create: XOR<UserCreateWithoutSolvesInput, UserUncheckedCreateWithoutSolvesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSolvesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSolvesInput, UserUncheckedUpdateWithoutSolvesInput>
  }

  export type UserUpdateWithoutSolvesInput = {
    username?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailValidated?: BoolFieldUpdateOperationsInput | boolean
    userColor?: StringFieldUpdateOperationsInput | string
    picture?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeAt?: DateTimeFieldUpdateOperationsInput | Date | string
    password?: StringFieldUpdateOperationsInput | string
    loginMethod?: StringFieldUpdateOperationsInput | string
    occupationType?: EnumOccupationTypeFieldUpdateOperationsInput | $Enums.OccupationType
    projects?: ProjectUpdateManyWithoutUserNestedInput
    Guide?: GuideUpdateManyWithoutAuthorNestedInput
    Course?: CourseUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSolvesInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailValidated?: BoolFieldUpdateOperationsInput | boolean
    userColor?: StringFieldUpdateOperationsInput | string
    picture?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeAt?: DateTimeFieldUpdateOperationsInput | Date | string
    password?: StringFieldUpdateOperationsInput | string
    loginMethod?: StringFieldUpdateOperationsInput | string
    occupationType?: EnumOccupationTypeFieldUpdateOperationsInput | $Enums.OccupationType
    projects?: ProjectUncheckedUpdateManyWithoutUserNestedInput
    Guide?: GuideUncheckedUpdateManyWithoutAuthorNestedInput
    Course?: CourseUncheckedUpdateOneWithoutUserNestedInput
  }

  export type ProblemUpsertWithoutSolvesInput = {
    update: XOR<ProblemUpdateWithoutSolvesInput, ProblemUncheckedUpdateWithoutSolvesInput>
    create: XOR<ProblemCreateWithoutSolvesInput, ProblemUncheckedCreateWithoutSolvesInput>
    where?: ProblemWhereInput
  }

  export type ProblemUpdateToOneWithWhereWithoutSolvesInput = {
    where?: ProblemWhereInput
    data: XOR<ProblemUpdateWithoutSolvesInput, ProblemUncheckedUpdateWithoutSolvesInput>
  }

  export type ProblemUpdateWithoutSolvesInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    author?: StringFieldUpdateOperationsInput | string
    positiveRatings?: IntFieldUpdateOperationsInput | number
    negativeRatings?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    requirement?: NullableJsonNullValueInput | InputJsonValue
    tests?: ProblemUpdatetestsInput | InputJsonValue[]
    averageTimeLimit?: FloatFieldUpdateOperationsInput | number
    averageMemLimit?: FloatFieldUpdateOperationsInput | number
    category?: NullableStringFieldUpdateOperationsInput | string | null
    sourceCode?: NullableStringFieldUpdateOperationsInput | string | null
    difficulty?: NullableEnumDifficultyFieldUpdateOperationsInput | $Enums.Difficulty | null
    tags?: ProblemUpdatetagsInput | string[]
  }

  export type ProblemUncheckedUpdateWithoutSolvesInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    author?: StringFieldUpdateOperationsInput | string
    positiveRatings?: IntFieldUpdateOperationsInput | number
    negativeRatings?: IntFieldUpdateOperationsInput | number
    description?: NullableStringFieldUpdateOperationsInput | string | null
    requirement?: NullableJsonNullValueInput | InputJsonValue
    tests?: ProblemUpdatetestsInput | InputJsonValue[]
    averageTimeLimit?: FloatFieldUpdateOperationsInput | number
    averageMemLimit?: FloatFieldUpdateOperationsInput | number
    category?: NullableStringFieldUpdateOperationsInput | string | null
    sourceCode?: NullableStringFieldUpdateOperationsInput | string | null
    difficulty?: NullableEnumDifficultyFieldUpdateOperationsInput | $Enums.Difficulty | null
    tags?: ProblemUpdatetagsInput | string[]
  }

  export type UserCreateWithoutCourseInput = {
    username: string
    firstName: string
    lastName: string
    email: string
    emailValidated?: boolean
    userColor?: string
    picture?: string
    role?: $Enums.Role
    createdAt?: Date | string
    activeAt?: Date | string
    password: string
    loginMethod?: string
    occupationType?: $Enums.OccupationType
    projects?: ProjectCreateNestedManyWithoutUserInput
    solves?: SolveCreateNestedManyWithoutUserInput
    Guide?: GuideCreateNestedManyWithoutAuthorInput
  }

  export type UserUncheckedCreateWithoutCourseInput = {
    id?: number
    username: string
    firstName: string
    lastName: string
    email: string
    emailValidated?: boolean
    userColor?: string
    picture?: string
    role?: $Enums.Role
    createdAt?: Date | string
    activeAt?: Date | string
    password: string
    loginMethod?: string
    occupationType?: $Enums.OccupationType
    projects?: ProjectUncheckedCreateNestedManyWithoutUserInput
    solves?: SolveUncheckedCreateNestedManyWithoutUserInput
    Guide?: GuideUncheckedCreateNestedManyWithoutAuthorInput
  }

  export type UserCreateOrConnectWithoutCourseInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCourseInput, UserUncheckedCreateWithoutCourseInput>
  }

  export type UserUpsertWithoutCourseInput = {
    update: XOR<UserUpdateWithoutCourseInput, UserUncheckedUpdateWithoutCourseInput>
    create: XOR<UserCreateWithoutCourseInput, UserUncheckedCreateWithoutCourseInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCourseInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCourseInput, UserUncheckedUpdateWithoutCourseInput>
  }

  export type UserUpdateWithoutCourseInput = {
    username?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailValidated?: BoolFieldUpdateOperationsInput | boolean
    userColor?: StringFieldUpdateOperationsInput | string
    picture?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeAt?: DateTimeFieldUpdateOperationsInput | Date | string
    password?: StringFieldUpdateOperationsInput | string
    loginMethod?: StringFieldUpdateOperationsInput | string
    occupationType?: EnumOccupationTypeFieldUpdateOperationsInput | $Enums.OccupationType
    projects?: ProjectUpdateManyWithoutUserNestedInput
    solves?: SolveUpdateManyWithoutUserNestedInput
    Guide?: GuideUpdateManyWithoutAuthorNestedInput
  }

  export type UserUncheckedUpdateWithoutCourseInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailValidated?: BoolFieldUpdateOperationsInput | boolean
    userColor?: StringFieldUpdateOperationsInput | string
    picture?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activeAt?: DateTimeFieldUpdateOperationsInput | Date | string
    password?: StringFieldUpdateOperationsInput | string
    loginMethod?: StringFieldUpdateOperationsInput | string
    occupationType?: EnumOccupationTypeFieldUpdateOperationsInput | $Enums.OccupationType
    projects?: ProjectUncheckedUpdateManyWithoutUserNestedInput
    solves?: SolveUncheckedUpdateManyWithoutUserNestedInput
    Guide?: GuideUncheckedUpdateManyWithoutAuthorNestedInput
  }

  export type ProjectCreateManyUserInput = {
    id?: number
    name: string
    fileUUID: string
    createdAt?: Date | string
  }

  export type SolveCreateManyUserInput = {
    id?: number
    problemid: number
    sourceCode: string
    uploadedAt?: Date | string
    score: number
    time?: number
  }

  export type GuideCreateManyAuthorInput = {
    id?: number
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    positiveRatings?: number
    negativeRatings?: number
    content: string
    description?: string | null
    category?: string | null
    visits?: number
  }

  export type ProjectUpdateWithoutUserInput = {
    name?: StringFieldUpdateOperationsInput | string
    fileUUID?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProjectUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    fileUUID?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProjectUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    fileUUID?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SolveUpdateWithoutUserInput = {
    sourceCode?: StringFieldUpdateOperationsInput | string
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    score?: IntFieldUpdateOperationsInput | number
    time?: IntFieldUpdateOperationsInput | number
    problem?: ProblemUpdateOneRequiredWithoutSolvesNestedInput
  }

  export type SolveUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    problemid?: IntFieldUpdateOperationsInput | number
    sourceCode?: StringFieldUpdateOperationsInput | string
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    score?: IntFieldUpdateOperationsInput | number
    time?: IntFieldUpdateOperationsInput | number
  }

  export type SolveUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    problemid?: IntFieldUpdateOperationsInput | number
    sourceCode?: StringFieldUpdateOperationsInput | string
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    score?: IntFieldUpdateOperationsInput | number
    time?: IntFieldUpdateOperationsInput | number
  }

  export type GuideUpdateWithoutAuthorInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    positiveRatings?: IntFieldUpdateOperationsInput | number
    negativeRatings?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    visits?: IntFieldUpdateOperationsInput | number
    guideTags?: GuideTagUpdateManyWithoutGuideNestedInput
  }

  export type GuideUncheckedUpdateWithoutAuthorInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    positiveRatings?: IntFieldUpdateOperationsInput | number
    negativeRatings?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    visits?: IntFieldUpdateOperationsInput | number
    guideTags?: GuideTagUncheckedUpdateManyWithoutGuideNestedInput
  }

  export type GuideUncheckedUpdateManyWithoutAuthorInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    positiveRatings?: IntFieldUpdateOperationsInput | number
    negativeRatings?: IntFieldUpdateOperationsInput | number
    content?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    visits?: IntFieldUpdateOperationsInput | number
  }

  export type GuideTagCreateManyGuideInput = {
    tagId: number
  }

  export type GuideTagUpdateWithoutGuideInput = {
    tag?: TagUpdateOneRequiredWithoutGuideTagsNestedInput
  }

  export type GuideTagUncheckedUpdateWithoutGuideInput = {
    tagId?: IntFieldUpdateOperationsInput | number
  }

  export type GuideTagUncheckedUpdateManyWithoutGuideInput = {
    tagId?: IntFieldUpdateOperationsInput | number
  }

  export type GuideTagCreateManyTagInput = {
    guideId: number
  }

  export type GuideTagUpdateWithoutTagInput = {
    guide?: GuideUpdateOneRequiredWithoutGuideTagsNestedInput
  }

  export type GuideTagUncheckedUpdateWithoutTagInput = {
    guideId?: IntFieldUpdateOperationsInput | number
  }

  export type GuideTagUncheckedUpdateManyWithoutTagInput = {
    guideId?: IntFieldUpdateOperationsInput | number
  }

  export type SolveCreateManyProblemInput = {
    id?: number
    userId: number
    sourceCode: string
    uploadedAt?: Date | string
    score: number
    time?: number
  }

  export type SolveUpdateWithoutProblemInput = {
    sourceCode?: StringFieldUpdateOperationsInput | string
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    score?: IntFieldUpdateOperationsInput | number
    time?: IntFieldUpdateOperationsInput | number
    user?: UserUpdateOneRequiredWithoutSolvesNestedInput
  }

  export type SolveUncheckedUpdateWithoutProblemInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    sourceCode?: StringFieldUpdateOperationsInput | string
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    score?: IntFieldUpdateOperationsInput | number
    time?: IntFieldUpdateOperationsInput | number
  }

  export type SolveUncheckedUpdateManyWithoutProblemInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    sourceCode?: StringFieldUpdateOperationsInput | string
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    score?: IntFieldUpdateOperationsInput | number
    time?: IntFieldUpdateOperationsInput | number
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}