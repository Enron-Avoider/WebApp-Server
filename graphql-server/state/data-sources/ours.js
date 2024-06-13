const { RESTDataSource } = require("apollo-datasource-rest");
const { ObjectId } = require("mongodb");
const { customAlphabet, urlAlphabet } = require("nanoid");

const { EODDataMaps, OursDataMaps } = require("../data-maps");
const mathToMongo = require("../utils/mathToMongo");
const chunkUp = require("../utils/chunkUp");

module.exports = {
  Ours: class extends RESTDataSource {
    constructor(mongoDB) {
      super();

      this.keys = {};

      this.mongoDBStocksTable = mongoDB.collection("Stocks");
      this.mongoDBRatioCollectionTable = mongoDB.collection("RatioCollection");
      this.mongoDBUsersCollectionTable = mongoDB.collection("Users");
      this.mongoDBAggregationsCacheTable = mongoDB.collection(
        "AggregationsCache"
      );
    }

    searchStocks = async ({ name }) => {
      const stocksInDB = await this.mongoDBStocksTable
        .find(
          // {
          //   is_in_exchange_country: true,
          //   $or: [
          //     { code: { $regex: name, $options: "i" } },
          //     { name: { $regex: name, $options: "i" } },
          //   ],
          // },
          { $text: { $search: name }, is_in_exchange_country: true },
          { name: 1, code: 1, market_capitalization: 1, EODExchange: 1 }
        )
        .sort({ market_capitalization: -1 })
        .limit(10)
        .toArray();

      return stocksInDB;
    };

    getStockByCode = async ({ code }) => {
      const [Ticker, EODExchange] = code.split(".");

      const stockInDB = await this.mongoDBStocksTable.findOne({
        code: Ticker,
        ...(EODExchange && { EODExchange }),
        is_in_exchange_country: true,
      });

      return stockInDB
        ? {
          ...stockInDB,
          // weird fix for when the logo string is an object for some unknown reason
          logo: typeof stockInDB.logo === "object" ? null : stockInDB.logo,
        }
        : null;
    };

    getLastYearCounts = async ({ query }) => {
      const lastYear = new Date().getFullYear() - 1;

      console.log("getLastYearCounts for", lastYear)

      const counts = async () =>
        await this.mongoDBStocksTable
          .aggregate([
            {
              $match: {
                ...query,
                "yearlyFinancialsByYear.year": {
                  $in: [`${lastYear}`],
                },
                is_in_exchange_country: true,
              },
            },
            {
              $facet: {
                ...["country", "industry", "sector", "exchange"].reduce(
                  (p, c) => ({
                    ...p,
                    [c]: [
                      {
                        $group: {
                          _id: `$${c}`,
                          count: {
                            $sum: 1,
                          },
                        },
                      },
                      { $sort: { count: -1 } },
                    ],
                  }),
                  {}
                ),
              },
            },
          ])
          .toArray();

      const countsMaybeCached = await this.getAggregationThroughCacheIfPossible({
        cacheQuery: {
          type: "lastYearCounts",
          query,
        },
        getUncachedAggregationFn: counts,
        getUncachedAggregationParameters: {
          query
        }
      });

      return {
        query,
        counts: countsMaybeCached[0],
      };
    };

    getAggregateForFinancialRows = async ({
      query,
      companiesForRow, // a financial row, only one at a time due to resource intensity, but we could try adding more
    }) => {

      console.log("getAggregateForFinancialRows", { query, companiesForRow });

      const getSomeFinancialRows = async ({
        rowKeysPathsBatch,
        companiesForRow,
      }) => {

        console.log("getSomeFinancialRows", { query, rowKeysPathsBatch, companiesForRow });

        const getSomeFinancialRowsAggregation = [
          {
            $match: {
              ...query,
              is_in_exchange_country: true,
            },
          },
          {
            $unwind: {
              path: "$yearlyFinancialsByYear",
            },
          },
          {
            $facet: {
              ...rowKeysPathsBatch
                .map((k) => ({
                  fieldName: k.replace(/\./g, "_"),
                  path: `yearlyFinancialsByYear.${k}.v`,
                }))
                .reduce(
                  (p, { fieldName, path }) => ({
                    ...p,
                    [fieldName]: [
                      {
                        $project: {
                          name: 1,
                          code: 1,
                          EODExchange: 1,
                          "yearlyFinancialsByYear.year": 1,
                          [path]: { $toDecimal: `$${path}` },
                        },
                      },
                      {
                        $match: { [path]: { $lt: 10000000000000 } } // weeds out bad data
                      },
                      {
                        $sort: {
                          [path]: -1,
                        },
                      },
                      {
                        $group: {
                          _id: {
                            year: "$yearlyFinancialsByYear.year",
                          },
                          count: {
                            $sum: 1,
                          },
                          sum: {
                            $sum: `$${path}`
                          },
                          avg: {
                            $avg: `$${path}`
                          },
                          max: {
                            $max: `$${path}`
                          },
                          min: {
                            $min: `$${path}`
                          },
                          median: {
                            $median: {
                              input: `$${path}`,
                              method: "approximate"
                            }
                          },
                          companies: {
                            $push: {
                              company: "$name",
                              code: "$code",
                              EODExchange: "$EODExchange",
                              v: { $divide: [`$${path}`, 10000000] }
                            },
                          },
                        },
                      },
                      {
                        $sort: {
                          "_id.year": -1,
                        },
                      },
                      {
                        $addFields: {
                          range: {
                            $toInt: {
                              $divide: [
                                {
                                  $subtract: [
                                    {
                                      $toInt: {
                                        $divide: ["$max", 10000000]
                                      }
                                    },
                                    {
                                      $toInt: {
                                        $divide: ["$min", 10000000]
                                      }
                                    }
                                  ]
                                },
                                9
                              ]
                            }
                          }
                        }
                      },
                      {
                        $addFields: {
                          ranges: {
                            $cond: {
                              if: {
                                $gt: ["$range", 0]
                              },
                              then: {
                                $range: [
                                  {
                                    $toInt: {
                                      $divide: ["$min", 10000000]
                                    }
                                  },
                                  {
                                    $toInt: {
                                      $divide: ["$max", 10000000]
                                    }
                                  },
                                  "$range"
                                ]
                              },
                              else: []
                            }
                          }
                        }
                      },
                      {
                        $addFields: {
                          ranges: {
                            $map: {
                              input: "$ranges",
                              as: "r",
                              in: {
                                min: "$$r",
                                max: {
                                  $add: ["$$r", "$range"]
                                }
                              }
                            }
                          }
                        }
                      },
                      {
                        $addFields: {
                          ranges: {
                            $map: {
                              input: "$ranges",
                              as: "r",
                              in: {
                                range: ["$$r.min", "$$r.max"],
                                companies: {
                                  $size: {
                                    $filter: {
                                      input: "$companies",
                                      as: "c",
                                      cond: {
                                        $and: [
                                          {
                                            $gt: ["$$c.v", "$$r.min"]
                                          },
                                          {
                                            $lt: ["$$c.v", "$$r.max"]
                                          }
                                        ]
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      {
                        $addFields: {
                          companies: {
                            $map: {
                              input: "$companies",
                              as: "c",
                              in: {
                                company: "$$c.company",
                                code: "$$c.code",
                                EODExchange: "$$c.EODExchange",
                                v: { $multiply: ["$$c.v", 10000000] }
                              }
                            }
                          }
                        }
                      },
                      ...(!companiesForRow
                        ? [
                          {
                            $addFields: {
                              companies: { $size: "$companies" },
                            },
                          },
                        ]
                        : [])
                    ],
                  }),
                  {}
                ),
            },
          },
        ];

        // console.dir(getSomeFinancialRowsAggregation, { depth: null });

        return (
          await this.mongoDBStocksTable
            .aggregate(
              getSomeFinancialRowsAggregation,
              { allowDiskUse: true }
            )
            .toArray()
        )[0];
      }

      const getAllFinancialRows = async ({
        query,
        companiesForRow,
      }) => {
        const rowKeysPathsBatches = chunkUp(
          EODDataMaps.rowKeysPaths.filter(
            (k) => !companiesForRow || companiesForRow === k
          ),
          5
        );

        return await rowKeysPathsBatches.reduce(
          async (accUnresolved, batch, i) => {
            const accResolved = await accUnresolved;

            const batchResults = await this.getAggregationThroughCacheIfPossible(
              {
                cacheQuery: {
                  type: "someFinancialRows",
                  query,
                  rowKeysPathsBatch: batch,
                  companiesForRow,
                },
                getUncachedAggregationFn: getSomeFinancialRows,
                getUncachedAggregationParameters: {
                  rowKeysPathsBatch: batch,
                  companiesForRow,
                },
                updateAlways: true
              }
            );

            return {
              ...accResolved,
              ...batchResults,
            };
          },
          {}
        );
      };

      const financialRows = Object.keys(query).length
        ? await this.getAggregationThroughCacheIfPossible({
          cacheQuery: {
            type: "allFinancialRows",
            query,
            companiesForRow,
          },
          getUncachedAggregationFn: getAllFinancialRows,
          getUncachedAggregationParameters: {
            query,
            companiesForRow,
          }
        })
        : {};

      return {
        query,
        financialRows,
      };
    };

    getAggregateForCalcRows = async ({
      query,
      //   calcs,
      collectionId,
      companiesForRow,
    }) => {

      if (collectionId) {

        const collection = (
          await this.mongoDBRatioCollectionTable
            .find({
              id: collectionId,
            })
            .toArray()
        )[0];

        const getCalcRows = async ({
          query,
          companiesForRow,
          calcs,
        }) => {
          const calcs_ = calcs
            .filter((c) => !companiesForRow || companiesForRow === c.title)
            .map((c) => {

              const paths = Object.values(c.scope).reduce(
                (acc, v) => {
                  if (!v.scope) {
                    return [
                      ...acc,
                      (v.includes('[y-1]') ? `__yearlyFinancialsByYear` : `yearlyFinancialsByYear`) + `.${v.replace('[y-1]', '')}.v`
                    ]
                  } else {
                    return [...acc, ...Object.entries(v.scope)?.map(([k_, v_]) => {
                      if (v_.scope) { // 2nd level of another calc
                        return [
                          ...Object.entries(v_.scope)?.map(([k__, v__]) => {
                            return (v__.includes('[y-1]') ? `__yearlyFinancialsByYear` : `yearlyFinancialsByYear`) + `.${v__.replace('[y-1]', '')}.v`
                          })
                        ];
                      } else {
                        return (v_.includes('[y-1]') ? `__yearlyFinancialsByYear` : `yearlyFinancialsByYear`) + `.${v_.replace('[y-1]', '')}.v`
                      }
                    }).flat(Infinity)];
                  }
                }, []
              );

              const isUpperCase = (string) => /^[A-Z]*$/.test(string);
              const isLowerCase = (string) => /^[a-z]*$/.test(string);
              const alphabet = new Array(26).fill(1).map((_, i) => String.fromCharCode(97 + i));

              const calcWithOtherCalcs = Array.from(c.calc)?.reduce((acc, letter, i) => {
                if (c.scope?.[letter]?.scope !== undefined) {
                  return [...acc, "(", ...Array.from(c.scope?.[letter]?.calc)?.map((letter_, ii) => {
                    if (c.scope?.[letter]?.scope[letter_]?.scope !== undefined) {
                      return ["(", ...Array.from(c.scope?.[letter]?.scope[letter_]?.calc)?.map((letter__, iii) => {
                        return isLowerCase(letter__) ? 'a' : isUpperCase(letter__) && letter__ === 'M' ? 'M(' : letter__
                      }), ")"].join("");
                    } else {
                      return isLowerCase(letter_) ? 'a' : isUpperCase(letter_) && letter_ === 'M' ? 'M(' : letter_
                    }
                  }), ")"].join("");
                } else { //direct calcs
                  return [...acc, isLowerCase(letter) ? 'a' : isUpperCase(letter) && letter === 'M' ? 'M(' : letter];
                }
              }, [])
                .reduce((acc, l, i) => {
                  return {
                    calc: [...acc.calc, isLowerCase(l) ? alphabet[acc.count] : l],
                    count: acc.count + (isLowerCase(l) ? 1 : 0)
                  }
                }, { calc: [], count: 0 })
                ?.calc
                ?.join("");


              const calc = mathToMongo(
                calcWithOtherCalcs,
                paths.map((p) => `$${p}`)
              );

              return {
                fieldName: c.title.replace(/\./g, "_"),
                calc,
                l: paths.length,
              };
            })
            .filter(c => c.calc !== 'error')
          //.splice(0,1);

          // console.dir(calcs_, { depth: null });

          const lastYear = new Date().getFullYear() - 1;
          const aggregation = [
            {
              $match: {
                ...query,
                "yearlyFinancialsByYear.year": {
                  $in: [`${lastYear}`],
                },
                is_in_exchange_country: true,
              },
            },
            {
              $addFields: {
                // by previous year
                _yearlyFinancialsByYear: "$yearlyFinancialsByYear",
              }
            },
            {
              $unwind: {
                path: "$yearlyFinancialsByYear",
              },
            },
            {
              $addFields: {
                // by previous year
                __yearlyFinancialsByYear: {
                  $first: {
                    $filter: {
                      input: "$_yearlyFinancialsByYear",
                      as: "list",
                      cond: { $eq: ["$$list.year", `${lastYear - 1}`] } //<-- filter sub-array based on condition
                    }
                  }
                }
              }
            },
            {
              $addFields: {
                ...calcs_.reduce(
                  (p, { fieldName, calc }) => ({
                    ...p,
                    [`calc_${fieldName}`]: calc,
                  }),
                  {}
                ),
              },
            },
            {
              $facet: {
                ...calcs_.reduce(
                  (p, { fieldName, calc }) => ({
                    ...p,
                    [`calc_${fieldName}`]: [
                      {
                        $project: {
                          name: 1,
                          code: 1,
                          EODExchange: 1,
                          "yearlyFinancialsByYear.year": 1,
                          [`calc_${fieldName}`]: {
                            $toDecimal: `$calc_${fieldName}`,
                          },
                          //   [path]: { $toDecimal: `$${path}` },
                        },
                      },
                      {
                        $match: { [`calc_${fieldName}`]: { $lt: 10000000000000 } } // weeds out bad data
                      },
                      {
                        $sort: {
                          [`calc_${fieldName}`]: -1,
                        },
                      },
                      {
                        $group: {
                          _id: {
                            year: "$yearlyFinancialsByYear.year",
                          },
                          count: {
                            $sum: 1,
                          },
                          sum: {
                            $sum: `$${`calc_${fieldName}`}`,
                          },
                          avg: {
                            $avg: `$${`calc_${fieldName}`}`,
                          },
                          max: {
                            $max: `$${`calc_${fieldName}`}`,
                          },
                          min: {
                            $min: `$${`calc_${fieldName}`}`,
                          },
                          median: {
                            $median: {
                              input: `$${`calc_${fieldName}`}`,
                              method: "approximate"
                            }
                          },
                          companies: {
                            $push: {
                              company: "$name",
                              code: "$code",
                              EODExchange: "$EODExchange",
                              v: `$${`calc_${fieldName}`}`
                            },
                          },
                        },
                      },
                      {
                        $sort: {
                          "_id.year": -1,
                        },
                      },
                      {
                        $addFields: {
                          range: {
                            $subtract: ["$max", "$min"]
                          }
                        }
                      },
                      {
                        $addFields: {
                          rangeStep: {
                            $divide: ["$range", 20]
                          }
                        }
                      },
                      {
                        '$addFields': {
                          rangeStep: {
                            $cond: {
                              if: {
                                $and: [
                                  {
                                    $gt: ["$range", 10000000]
                                  }
                                ]
                              },
                              then: {
                                '$cond': {
                                  if: {
                                    '$eq': [
                                      {
                                        '$toInt':
                                          { $divide: ['$rangeStep', 100000] }
                                      },
                                      0
                                    ]
                                  },
                                  then: 1,
                                  else: '$rangeStep'
                                }
                              },
                              else: {
                                '$cond': {
                                  if: {
                                    '$eq': [
                                      {
                                        $toInt: {
                                          $multiply: [
                                            "$rangeStep",
                                            100
                                          ]
                                        }
                                      },
                                      0
                                    ]
                                  },
                                  then: 1,
                                  else: '$rangeStep'
                                }
                              }
                            }
                          }
                        }
                      },
                      {
                        $addFields: {
                          ranges: {
                            $cond: {
                              if: {
                                $and: [
                                  {
                                    $gt: ["$range", 10000000]
                                  }
                                ]
                              },
                              then: {
                                $range: [
                                  {
                                    $toInt: {
                                      $divide: ["$min", 100000]
                                    }
                                  },
                                  {
                                    $toInt: {
                                      $divide: ["$max", 100000]
                                    }
                                  },
                                  {
                                    $toInt: {
                                      $divide: [
                                        "$rangeStep",
                                        100000
                                      ]
                                    }
                                  }
                                ]
                              },
                              else: {
                                $range: [
                                  {
                                    $toInt: {
                                      $multiply: ["$min", 100]
                                    }
                                  },
                                  {
                                    $toInt: {
                                      $multiply: ["$max", 100]
                                    }
                                  },
                                  {
                                    $toInt: {
                                      $multiply: [
                                        "$rangeStep",
                                        100
                                      ]
                                    }
                                  }
                                ]
                              }
                            }
                          },
                          companies: {
                            $cond: {
                              if: {
                                $gt: ["$range", 10000000]
                              },
                              then: {
                                $map: {
                                  input: "$companies",
                                  as: "c",
                                  in: {
                                    company: "$$c.company",
                                    code: "$$c.code",
                                    EODExchange: "$$c.EODExchange",
                                    v: { $divide: ["$$c.v", 100000] }
                                  }
                                }
                              },
                              else: {
                                $map: {
                                  input: "$companies",
                                  as: "c",
                                  in: {
                                    company: "$$c.company",
                                    code: "$$c.code",
                                    EODExchange: "$$c.EODExchange",
                                    v: { $multiply: ["$$c.v", 100] }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      {
                        $addFields: {
                          ranges: {
                            '$cond': {
                              if: {
                                '$gt': ['$range', 10000000]
                              },
                              then: {
                                '$map': {
                                  input: '$ranges',
                                  as: 'r',
                                  in: { min: '$$r', max: { '$add': ['$$r', { '$divide': ['$rangeStep', 100000] }] } }
                                }
                              },
                              else: {
                                '$map': {
                                  input: '$ranges',
                                  as: 'r',
                                  in: { min: '$$r', max: { '$add': ['$$r', { '$multiply': ['$rangeStep', 100] }] } }
                                }
                              }
                            }
                          }
                        }
                      },

                      {
                        $addFields: {
                          ranges: {
                            '$cond': {
                              if: {
                                '$gt': ['$range', 10000000]
                              },
                              then: {
                                $map: {
                                  input: "$ranges",
                                  as: "r",
                                  in: {
                                    range: [{ $multiply: ["$$r.min", 100000] }, { $multiply: ["$$r.max", 100000] }],
                                    companies: {
                                      $size: {
                                        $filter: {
                                          input: "$companies",
                                          as: "c",
                                          cond: {
                                            $and: [
                                              {
                                                $gt: ["$$c.v", "$$r.min"]
                                              },
                                              {
                                                $lt: ["$$c.v", "$$r.max"]
                                              }
                                            ]
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              else: {
                                $map: {
                                  input: "$ranges",
                                  as: "r",
                                  in: {
                                    range: [{ $divide: ["$$r.min", 100] }, { $divide: ["$$r.max", 100] }],
                                    companies: {
                                      $size: {
                                        $filter: {
                                          input: "$companies",
                                          as: "c",
                                          cond: {
                                            $and: [
                                              {
                                                $gt: ["$$c.v", "$$r.min"]
                                              },
                                              {
                                                $lt: ["$$c.v", "$$r.max"]
                                              }
                                            ]
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      {
                        $addFields: {
                          companies: {
                            $cond: {
                              if: {
                                $gt: ["$range", 10000000]
                              },
                              then: {
                                $map: {
                                  input: "$companies",
                                  as: "c",
                                  in: {
                                    company: "$$c.company",
                                    code: "$$c.code",
                                    EODExchange: "$$c.EODExchange",
                                    v: { $multiply: ["$$c.v", 100000] }
                                  }
                                }
                              },
                              else: {
                                $map: {
                                  input: "$companies",
                                  as: "c",
                                  in: {
                                    company: "$$c.company",
                                    code: "$$c.code",
                                    EODExchange: "$$c.EODExchange",
                                    v: { $divide: ["$$c.v", 100] }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },


                      ...(!companiesForRow
                        ? [
                          {
                            $addFields: {
                              companies: { $size: "$companies" },
                            },
                          },
                        ]
                        : [])
                    ],
                  }),
                  {}
                ),
              },
            },
          ];

          console.dir(aggregation, { depth: null });

          return (
            await this.mongoDBStocksTable
              .aggregate(aggregation)
              .toArray()
          )[0];
        };

        const calcRows = Object.keys(query).length
          ? await this.getAggregationThroughCacheIfPossible({
            cacheQuery: {
              type: "calcRows",
              query,
              companiesForRow,
              collectionId,
              calcs: collection.calcs,
            },
            getUncachedAggregationFn: getCalcRows,
            getUncachedAggregationParameters: {
              query,
              companiesForRow,
              calcs: collection.calcs,
            },
            updateAlways: true
          })
          : {};

        // const calcRows = await getCalcRows({
        //   query,
        //   companiesForRow,
        //   calcs: collection.calcs,
        // });

        return {
          query,
          collectionId,
          // calcs: collection.calcs,
          calcRows
        };
      } else {
        return {
          query,
          collectionId,
          // calcs: collection.calcs,
          calcRows: [],
        };
      }
    };

    getAllExchanges = async () => {
      // TODO
    };

    getAllIndustries = async () => {
      // TODO
    };

    getDistinctStockNames = async () => {
      const getDistinctStockNames = await this.mongoDBStocksTable.distinct(
        "name"
      );

      return {
        count: getDistinctStockNames.length,
        names: getDistinctStockNames,
      };
    };

    removeEmptyAndDuplicates = async () => {
      const dupes = await this.mongoDBStocksTable
        .aggregate([
          {
            $group: {
              _id: {
                code: "$code",
                EODExchange: "$EODExchange",
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              count: -1,
            },
          },
          {
            $match: {
              count: {
                $gt: 1,
              },
            },
          },
        ])
        .toArray();

      //   const empties = await this.mongoDBStocksTable
      //     .find({ code: { $exists: false } })
      //     .toArray();

      //   const removeEmpties = await this.mongoDBStocksTable
      //     .remove({ code: { $exists: false } });

      const dupesLoop = await dupes.reduce(async (accUnresolved, dupe, i) => {
        const accResolved = await accUnresolved;

        await new Promise((t) => setTimeout(t, 10));

        const stockInDB = (
          await this.mongoDBStocksTable
            .find({
              code: dupe._id.code,
              EODExchange: dupe._id.EODExchange,
            })
            .toArray()
        )[0];

        // const removeDupe = await this.mongoDBStocksTable.remove({
        //   _id: ObjectId(stockInDB._id),
        // });

        console.log({
          progress: `${i} / ${dupes.length}`,
          dupe,
          stockInDB: ObjectId(stockInDB._id),
        });

        return [...accResolved, dupe];
      }, []);

      return {
        count: dupes.length,
        dupes,
      };
    };

    getRatioCollections = async ({ userId }) => {
      return (await this.mongoDBRatioCollectionTable.find().toArray()).map(
        (c) => ({
          ...c,
          isOwnedByUser: userId === c.ownerUserId,
        })
      );
    };

    getUniqueNanoid = async (table, length = 2) => {
      const nanoid = customAlphabet(urlAlphabet, length)();

      const nanoidInDB = (
        await table
          .find({
            id: nanoid,
          })
          .toArray()
      )[0];

      if (!!nanoidInDB) {
        console.log(`${nanoid} already used`);
        return this.getUniqueNanoid(table);
      } else {
        return nanoid;
      }
    };

    saveRatioCollection = async ({ ratioCollection, userId }) => {

      console.log({
        ratioCollection,
        userId
      })

      const ratioCollectionInDB =
        ratioCollection.id &&
        (
          await this.mongoDBRatioCollectionTable
            .find({
              id: ratioCollection.id,
            })
            .toArray()
        )[0];

      const newNanoid = await this.getUniqueNanoid(
        this.mongoDBRatioCollectionTable
      );

      if (!!ratioCollectionInDB) {
        if (userId === ratioCollectionInDB.ownerUserId) {
          const updated = await this.mongoDBRatioCollectionTable.updateOne(
            { _id: ratioCollectionInDB._id },
            { $set: { ...ratioCollection } }
          );
          console.log(`updated ${ratioCollection.name} ${ratioCollection.id}`);
        } else {
          console.log(
            `${userId} not authorised for ${ratioCollection.name} ${ratioCollection.id}`
          );
        }
      } else {
        const created = await this.mongoDBRatioCollectionTable.insertOne({
          ...ratioCollection,
          id: newNanoid,
          ownerUserId: userId,
        });
        console.log(`created ${ratioCollection.name} ${newNanoid}`);
      }

      return {
        ...ratioCollection,
        id: !!ratioCollectionInDB ? ratioCollectionInDB.id : newNanoid,
        // isOwnedByPlatform: 'TODO',
        // isOwnedByUser: 'TODO'
      };
    };

    getUserById = async ({ id }) =>
      !!id &&
      (
        await this.mongoDBUsersCollectionTable
          .find({
            id,
          })
          .toArray()
      )[0];

    isAdmin = async ({ id }) =>
      (await this.getUserById({ id })).isPlatformAdmin;

    saveUser = async ({ user, userId }) => {
      const isAdmin = await this.isAdmin({ id: userId });

      const userInDB = await this.getUserById({ id: user.id });

      const newNanoid = await this.getUniqueNanoid(
        this.mongoDBUsersCollectionTable,
        10
      );

      if (!!userInDB && isAdmin) {
        const updated = await this.mongoDBUsersCollectionTable.updateOne(
          { _id: userInDB._id },
          { $set: { ...user } }
        );
        console.log(`updated ${user.name} ${user.id}`);
      } else if (isAdmin) {
        const created = await this.mongoDBUsersCollectionTable.insertOne({
          ...user,
          id: newNanoid,
        });
        console.log(`created ${user.name} ${newNanoid}`);
      }

      return {
        ...(isAdmin && {
          ...user,
          id: !!userInDB ? userInDB.id : newNanoid,
        }),
      };
    };

    getRows = async ({ }) => OursDataMaps.rowKeysPaths;

    getRowsWithCounts = async ({ }) => {

      const lastYear = new Date().getFullYear() - 1;

      // console.log("getLastYearCounts for >", lastYear)

      const agg = [
        {
          $match: {
            // ...query,
            "yearlyFinancialsByYear.year": {
              $in: [`${lastYear}`],
            },
            is_in_exchange_country: true,
          },
        },
        {
          $facet: {
            ...OursDataMaps.rowKeysPaths.reduce(
              (p, c) => ({
                ...p,
                [c.replaceAll(".","_")]: [
                  {
                    $match: {
                      [`yearlyFinancialsWithKeys.${c}`]: { $exists: true }
                    },
                  },
                  {
                    $count: "count"
                  },
                  { $sort: { count: -1 } },
                ],
              }),
              {}
            ),
          },
        },
      ]

      console.dir(agg, { depth: null });
      const counts = async () =>
        await this.mongoDBStocksTable
          .aggregate(agg)
          .toArray();

      const counts_ = await counts();

      console.log(counts_);

      return counts_;
    }

    getAggregationThroughCacheIfPossible = async ({
      cacheQuery,
      getUncachedAggregationFn,
      getUncachedAggregationParameters,
      updateAlways = false,
    }) => {
      const aggregationInDB = (
        await this.mongoDBAggregationsCacheTable
          .find({
            cacheQuery,
          })
          .toArray()
      )[0];

      if (
        !!aggregationInDB &&
        (updateAlways ||
          (new Date() - new Date(aggregationInDB.retrieved_at)) /
          (100 * 60 * 60 * 24) > 14) // TODO: confirm this works, seems odd
      ) {
        const object = await getUncachedAggregationFn(
          getUncachedAggregationParameters
        );
        const updated = await this.mongoDBAggregationsCacheTable.updateOne(
          { _id: aggregationInDB._id },
          {
            $set: {
              cacheQuery,
              object,
              retrieved_at: Date.now(),
            },
          }
        );
        return object;
      } else if (!!aggregationInDB) {
        console.log("in db", { cacheQuery });
        return aggregationInDB.object;
      } else {
        console.log("not in db", { cacheQuery });
        const object = await getUncachedAggregationFn(
          getUncachedAggregationParameters
        );
        const inserted = await this.mongoDBAggregationsCacheTable.insertOne({
          cacheQuery,
          object,
          retrieved_at: Date.now(),
        });
        return object;
      }
    };

    // TODO
    // 1-8 weeks
    makeFinancialRowsCache = async ({ }) => {
      // Yeah, not happening, unless worth waiting for like 3-5 weeks

      const { counts } = await this.getLastYearCounts({ query: {} });
      const paths = await this.getRows({});

      const categories = Object.entries(counts);
      console.log({ categories });

      const workingBatch = await Promise.all(
        categories.map(async ([k, v], i) => {

          const v_ = await v.map(async ({ _id, count }, i) => {
            const p = await paths.map(async (path, i) => {
              console.log({ k, _id, path });
              return path;
            });
            return p;
          });

          // console.log({ v_ });


          return { v_, k, v };
        }));



      // const hum = this.getAggregateForFinancialRows({
      //   query: {
      //     sector: "Communication Services",
      //     companiesForRow: "pl.Total Revenue"
      //   },
      //   companiesForRow,
      // });

      return { workingBatch, counts, paths };
    };

    // TODO
    // 1 day ?
    makeCalcRowsCache = async ({ }) => {
      const { counts } = await this.getLastYearCounts({ query: {} });
      // const paths = await this.getRows({});

      const ratioCollections = await this.getRatioCollections({});
      const categories = Object.entries(counts);
      console.log({ categories });

      const workingBatch = await Promise.all(
        categories.map(async ([k, v], i) => {

          const v_ = await v.map(async ({ _id, count }, i) => {
            const p = await ratioCollections.map(async (ratioCollection, i) => {
              console.log({ sector: k, _id, companiesForRow: ratioCollection.name, ratioCollectionId: ratioCollection.id, });

              const hum = await this.getAggregateForCalcRows({
                query: {
                  [k]: _id,
                },
                collectionId: ratioCollection.id,
                companiesForRow: ratioCollection.name
              });

              console.log({ hum });

              return hum;
            });
            return p;
          });



          // console.log({ v_ });


          return { v_, k, v };
        }));

      return { ratioCollections, workingBatch, counts };
    };

  },
};
