'use client'
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import { useState, useMemo, useEffect } from "react";

const AllProducts = () => {
    const { products } = useAppContext();
    const [filters, setFilters] = useState({
        searchQuery: '',
        priceRange: [0, 1000],
        category: 'all',
        sortBy: 'latest'
    });
    
    const [showFilters, setShowFilters] = useState(false);

    // Get unique categories from products
    const categories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(products.map(product => product.category)));
        return ['all', ...uniqueCategories];
    }, [products]);

    // Get min and max price for range slider
    const priceLimits = useMemo(() => {
        if (products.length === 0) return [0, 1000];
        const prices = products.map(product => product.price);
        return [Math.min(...prices), Math.max(...prices)];
    }, [products]);

    // Update price range when products load
    useEffect(() => {
        if (products.length > 0) {
            setFilters(prev => ({
                ...prev,
                priceRange: priceLimits
            }));
        }
    }, [products, priceLimits]);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let filtered = products.filter(product => {
            // Search filter
            const matchesSearch = product.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                                 (product.description && product.description.toLowerCase().includes(filters.searchQuery.toLowerCase()));
            
            // Price filter
            const matchesPrice = product.price >= filters.priceRange[0] && 
                               product.price <= filters.priceRange[1];
            
            // Category filter
            const matchesCategory = filters.category === 'all' || product.category === filters.category;
            
            return matchesSearch && matchesPrice && matchesCategory;
        });

        // Sort products
        switch (filters.sortBy) {
            case 'latest':
                // If you have createdAt field, use it. Otherwise, keep original order.
                if (filtered[0]?.createdAt) {
                    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                }
                break;
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }

        return filtered;
    }, [products, filters]);

    // Handle filter changes
    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
    };

    const handlePriceRangeChange = (min, max) => {
        setFilters(prev => ({ ...prev, priceRange: [min, max] }));
    };

    const handleCategoryChange = (category) => {
        setFilters(prev => ({ ...prev, category }));
    };

    const handleSortChange = (sortBy) => {
        setFilters(prev => ({ ...prev, sortBy }));
    };

    const resetFilters = () => {
        setFilters({
            searchQuery: '',
            priceRange: priceLimits,
            category: 'all',
            sortBy: 'latest'
        });
    };

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
                
                {/* Page Title and Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full pt-12 gap-4">
                    <div className="flex flex-col items-start">
                        <p className="text-3xl font-semibold text-gray-800">
                            All <span className="text-[#54B1CE]">Products</span>
                        </p>
                        <div className="w-24 h-1 bg-[#54B1CE] rounded-full mt-1"></div>
                    </div>

                    {/* Mobile Filter Toggle */}
                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden bg-[#54B1CE] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <span>Filters</span>
                            <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <select
                                value={filters.sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#54B1CE] focus:border-transparent"
                            >
                                <option value="latest">Latest</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name">Name A-Z</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Products Grid */}
                <div className="flex flex-col lg:flex-row w-full gap-8 mt-8">
                    
                    {/* Filters Sidebar */}
                    <div className={`lg:w-80 bg-gray-50 rounded-lg p-6 h-fit lg:sticky lg:top-24 transition-all duration-300 ${
                        showFilters ? 'block' : 'hidden lg:block'
                    }`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                            <button
                                onClick={resetFilters}
                                className="text-sm text-[#54B1CE] hover:text-[#3a9cb8] transition-colors"
                            >
                                Reset All
                            </button>
                        </div>

                        {/* Search Filter */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <input
                                type="text"
                                value={filters.searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search products..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#54B1CE] focus:border-transparent"
                            />
                        </div>

                        {/* Price Range Filter */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                            </label>
                            <div className="space-y-2">
                                <input
                                    type="range"
                                    min={priceLimits[0]}
                                    max={priceLimits[1]}
                                    value={filters.priceRange[0]}
                                    onChange={(e) => handlePriceRangeChange(Number(e.target.value), filters.priceRange[1])}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <input
                                    type="range"
                                    min={priceLimits[0]}
                                    max={priceLimits[1]}
                                    value={filters.priceRange[1]}
                                    onChange={(e) => handlePriceRangeChange(filters.priceRange[0], Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 mt-1">
                                <span>${priceLimits[0]}</span>
                                <span>${priceLimits[1]}</span>
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {categories.map(category => (
                                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="category"
                                            value={category}
                                            checked={filters.category === category}
                                            onChange={(e) => handleCategoryChange(e.target.value)}
                                            className="text-[#54B1CE] focus:ring-[#54B1CE]"
                                        />
                                        <span className="text-sm text-gray-700 capitalize">
                                            {category === 'all' ? 'All Categories' : category}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Results Count */}
                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Showing {filteredProducts.length} of {products.length} products
                            </p>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="mt-4 text-lg font-medium text-gray-900">No products found</p>
                                <p className="mt-2 text-gray-600">Try adjusting your filters or search terms</p>
                                <button
                                    onClick={resetFilters}
                                    className="mt-4 bg-[#54B1CE] text-white px-6 py-2 rounded-lg hover:bg-[#3a9cb8] transition-colors"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {filteredProducts.map((product, index) => (
                                    <ProductCard key={index} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AllProducts;