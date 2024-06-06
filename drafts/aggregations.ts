const a = {
    $addFields: {
        companies: {
            $map: {
                input: { $range: ["$min", "$max", { $toInt: { $divide: [{ $size: "$companies" }, 10] } }] },
                as: "index",
                in: { $slice: ["$companies", "$$index", { $toInt: { $divide: [{ $size: "$companies" }, 10] } }] }
            }
        }
    }
}

const b = {
    companies: {
        $push: {
            company: "$name",
            code: "$code",
            EODExchange: "$EODExchange",
            v: "$yearlyFinancialsByYear.pl.Total Revenue.v"
        }
    }
}

const c = {
    $addFields: {
        ranges: {
            $range: [
                { $toInt: { $divide: ["$min", 1000000] } },
                { $toInt: { $divide: ["$max", 1000000] } },
                {
                    $toInt:
                    {
                        $divide: [
                            {
                                $subtract: [
                                    { $toInt: { $divide: ["$max", 1000000] } },
                                    { $toInt: { $divide: ["$min", 1000000] } }
                                ]
                            }, 100]
                    }
                }
            ]
        }
    }
};

const d = [
    {
        $group: {
            _id: {
                year: "$yearlyFinancialsByYear.year"
            },
            count: {
                $sum: 1
            },
            sum: {
                $sum: "$yearlyFinancialsByYear.pl.Total Revenue.v"
            },
            avg: {
                $avg: "$yearlyFinancialsByYear.pl.Total Revenue.v"
            },
            max: {
                $max: "$yearlyFinancialsByYear.pl.Total Revenue.v"
            },
            min: {
                $min: "$yearlyFinancialsByYear.pl.Total Revenue.v"
            },
            median: {
                $median: { input: "$yearlyFinancialsByYear.pl.Total Revenue.v", method: 'approximate' }
            },
            companies: {
                $push: {
                    company: "$name",
                    code: "$code",
                    EODExchange: "$EODExchange",
                    v: "$yearlyFinancialsByYear.pl.Total Revenue.v"
                }
            },
        }
    },
    {
        $sort: {
            "_id.year": -1
        }
    },
    {
        $addFields: {
            range: {
                $toInt:
                {
                    $divide: [
                        {
                            $subtract: [
                                { $toInt: { $divide: ["$max", 1000000] } },
                                { $toInt: { $divide: ["$min", 1000000] } }
                            ]
                        }, 20]
                }
            }
        }
    },
    {
        $addFields: {
            ranges: {
                $cond: {
                    if: { $gt: ["$range", 0] },
                    then: {
                        $range: [
                            { $toInt: { $divide: ["$min", 1000000] } },
                            { $toInt: { $divide: ["$max", 1000000] } },
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
            ranges_: {
                $map: {
                    input: "$ranges",
                    as: "index",
                    in: { $slice: ["$companies", "$$index", { $toInt: { $divide: [{ $size: "$companies" }, 10] } }] }
                }
            }
        }
    }
];

const e = [
    {
        "pl_Total Revenue": [
          {
            $project: {
              name: 1,
              code: 1,
              EODExchange: 1,
              "yearlyFinancialsByYear.year": 1,
              "yearlyFinancialsByYear.pl.Total Revenue.v":
                {
                  $toDecimal:
                    "$yearlyFinancialsByYear.pl.Total Revenue.v"
                }
            }
          },
          {
            $sort: {
              "yearlyFinancialsByYear.pl.Total Revenue.v":
                -1
            }
          },
          {
              $group: {
                  _id: {
                      year: "$yearlyFinancialsByYear.year"
                  },
                  count: {
                      $sum: 1
                  },
                  sum: {
                      $sum: "$yearlyFinancialsByYear.pl.Total Revenue.v"
                  },
                  avg: {
                      $avg: "$yearlyFinancialsByYear.pl.Total Revenue.v"
                  },
                  max: {
                      $max: "$yearlyFinancialsByYear.pl.Total Revenue.v"
                  },
                  min: {
                      $min: "$yearlyFinancialsByYear.pl.Total Revenue.v"
                  },
                  median: {
                      $median: { input: "$yearlyFinancialsByYear.pl.Total Revenue.v", method: 'approximate' }
                  },
                  companies: {
                      $push: {
                          company: "$name",
                          code: "$code",
                          EODExchange: "$EODExchange",
                          v: "$yearlyFinancialsByYear.pl.Total Revenue.v"
                      }
                  },
              }
          },
          {
              $sort: {
                  "_id.year": -1
              }
          },
          {
              $addFields: {
                  range: {
                      $toInt:
                      {
                          $divide: [
                              {
                                  $subtract: [
                                      { $toInt: { $divide: ["$max", 1000000] } },
                                      { $toInt: { $divide: ["$min", 1000000] } }
                                  ]
                              }, 20]
                      }
                  }
              }
          },
          {
            $addFields: {
                ranges: {
                    $cond: {
                        if: { $gt: ["$range", 0] },
                        then: {
                            $range: [
                                { $toInt: { $divide: ["$min", 1000000] } },
                                { $toInt: { $divide: ["$max", 1000000] } },
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
                ranges_: {
                    $map: {
                   input: "$ranges",
                   as: "r",
                   in: { min: { $multiply: ["$$r", 1000000] }, max: { $multiply: [{ $add: [ "$$r", "$range" ] }, 1000000] }  }
                 }
                }
            }
          },
          {
            $addFields: {
                distribution: {
                  $map: {
                   input: "$ranges_",
                   as: "r",
                   in: {
                       $filter: {
                           input: "$companies",
                           as: "c",
                           cond: { $and: [ { $gt: ["$$c.v", "$$r.min"]}, { $lt: ["$$c.v", "$$r.max"]} ] }
                        }
                   }
                 }
                }
            }
          },
        ]
      }
]