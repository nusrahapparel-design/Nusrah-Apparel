const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const startStr = "{/* 7. DETAILED POPUP DIALOG */}";
const endStr = "{/* 8. SHOPPING CART BOTTOM DRAWER */}";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find boundaries");
  process.exit(1);
}

const replacement = `      {/* 7. DETAILED POPUP DIALOG */}
      {selectedProduct && (
        <div
          id="product-modal-panel"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl relative animate-scale-up my-auto flex flex-col max-h-[90vh]">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 p-2 rounded-full z-20 cursor-pointer transition-colors shadow-sm"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex-1 overflow-y-auto p-0">
              <div className="flex flex-col md:flex-row">
                {/* Left Column Imagery */}
                <div className="w-full md:w-1/2 bg-slate-50 p-6 md:p-8 lg:p-10 flex flex-col items-center justify-center border-r border-slate-100 relative min-h-[300px]">
                  <img
                    src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full max-h-[400px] object-contain rounded-xl transition-all duration-300"
                  />
                  {selectedProduct.images.length > 1 && (
                    <div className="flex gap-2 justify-center items-center overflow-x-auto max-w-full py-4 mt-4">
                      {selectedProduct.images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={\`w-14 h-14 rounded-lg overflow-hidden border-2 cursor-pointer focus:outline-none transition-all \${
                            activeImageIndex === index
                              ? "border-emerald-600 scale-105"
                              : "border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100"
                          }\`}
                        >
                          <img
                            src={img}
                            alt={\`\${selectedProduct.name} \${index + 1}\`}
                            className="w-full h-full object-cover bg-white"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column Specifications */}
                <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-10 flex flex-col justify-start">
                  <div className="uppercase tracking-widest text-xs font-bold text-emerald-600 mb-2">
                    {selectedProduct.category} {selectedProduct.subCategory && \`• \${selectedProduct.subCategory}\`}
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
                    {lang === "bn" ? selectedProduct.bnName : selectedProduct.name}
                  </h1>

                  <div className="flex items-center space-x-1 mb-6">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={\`w-4 h-4 \${
                            Math.floor(selectedProduct.rating) >= star
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-200"
                          }\`}
                        />
                      ))}
                    </div>
                    <span className="text-slate-500 text-sm ml-2 font-medium">
                      ({selectedProduct.rating} - {selectedProduct.reviewCount} reviews)
                    </span>
                  </div>

                  <p className="text-slate-600 text-base mb-8 leading-relaxed">
                    {lang === "bn" ? selectedProduct.bnDescription : selectedProduct.description}
                  </p>

                  <div className="text-3xl font-black text-slate-900 mb-8 flex items-end gap-3">
                    {formatPrice(selectedProduct.price)}
                    {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                      <span className="text-slate-400 line-through text-lg font-bold mb-0.5">
                        {formatPrice(selectedProduct.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Options (Sizes & Colors) */}
                  <div className="space-y-6 mb-8">
                    {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase block mb-2">
                          Select Size
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {selectedProduct.sizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => setDetailSize(size)}
                              className={\`px-4 py-2 text-sm font-bold rounded-lg border transition-all cursor-pointer \${
                                detailSize === size
                                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 hover:border-slate-300 text-slate-700"
                              }\`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase block mb-2">
                          Select Color
                        </span>
                        <div className="flex flex-wrap gap-3">
                          {selectedProduct.colors.map((color) => (
                            <button
                              key={color.name}
                              onClick={() => setDetailColor(color)}
                              className={\`flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-lg border cursor-pointer transition-all \${
                                detailColor?.name === color.name
                                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm"
                                  : "border-slate-200 hover:border-slate-300 text-slate-700"
                              }\`}
                            >
                              <div className={\`w-4 h-4 rounded-full shadow-sm \${color.class}\`} />
                              <span>{color.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 h-14 overflow-hidden">
                      <button
                        onClick={() => setDetailQuantity((q) => Math.max(q - 1, 1))}
                        className="px-4 h-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer hover:bg-slate-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-extrabold text-slate-800 select-none">
                        {detailQuantity}
                      </span>
                      <button
                        onClick={() => setDetailQuantity((q) => Math.min(q + 1, selectedProduct.stock))}
                        className="px-4 h-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer hover:bg-slate-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 flex gap-3">
                      <button
                        disabled={selectedProduct.stock === 0}
                        onClick={() => {
                          handleAddToCart(selectedProduct, detailQuantity, detailSize, detailColor);
                          setSelectedProduct(null);
                        }}
                        className={\`flex-1 h-14 rounded-xl font-bold flex items-center justify-center transition-all \${
                          selectedProduct.stock === 0
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg"
                        }\`}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {selectedProduct.stock === 0 ? "Sold Out" : "Add to Cart"}
                      </button>
                      <button
                        disabled={selectedProduct.stock === 0}
                        onClick={() => {
                          handleAddToCart(selectedProduct, detailQuantity, detailSize, detailColor);
                          setSelectedProduct(null);
                          setIsCartOpen(false);
                          setCheckoutStep("shipping");
                        }}
                        className={\`flex-1 h-14 rounded-xl font-bold flex items-center justify-center transition-all \${
                          selectedProduct.stock === 0
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed hidden"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-lg"
                        }\`}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section at the bottom of the modal */}
              <div className="border-t border-slate-100 bg-white p-6 md:p-8 lg:p-10">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-3 text-emerald-500" /> Customer Reviews
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                  <div className="space-y-5">
                    {(!reviews[selectedProduct.id] || reviews[selectedProduct.id].length === 0) ? (
                      <p className="text-slate-500 italic bg-slate-50 p-6 rounded-xl border border-slate-100">
                        No reviews yet. Be the first to review!
                      </p>
                    ) : (
                      reviews[selectedProduct.id].map((review) => (
                        <div key={review.id} className="border-b border-slate-100 pb-5 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-slate-800 text-sm">{review.userName}</h4>
                            <span className="text-xs text-slate-400 font-medium">{review.date}</span>
                          </div>
                          <div className="flex items-center space-x-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={\`w-3 h-3 \${
                                  review.rating >= star
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-slate-200"
                                }\`}
                              />
                            ))}
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 h-fit">
                    <h3 className="font-bold text-base text-slate-800 mb-4">Write a Review</h3>
                    <form onSubmit={(e) => handleAddReviewSubmit(e, selectedProduct.id)} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newReviewAuthor}
                          onChange={(e) => setNewReviewAuthor(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                          Rating
                        </label>
                        <select
                          value={newReviewRating}
                          onChange={(e) => setNewReviewRating(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                        >
                          {[5, 4, 3, 2, 1].map((num) => (
                            <option key={num} value={num}>{num} Stars</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                          Your Comment
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none text-sm"
                          placeholder="What did you like or dislike?"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-colors text-sm"
                      >
                        Submit Review
                      </button>
                      {reviewSubmitMessage && (
                        <p className="text-xs text-emerald-600 font-bold mt-2 text-center">
                          {reviewSubmitMessage}
                        </p>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

`;

const newContent = content.slice(0, startIndex) + replacement + content.slice(endIndex);
fs.writeFileSync('src/App.tsx', newContent);
console.log("Successfully replaced modal");
