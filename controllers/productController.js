const productModel = require("../models/product-model")
const categoryModel = require("../models/category-model")

const createProduct = async function (req, res) {
    try {

        let { name, price, discount, description, brand, stock, category, subCategory, size, color } = req.body;
        
        const image = req.files.map(file => file.buffer);

        if (!(name && price && description && brand && stock && category && subCategory && size && color && image.length > 0)) {
            req.flash("error", "All fields are required except discount");
            return res.redirect("/owners/createproducts");
        }

        let product = await productModel.create({
            image, 
            name,
            price,
            discount,
            description,
            brand,
            stock,
            category,
            subCategory,
            size: size.replace(/&/g, '-').split('-'),
            color: color.replace(/&/g, '-').split('-'),
        });
        
        req.flash("success", "Product created successfully");
        res.redirect("/owners/createproducts");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("An error occurred");
    }
};

const getProducts = async function (req, res) {
    let success = req.flash("success");
    let error = req.flash("error");
    try {
        let products = await productModel.find();
        res.render('products', { products, success, error, title: "Products" });
    } catch (error) {
        console.error("Error fetching products", error);
        res.redirect("/");
    }
} 

const getProductDetails = async function (req, res) {
    try {
        let product = await productModel.findById(req.params.id);
        res.render('product', { product, categories, title: product.name });
    } catch (error) {
        console.error("Error while getting product details", error);
        res.redirect("/");
    }
}

const updateProduct = async function (req, res) {
    try {
        let product = await productModel.findById(req.params.productId);

        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/admin/products');
        }

        let updates = { name, price, discount, description, brand, stock, category, subCategory } = req.body;

        Object.keys(updates).forEach(key => {
            if (product[key] !== updates[key]) {
                product[key] = updates[key];
            }
        });

        await product.save();

        req.flash('success', 'Product updated successfully');
        res.redirect('/owners/products');

    } catch (error) {
        console.error('Error updating product:', error.message);
        req.flash('error', 'Error updating product');
        res.redirect('/owners/products');
    }
}

const deleteProduct = async function (req, res) {
    try {
        const productId = req.params.id;
        const deletedProduct = await productModel.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        req.flash('success', 'Product deleted successfully');
        res.redirect('/owners/products');
    } catch (error) {
        req.flash('error', 'Error Deleting Product')
        console.log(error);
        res.redirect('/owners/products');
    }
}

const createCategory = async function (req, res) {
    let { name, subCategory } = req.body;
    
    try {      
        
        if (!name) {
            req.flash('error', 'Name is required');
            return res.redirect('/owners/createcategory');
        }

        let nameToBeFindInDB = await categoryModel.findOne({ name });

        if (nameToBeFindInDB) {
            req.flash('error', 'Category already exists');
            return res.redirect('/owners/createcategory');
        }

        let category = await categoryModel.create({
            name,
            subCategory: subCategory.replace(/&/g, '-').split('-'),
        });

        req.flash('success', 'Category created successfully');
        return res.redirect('/owners/createcategory');

    } catch (err) {
        console.log(err.message);
    }
}

const editCategory = async function (req, res) {
    try {
        let category = await categoryModel.findById(req.params.id);

        if (!category) {
            req.flash('error', 'Category not found');
            return res.redirect('/owners/createcategory');
        }

        let { name, subCategory, newSubCategory, index, deleteIndex } = req.body;

        if (Array.isArray(subCategory) && Array.isArray(index)) {
            for (let i = 0; i < index.length; i++) {
                let idx = parseInt(index[i]);
                if (subCategory[i] !== category.subCategory[idx]) {
                    category.subCategory[idx] = subCategory[i];
                }
            }
        }

        if (newSubCategory) {
            category.subCategory.push(newSubCategory);
        }

        if (deleteIndex !== undefined) {
            let idx = parseInt(deleteIndex);
            if (idx >= 0 && idx < category.subCategory.length) {
                category.subCategory.splice(idx, 1);
            }
        }

        category.name = name;

        await category.save();

        req.flash('success', 'Category updated successfully');
        res.redirect('/owners/createcategory');

    } catch (error) {
        console.log(error.message);
        req.flash('error', 'An error occurred while updating the category');
        res.redirect('/owners/createcategory');
    }
};

const deleteCategory = async function (req, res) {
    try {
        const deletedCategory = await categoryModel.findByIdAndDelete(req.params.id);

        if (!deletedCategory) {
            req.flash('error', 'Category not found');
            return res.redirect('/owners/createcategory');
        }

        req.flash('success', 'Category deleted successfully');
        res.redirect('/owners/createcategory');

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = { 
    createProduct,
    getProducts,
    getProductDetails,
    updateProduct,
    deleteProduct,
    createCategory,
    editCategory,
    deleteCategory,
}