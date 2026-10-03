import React, { useMemo, useState } from "react";

export default function TechNestAI({
  products = [],
  addToCart,
  getDiscountedPrice,
  setSelectedProduct,
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm TechNest AI 🤖. Tell me what you're looking for and I'll help you find a product.",
    },
  ]);

  const quickQuestions = [
    "I need a gaming laptop",
    "Best laptop for college",
    "Show me products under ₹50000",
    "I need a charger",
  ];

  const getPrice = (product) => {
    if (typeof getDiscountedPrice === "function") {
      return Number(getDiscountedPrice(product) || 0);
    }

    const price = Number(product?.price || 0);
    const discount = Number(product?.discount || 0);

    return Math.round(price - (price * discount) / 100);
  };

  const getProductText = (product) => {
    return [
      product?.name,
      product?.category,
      product?.subcategory,
      product?.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  };

  const findRecommendations = (query) => {
    const q = query.toLowerCase().trim();

    let budget = null;

    const budgetMatch = q.match(
      /(?:under|below|less than|within|max|upto|up to)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/
    );

    if (budgetMatch) {
      budget = Number(budgetMatch[1].replace(/,/g, ""));
    }

    const keywords = [];

    const keywordGroups = [
      {
        words: ["laptop", "notebook"],
        terms: ["laptop", "notebook"],
      },
      {
        words: ["gaming", "gamer", "gaming laptop"],
        terms: ["gaming", "rtx", "gtx", "tuf", "rog", "predator", "nitro"],
      },
      {
        words: ["phone", "mobile", "smartphone"],
        terms: ["phone", "mobile", "smartphone", "galaxy", "iphone", "redmi"],
      },
      {
        words: ["charger", "charging", "adapter"],
        terms: ["charger", "charging", "adapter", "usb-c", "usb c"],
      },
      {
        words: ["headphone", "headphones", "earphone", "earphones", "earbuds"],
        terms: ["headphone", "earphone", "earbuds", "audio"],
      },
      {
        words: ["keyboard"],
        terms: ["keyboard"],
      },
      {
        words: ["mouse"],
        terms: ["mouse"],
      },
      {
        words: ["monitor", "display", "screen"],
        terms: ["monitor", "display", "screen"],
      },
      {
        words: ["tablet"],
        terms: ["tablet", "ipad"],
      },
      {
        words: ["camera"],
        terms: ["camera", "dslr"],
      },
      {
        words: ["college", "student", "study", "studies"],
        terms: ["laptop", "tablet", "headphone", "keyboard"],
      },
      {
        words: ["office", "work", "working", "professional"],
        terms: ["laptop", "monitor", "keyboard", "mouse"],
      },
      {
        words: ["accessory", "accessories"],
        terms: [
          "charger",
          "cable",
          "keyboard",
          "mouse",
          "headphone",
          "earbuds",
        ],
      },
    ];

    keywordGroups.forEach((group) => {
      if (group.words.some((word) => q.includes(word))) {
        keywords.push(...group.terms);
      }
    });

    const scoredProducts = products
      .map((product) => {
        const text = getProductText(product);
        const name = String(product?.name || "").toLowerCase();
        const category = String(product?.category || "").toLowerCase();

        const price = getPrice(product);
        const stock = Number(product?.stock || 0);

        let score = 0;

        // Never recommend unavailable products when available alternatives exist.
        if (stock > 0) {
          score += 3;
        } else {
          score -= 20;
        }

        // Keyword matching.
        keywords.forEach((keyword) => {
          if (text.includes(keyword)) {
            score += 8;
          }

          if (name.includes(keyword)) {
            score += 5;
          }

          if (category.includes(keyword)) {
            score += 5;
          }
        });

        // Exact query word matching.
        q.split(/\s+/).forEach((word) => {
          if (word.length >= 3 && text.includes(word)) {
            score += 2;
          }
        });

        // Budget handling.
        if (budget !== null) {
          if (price <= budget) {
            score += 15;

            // Prefer products reasonably close to the budget.
            if (budget > 0) {
              const ratio = price / budget;

              if (ratio >= 0.75) {
                score += 4;
              }
            }
          } else {
            score -= 15;
          }
        }

        // Cheap/budget requests.
        if (
          q.includes("cheap") ||
          q.includes("budget") ||
          q.includes("affordable")
        ) {
          if (price <= 30000) {
            score += 8;
          } else if (price <= 50000) {
            score += 4;
          }
        }

        // Premium/high-end requests.
        if (
          q.includes("premium") ||
          q.includes("powerful") ||
          q.includes("high end") ||
          q.includes("best")
        ) {
          if (price >= 50000) {
            score += 4;
          }
        }

        return {
          product,
          score,
          price,
        };
      })
      .sort((a, b) => b.score - a.score);

    let results = scoredProducts.filter((item) => item.score > 0);

    if (budget !== null) {
      const withinBudget = results.filter(
        (item) => item.price <= budget && Number(item.product?.stock || 0) > 0
      );

      if (withinBudget.length > 0) {
        results = withinBudget;
      }
    }

    return results.slice(0, 3);
  };

  const createResponse = (query, recommendations) => {
    const q = query.toLowerCase();

    if (recommendations.length === 0) {
      if (q.includes("under") || q.includes("below") || q.includes("budget")) {
        return "I couldn't find an available product matching that budget. Try increasing the budget or asking for another category.";
      }

      return "I couldn't find a close match in the current TechNest products. Try asking for a laptop, phone, charger, headphones, accessories, or a specific budget.";
    }

    const first = recommendations[0].product;
    const firstPrice = getPrice(first);

    let intro = "I found some products that match your request:";

    if (q.includes("gaming")) {
      intro = "For gaming, these are the closest matches I found:";
    } else if (
      q.includes("college") ||
      q.includes("student") ||
      q.includes("study")
    ) {
      intro = "For college/study use, these products are worth considering:";
    } else if (q.includes("charger")) {
      intro = "Here are charger-related options from your TechNest products:";
    } else if (q.includes("cheap") || q.includes("budget")) {
      intro = "Here are some budget-friendly matches:";
    }

    return `${intro} My top match is ${first.name} at ₹${firstPrice.toLocaleString(
      "en-IN"
    )}.`;
  };

  const handleAsk = (question = input) => {
    const query = String(question || "").trim();

    if (!query) return;

    const recommendations = findRecommendations(query);
    const response = createResponse(query, recommendations);

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: query,
      },
      {
        role: "assistant",
        text: response,
        recommendations,
      },
    ]);

    setInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAsk();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        text: "Hi! I'm TechNest AI 🤖. Tell me what you're looking for and I'll help you find a product.",
      },
    ]);
  };

  return (
    <>
      {/* AI FLOATING BUTTON */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-6 right-6 z-[80] w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
        aria-label="Open TechNest AI"
      >
        {open ? (
          <span className="text-2xl font-bold">×</span>
        ) : (
          <div className="relative">
            <span className="text-2xl">🤖</span>
            <span className="absolute -top-1 -right-2 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
          </div>
        )}
      </button>

      {/* AI CHAT WINDOW */}
      {open && (
        <div className="fixed bottom-24 right-4 md:right-6 z-[79] w-[calc(100vw-2rem)] sm:w-[420px] max-h-[min(720px,calc(100vh-7rem))] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl">
                  🤖
                </div>

                <div>
                  <h3 className="font-bold text-lg">TechNest AI</h3>
                  <p className="text-xs text-white/80">
                    Smart Product Assistant
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={clearChat}
                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition"
              >
                Clear
              </button>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[280px] max-h-[470px] bg-slate-50">
            {messages.map((message, index) => (
              <div key={index}>
                <div
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-md"
                        : "bg-white text-slate-700 border border-slate-200 shadow-sm rounded-bl-md"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>

                {/* RECOMMENDED PRODUCTS */}
                {message.recommendations &&
                  message.recommendations.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {message.recommendations.map(
                        ({ product, price }, productIndex) => {
                          const stock = Number(product?.stock || 0);

                          return (
                            <div
                              key={`${product.id}-${productIndex}`}
                              className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm"
                            >
                              <div className="flex gap-3">
                                <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                                  {product?.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">
                                      🛍️
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-sm text-slate-800 line-clamp-2">
                                    {product.name}
                                  </h4>

                                  <p className="text-indigo-600 font-bold mt-1">
                                    ₹{price.toLocaleString("en-IN")}
                                  </p>

                                  {stock > 0 ? (
                                    <p className="text-xs text-green-600 mt-1">
                                      ✓ In stock
                                    </p>
                                  ) : (
                                    <p className="text-xs text-red-500 mt-1">
                                      Out of stock
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mt-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (typeof setSelectedProduct === "function") {
                                      setSelectedProduct(product);
                                    }
                                    setOpen(false);
                                  }}
                                  className="py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                                >
                                  View Details
                                </button>

                                <button
                                  type="button"
                                  disabled={stock <= 0}
                                  onClick={() => {
                                    if (typeof addToCart === "function") {
                                      addToCart(product);
                                    }
                                  }}
                                  className={`py-2 rounded-xl text-xs font-semibold transition ${
                                    stock > 0
                                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                  }`}
                                >
                                  {stock > 0 ? "Add to Cart" : "Unavailable"}
                                </button>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
              </div>
            ))}
          </div>

          {/* QUICK QUESTIONS */}
          <div className="px-4 pt-3 bg-white border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Try asking
            </p>

            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleAsk(question)}
                  className="whitespace-nowrap px-3 py-2 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-medium text-slate-600 transition"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* INPUT */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2 bg-slate-100 rounded-2xl p-1.5">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask TechNest AI..."
                className="flex-1 bg-transparent outline-none px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() => handleAsk()}
                disabled={!input.trim()}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition ${
                  input.trim()
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                ↑
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-400 mt-2">
              Smart recommendations based on TechNest products
            </p>
          </div>
        </div>
      )}
    </>
  );
}