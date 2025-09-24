'use client'
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const AddProduct = () => {
  const { getToken } = useAppContext();

  const [files, setFiles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Brand, Category, Subcategory states
  const [brand, setBrand] = useState('Apple');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  
  // Custom inputs
  const [customBrand, setCustomBrand] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customSubcategory, setCustomSubcategory] = useState('');
  
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState(''); // New inventory field
  
  // Custom toggles
  const [useCustomBrand, setUseCustomBrand] = useState(false);
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [useCustomSubcategory, setUseCustomSubcategory] = useState(false);

  // Hierarchical data structure
  const productHierarchy = {
    'Apple': {
      'iPhone': ['iPhone 15', 'iPhone 14', 'iPhone 13', 'iPhone SE'],
      'iPad': ['iPad Pro', 'iPad Air', 'iPad Mini', 'iPad'],
      'MacBook': ['MacBook Pro', 'MacBook Air', 'MacBook'],
      'Apple Watch': ['Series 9', 'Series 8', 'SE', 'Ultra'],
      'AirPods': ['AirPods Pro', 'AirPods Max', 'AirPods'],
      'Accessories': ['Cases', 'Chargers', 'Cables', 'Adapters']
    },
    'Samsung': {
      'Galaxy Phone': ['Galaxy S24', 'Galaxy S23', 'Galaxy Z Fold', 'Galaxy Z Flip'],
      'Galaxy Tab': ['Tab S9', 'Tab S8', 'Tab A', 'Tab Active'],
      'Galaxy Watch': ['Watch 6', 'Watch 5', 'Watch 4', 'Watch FE'],
      'Galaxy Buds': ['Buds 2 Pro', 'Buds 2', 'Buds Live', 'Buds FE'],
      'Accessories': ['Cases', 'S-Pens', 'Chargers', 'Covers']
    },
    'OnePlus': {
      'Smartphone': ['OnePlus 12', 'OnePlus 11', 'OnePlus Nord', 'OnePlus CE'],
      'Earphone': ['Buds Pro', 'Buds Z', 'Buds', 'Wireless Bullets'],
      'Watch': ['Watch 2', 'Watch 1', 'Fitness Band'],
      'Tablet': ['Pad Go', 'Pad Pro'],
      'Accessories': ['Cases', 'Chargers', 'Cables', 'Docks']
    },
    'Google': {
      'Pixel Phone': ['Pixel 8', 'Pixel 7', 'Pixel 6', 'Pixel A'],
      'Pixel Watch': ['Watch 2', 'Watch 1'],
      'Pixel Buds': ['Buds Pro', 'Buds A', 'Buds'],
      'Nest': ['Nest Hub', 'Nest Mini', 'Nest Audio', 'Nest Cam'],
      'Accessories': ['Cases', 'Stands', 'Chargers']
    },
    'Xiaomi': {
      'Smartphone': ['Mi Series', 'Redmi Series', 'Poco Series'],
      'Tablets': ['Mi Pad', 'Redmi Pad'],
      'Smart Watch': ['Mi Band', 'Mi Watch'],
      'Earphones': ['Mi Earbuds', 'Redmi Earbuds'],
      'Accessories': ['Power Banks', 'Chargers', 'Cases']
    }
  };

  // Get categories for selected brand
  const getCategories = () => {
    if (useCustomBrand) return [];
    return productHierarchy[brand] ? Object.keys(productHierarchy[brand]) : [];
  };

  // Get subcategories for selected category
  const getSubcategories = () => {
    if (useCustomCategory || !brand || !category) return [];
    return productHierarchy[brand] && productHierarchy[brand][category] 
      ? productHierarchy[brand][category] 
      : [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!stockQuantity || parseInt(stockQuantity) < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    console.log("=== 🚀 STARTING PRODUCT SUBMISSION ===");
    console.log("📦 Form Values:");
    console.log("Name:", name);
    console.log("Description:", description);
    console.log("Brand:", useCustomBrand ? customBrand : brand);
    console.log("Category:", useCustomCategory ? customCategory : category);
    console.log("Subcategory:", useCustomSubcategory ? customSubcategory : subcategory);
    console.log("Price:", price);
    console.log("Offer Price:", offerPrice);
    console.log("Stock Quantity:", stockQuantity);
    console.log("Image files count:", files.filter(Boolean).length);
    console.log("Video files count:", videos.filter(Boolean).length);

    const formData = new FormData();

    // Append basic fields
    formData.append('name', name);
    formData.append('description', description);
    formData.append('brand', useCustomBrand ? customBrand : brand);
    formData.append('category', useCustomCategory ? customCategory : category);
    formData.append('price', price);
    formData.append('offerPrice', offerPrice);
    formData.append('stockQuantity', stockQuantity); // Add stock quantity

    // Append subcategory only if provided
    const finalSubcategory = useCustomSubcategory ? customSubcategory : subcategory;
    if (finalSubcategory && finalSubcategory.trim() !== '') {
      formData.append('subcategory', finalSubcategory);
      console.log("📋 Subcategory included:", finalSubcategory);
    } else {
      console.log("📋 Subcategory skipped (optional field)");
    }

    // Append images
    for (let i = 0; i < files.length; i++) {
      if (files[i]) {
        formData.append('images', files[i]);
        console.log("📸 Added image:", files[i].name, files[i].type, files[i].size);
      }
    }

    // Append videos
    for (let i = 0; i < videos.length; i++) {
      if (videos[i]) {
        formData.append('videos', videos[i]);
        console.log("🎥 Added video:", videos[i].name, videos[i].type, videos[i].size);
      }
    }

    // Debug: Check formData contents
    console.log("🔄 FormData entries:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key + ": ", value.name, value.type, value.size);
      } else {
        console.log(key + ": ", value);
      }
    }

    try {
      const token = await getToken();
      console.log("🔑 Token obtained, sending request to /api/product/add");

      const { data } = await axios.post('/api/product/add', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("✅ API Response:", data);

      if (data.success) {
        toast.success(data.message);
        console.log("🎉 Product added successfully!");
        
        // Reset form
        setFiles([]);
        setVideos([]);
        setName('');
        setDescription('');
        setBrand('Apple');
        setCategory('');
        setSubcategory('');
        setCustomBrand('');
        setCustomCategory('');
        setCustomSubcategory('');
        setPrice('');
        setOfferPrice('');
        setStockQuantity(''); // Reset stock quantity
        setUseCustomBrand(false);
        setUseCustomCategory(false);
        setUseCustomSubcategory(false);
      } else {
        console.error("❌ API Error:", data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("💥 Request Error:", error);
      console.error("💥 Error Response:", error.response?.data);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleImageUpload = (index, file) => {
    const updatedFiles = [...files];
    updatedFiles[index] = file;
    setFiles(updatedFiles);
    console.log(`🖼️ Image ${index} uploaded:`, file?.name);
  };

  const handleVideoUpload = (index, file) => {
    const updatedVideos = [...videos];
    updatedVideos[index] = file;
    setVideos(updatedVideos);
    console.log(`🎬 Video ${index} uploaded:`, file?.name);
  };

  const removeImage = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    console.log(`🗑️ Image ${index} removed`);
  };

  const removeVideo = (index) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    setVideos(updatedVideos);
    console.log(`🗑️ Video ${index} removed`);
  };

  // Reset category and subcategory when brand changes
  const handleBrandChange = (newBrand) => {
    setBrand(newBrand);
    setCategory('');
    setSubcategory('');
    console.log(`🏷️ Brand changed to: ${newBrand}`);
  };

  // Reset subcategory when category changes
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setSubcategory('');
    console.log(`📂 Category changed to: ${newCategory}`);
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-2xl">
        
        {/* Product Images */}
        <div>
          <p className="text-base font-medium">Product Images (Max 4)</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="relative">
                <label htmlFor={`image${index}`} className="cursor-pointer">
                  <input 
                    onChange={(e) => handleImageUpload(index, e.target.files[0])} 
                    type="file" 
                    id={`image${index}`} 
                    accept="image/*"
                    hidden 
                  />
                  <Image
                    className="max-w-24 h-24 object-cover border-2 border-dashed border-gray-300 rounded"
                    src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area}
                    alt=""
                    width={96}
                    height={96}
                  />
                </label>
                {files[index] && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Product Videos */}
        <div>
          <p className="text-base font-medium">Product Videos (Optional, Max 2)</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="relative">
                <label htmlFor={`video${index}`} className="cursor-pointer">
                  <input 
                    onChange={(e) => handleVideoUpload(index, e.target.files[0])} 
                    type="file" 
                    id={`video${index}`} 
                    accept="video/*"
                    hidden 
                  />
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-100">
                    {videos[index] ? (
                      <video className="w-full h-full object-cover rounded">
                        <source src={URL.createObjectURL(videos[index])} />
                      </video>
                    ) : (
                      <span className="text-gray-500 text-4xl">🎥</span>
                    )}
                  </div>
                </label>
                {videos[index] && (
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Product Name */}
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Product Name
          </label>
          <input
            id="product-name"
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        </div>

        {/* Product Description */}
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-description">
            Product Description
          </label>
          <textarea
            id="product-description"
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Type here"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
          ></textarea>
        </div>

        {/* Brand, Category, Subcategory Hierarchy */}
        <div className="flex items-center gap-5 flex-wrap">
          
          {/* Brand */}
          <div className="flex flex-col gap-1 w-48">
            <label className="text-base font-medium" htmlFor="brand">
              Brand <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                id="brand"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 flex-1"
                onChange={(e) => handleBrandChange(e.target.value)}
                value={brand}
                disabled={useCustomBrand}
                required
              >
                {Object.keys(productHierarchy).map((brandName) => (
                  <option key={brandName} value={brandName}>{brandName}</option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-sm">
                <input 
                  type="checkbox" 
                  checked={useCustomBrand}
                  onChange={(e) => {
                    setUseCustomBrand(e.target.checked);
                    setCategory('');
                    setSubcategory('');
                  }}
                />
                Custom
              </label>
            </div>
            {useCustomBrand && (
              <input
                type="text"
                placeholder="Enter custom brand"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 mt-2"
                onChange={(e) => setCustomBrand(e.target.value)}
                value={customBrand}
                required
              />
            )}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1 w-48">
            <label className="text-base font-medium" htmlFor="category">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                id="category"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 flex-1"
                onChange={(e) => handleCategoryChange(e.target.value)}
                value={category}
                disabled={useCustomCategory || useCustomBrand}
                required
              >
                <option value="">Select category</option>
                {getCategories().map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-sm">
                <input 
                  type="checkbox" 
                  checked={useCustomCategory}
                  onChange={(e) => {
                    setUseCustomCategory(e.target.checked);
                    setSubcategory('');
                  }}
                  disabled={useCustomBrand}
                />
                Custom
              </label>
            </div>
            {useCustomCategory && (
              <input
                type="text"
                placeholder="Enter custom category"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 mt-2"
                onChange={(e) => setCustomCategory(e.target.value)}
                value={customCategory}
                required
              />
            )}
          </div>

          {/* Subcategory */}
          <div className="flex flex-col gap-1 w-48">
            <label className="text-base font-medium" htmlFor="subcategory">
              Subcategory <span className="text-gray-500 text-sm">(Optional)</span>
            </label>
            <div className="flex gap-2">
              <select
                id="subcategory"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 flex-1"
                onChange={(e) => setSubcategory(e.target.value)}
                value={subcategory}
                disabled={useCustomSubcategory || useCustomCategory || !category}
              >
                <option value="">Select subcategory (optional)</option>
                {getSubcategories().map((subcat) => (
                  <option key={subcat} value={subcat}>{subcat}</option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-sm">
                <input 
                  type="checkbox" 
                  checked={useCustomSubcategory}
                  onChange={(e) => setUseCustomSubcategory(e.target.checked)}
                  disabled={useCustomBrand || useCustomCategory}
                />
                Custom
              </label>
            </div>
            {useCustomSubcategory && (
              <input
                type="text"
                placeholder="Enter custom subcategory (optional)"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 mt-2"
                onChange={(e) => setCustomSubcategory(e.target.value)}
                value={customSubcategory}
              />
            )}
          </div>
        </div>

        {/* Price, Offer Price, and Stock Quantity */}
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              Product Price <span className="text-red-500">*</span>
            </label>
            <input
              id="product-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              required
            />
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="offer-price">
              Offer Price <span className="text-red-500">*</span>
            </label>
            <input
              id="offer-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setOfferPrice(e.target.value)}
              value={offerPrice}
              required
            />
          </div>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="stock-quantity">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              id="stock-quantity"
              type="number"
              min="0"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
              required
            />
          </div>
        </div>

        <button type="submit" className="px-8 py-2.5 bg-orange-600 text-white font-medium rounded">
          ADD PRODUCT
        </button>
      </form>
    </div>
  );
};

export default AddProduct;