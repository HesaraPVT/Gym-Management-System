from fastapi import APIRouter, HTTPException, status, Depends
from database import get_db
from schemas import (
    SupplierCreate, SupplierUpdate, SupplierResponse,
    ProductCreate, ProductUpdate, ProductResponse,
    InvoiceCreate, InvoiceResponse,
    StockMovementCreate, StockMovementResponse
)
from auth import verify_token
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
import uuid

router = APIRouter(prefix="/api/inventory", tags=["inventory"])

# ==================== SUPPLIER ROUTES ====================

@router.post("/suppliers", response_model=SupplierResponse)
async def create_supplier(supplier: SupplierCreate, current_user: dict = Depends(verify_token)):
    """Create a new supplier"""
    db = get_db()
    suppliers_collection = db.inventory_suppliers
    
    supplier_doc = {
        "name": supplier.name,
        "email": supplier.email,
        "phone": supplier.phone,
        "address": supplier.address,
        "contact_person": supplier.contact_person,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "created_by": current_user["id"]
    }
    
    result = await suppliers_collection.insert_one(supplier_doc)
    supplier_doc["_id"] = str(result.inserted_id)
    
    return SupplierResponse(id=supplier_doc["_id"], **{k: v for k, v in supplier_doc.items() if k != "_id"})

@router.get("/suppliers", response_model=List[SupplierResponse])
async def get_suppliers(current_user: dict = Depends(verify_token)):
    """Get all active suppliers"""
    try:
        db = get_db()
        suppliers_collection = db.inventory_suppliers
        
        suppliers = await suppliers_collection.find({"is_active": True}).to_list(None)
        
        return [
            SupplierResponse(id=str(s["_id"]), **{k: v for k, v in s.items() if k != "_id"})
            for s in suppliers
        ]
    except Exception as e:
        print(f"❌ Error in get_suppliers: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching suppliers: {str(e)}")

@router.get("/suppliers/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(supplier_id: str, current_user: dict = Depends(verify_token)):
    """Get supplier by ID"""
    db = get_db()
    suppliers_collection = db.inventory_suppliers
    
    try:
        supplier = await suppliers_collection.find_one({"_id": ObjectId(supplier_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid supplier ID")
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    return SupplierResponse(id=str(supplier["_id"]), **{k: v for k, v in supplier.items() if k != "_id"})

@router.put("/suppliers/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(supplier_id: str, supplier: SupplierUpdate, current_user: dict = Depends(verify_token)):
    """Update supplier"""
    db = get_db()
    suppliers_collection = db.inventory_suppliers
    
    try:
        supplier_obj_id = ObjectId(supplier_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid supplier ID")
    
    update_data = {k: v for k, v in supplier.dict().items() if v is not None}
    
    result = await suppliers_collection.find_one_and_update(
        {"_id": supplier_obj_id},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    return SupplierResponse(id=str(result["_id"]), **{k: v for k, v in result.items() if k != "_id"})

@router.delete("/suppliers/{supplier_id}")
async def delete_supplier(supplier_id: str, current_user: dict = Depends(verify_token)):
    """Soft delete supplier"""
    db = get_db()
    suppliers_collection = db.inventory_suppliers
    
    try:
        supplier_obj_id = ObjectId(supplier_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid supplier ID")
    
    result = await suppliers_collection.find_one_and_update(
        {"_id": supplier_obj_id},
        {"$set": {"is_active": False}},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    return {"message": "Supplier deleted successfully"}


# ==================== PRODUCT ROUTES ====================

@router.post("/products", response_model=ProductResponse)
async def create_product(product: ProductCreate, current_user: dict = Depends(verify_token)):
    """Create a new product"""
    try:
        print(f"📦 [create_product] Starting product creation for: {product.name}")
        db = get_db()
        products_collection = db.inventory_products
        counters_collection = db.counters
        print(f"📦 [create_product] Database connected")
        
        # Get next product code
        counter = await counters_collection.find_one_and_update(
            {"_id": "product_code"},
            {"$inc": {"sequence_value": 1}},
            return_document=True,
            upsert=True
        )
        product_code = f"PROD-{str(counter['sequence_value']).zfill(4)}"
        print(f"📦 [create_product] Generated product code: {product_code}")
        
        # Create initial batch
        batch_id = str(uuid.uuid4())
        batches = [{
            "batch_id": batch_id,
            "quantity": product.initial_quantity,
            "cost_per_unit": product.unit_price,
            "expiry_date": None,
            "created_at": datetime.utcnow()
        }] if product.initial_quantity > 0 else []
        
        product_doc = {
            "product_code": product_code,
            "name": product.name,
            "description": product.description,
            "category": product.category,
            "unit_price": product.unit_price,
            "total_quantity": product.initial_quantity,
            "batches": batches,
            "reorder_level": product.reorder_level,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "created_by": current_user["id"]
        }
        print(f"📦 [create_product] Product doc prepared, inserting to database...")
        
        result = await products_collection.insert_one(product_doc)
        product_doc["_id"] = str(result.inserted_id)
        print(f"✅ [create_product] Product created successfully with ID: {result.inserted_id}")
        
        return ProductResponse(id=product_doc["_id"], **{k: v for k, v in product_doc.items() if k != "_id"})
    except Exception as e:
        print(f"❌ [create_product] Error creating product: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error creating product: {str(e)}")

@router.get("/products", response_model=List[ProductResponse])
async def get_products(current_user: dict = Depends(verify_token)):
    """Get all active products"""
    try:
        print(f"📦 [get_products] Starting request from user: {current_user}")
        db = get_db()
        print(f"📦 [get_products] Database connected")
        products_collection = db.inventory_products
        print(f"📦 [get_products] Collection obtained, querying...")
        
        products = await products_collection.find({"is_active": True}).to_list(None)
        print(f"📦 [get_products] Query complete, found {len(products)} products")
        
        return [
            ProductResponse(id=str(p["_id"]), **{k: v for k, v in p.items() if k != "_id"})
            for p in products
        ]
    except Exception as e:
        print(f"❌ Error in get_products: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching products: {str(e)}")

@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str, current_user: dict = Depends(verify_token)):
    """Get product by ID"""
    db = get_db()
    products_collection = db.inventory_products
    
    try:
        product = await products_collection.find_one({"_id": ObjectId(product_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return ProductResponse(id=str(product["_id"]), **{k: v for k, v in product.items() if k != "_id"})

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, product: ProductUpdate, current_user: dict = Depends(verify_token)):
    """Update product"""
    db = get_db()
    products_collection = db.inventory_products
    
    try:
        product_obj_id = ObjectId(product_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    update_data = {k: v for k, v in product.dict().items() if v is not None}
    
    result = await products_collection.find_one_and_update(
        {"_id": product_obj_id},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return ProductResponse(id=str(result["_id"]), **{k: v for k, v in result.items() if k != "_id"})

@router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(verify_token)):
    """Soft delete product"""
    db = get_db()
    products_collection = db.inventory_products
    
    try:
        product_obj_id = ObjectId(product_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    result = await products_collection.find_one_and_update(
        {"_id": product_obj_id},
        {"$set": {"is_active": False}},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}


# ==================== INVOICE ROUTES ====================

@router.post("/invoices", response_model=InvoiceResponse)
async def create_invoice(invoice: InvoiceCreate, current_user: dict = Depends(verify_token)):
    """Create a new invoice"""
    db = get_db()
    invoices_collection = db.inventory_invoices
    products_collection = db.inventory_products
    suppliers_collection = db.inventory_suppliers
    counters_collection = db.counters
    stock_movements_collection = db.inventory_stock_movements
    
    # Get next invoice number
    counter = await counters_collection.find_one_and_update(
        {"_id": "invoice_number"},
        {"$inc": {"sequence_value": 1}},
        return_document=True,
        upsert=True
    )
    invoice_number = f"INV-{str(counter['sequence_value']).zfill(5)}"
    
    # Get supplier info
    supplier = await suppliers_collection.find_one({"_id": ObjectId(invoice.supplier_id)})
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    total_amount = 0
    items_data = []
    
    # Process each item and update product stock
    for item in invoice.items:
        try:
            product = await products_collection.find_one({"_id": ObjectId(item.product_id)})
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
            
            # Create batch for this invoice item
            batch_id = str(uuid.uuid4())
            new_batch = {
                "batch_id": batch_id,
                "quantity": item.quantity,
                "cost_per_unit": item.unit_price,
                "expiry_date": None,
                "created_at": datetime.utcnow()
            }
            
            # Update product with new batch
            await products_collection.find_one_and_update(
                {"_id": ObjectId(item.product_id)},
                {
                    "$push": {"batches": new_batch},
                    "$inc": {"total_quantity": item.quantity}
                },
                return_document=True
            )
            
            # Record stock movement
            stock_movement = {
                "product_id": item.product_id,
                "movement_type": "in",
                "quantity": item.quantity,
                "reason": "Invoice purchase",
                "batch_id": batch_id,
                "reference_id": invoice_number,
                "created_at": datetime.utcnow(),
                "created_by": current_user["id"]
            }
            await stock_movements_collection.insert_one(stock_movement)
            
            item_total = item.quantity * item.unit_price
            total_amount += item_total
            
            items_data.append({
                "product_id": item.product_id,
                "product_code": product["product_code"],
                "product_name": product["name"],
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "total_price": item_total
            })
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing item: {str(e)}")
    
    # Create invoice
    invoice_doc = {
        "invoice_number": invoice_number,
        "supplier_id": invoice.supplier_id,
        "supplier_name": supplier["name"],
        "items": items_data,
        "total_amount": total_amount,
        "created_at": datetime.utcnow(),
        "created_by": current_user["id"],
        "notes": invoice.notes,
        "status": "completed"
    }
    
    result = await invoices_collection.insert_one(invoice_doc)
    invoice_doc["_id"] = str(result.inserted_id)
    
    return InvoiceResponse(id=invoice_doc["_id"], **{k: v for k, v in invoice_doc.items() if k != "_id"})

@router.get("/invoices", response_model=List[InvoiceResponse])
async def get_invoices(current_user: dict = Depends(verify_token)):
    """Get all invoices"""
    try:
        db = get_db()
        invoices_collection = db.inventory_invoices
        
        invoices = await invoices_collection.find({}).sort("created_at", -1).to_list(None)
        
        return [
            InvoiceResponse(id=str(inv["_id"]), **{k: v for k, v in inv.items() if k != "_id"})
            for inv in invoices
        ]
    except Exception as e:
        print(f"❌ Error in get_invoices: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching invoices: {str(e)}")

@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: str, current_user: dict = Depends(verify_token)):
    """Get invoice by ID"""
    db = get_db()
    invoices_collection = db.inventory_invoices
    
    try:
        invoice = await invoices_collection.find_one({"_id": ObjectId(invoice_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid invoice ID")
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    return InvoiceResponse(id=str(invoice["_id"]), **{k: v for k, v in invoice.items() if k != "_id"})


# ==================== STOCK MOVEMENT ROUTES ====================

@router.get("/stock-movements", response_model=List[StockMovementResponse])
async def get_stock_movements(product_id: Optional[str] = None, current_user: dict = Depends(verify_token)):
    """Get stock movements"""
    try:
        db = get_db()
        stock_movements_collection = db.inventory_stock_movements
        products_collection = db.inventory_products
        
        query = {}
        if product_id:
            try:
                query["product_id"] = product_id
            except:
                pass
        
        movements = await stock_movements_collection.find(query).sort("created_at", -1).to_list(None)
        
        results = []
        for movement in movements:
            product = await products_collection.find_one({"_id": ObjectId(movement["product_id"])})
            movement_response = {
                "id": str(movement["_id"]),
                "product_id": movement["product_id"],
                "product_code": product["product_code"] if product else "Unknown",
                "product_name": product["name"] if product else "Unknown",
                "movement_type": movement["movement_type"],
                "quantity": movement["quantity"],
                "reason": movement["reason"],
                "created_at": movement["created_at"],
                "created_by": movement.get("created_by")
            }
            results.append(StockMovementResponse(**movement_response))
        
        return results
    except Exception as e:
        print(f"❌ Error in get_stock_movements: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching stock movements: {str(e)}")


# ==================== DASHBOARD STATS ====================

@router.get("/stats")
async def get_inventory_stats(current_user: dict = Depends(verify_token)):
    """Get inventory dashboard statistics"""
    try:
        print(f"📊 [get_inventory_stats] Starting request from user: {current_user}")
        db = get_db()
        print(f"📊 [get_inventory_stats] Database connected")
        products_collection = db.inventory_products
        suppliers_collection = db.inventory_suppliers
        invoices_collection = db.inventory_invoices
        print(f"📊 [get_inventory_stats] Collections obtained, querying stats...")
        
        # Get stats
        total_products = await products_collection.count_documents({"is_active": True})
        print(f"📊 [get_inventory_stats] Products counted: {total_products}")
        
        total_suppliers = await suppliers_collection.count_documents({"is_active": True})
        print(f"📊 [get_inventory_stats] Suppliers counted: {total_suppliers}")
        
        total_invoices = await invoices_collection.count_documents({})
        print(f"📊 [get_inventory_stats] Invoices counted: {total_invoices}")
        
        # Get low stock products
        low_stock = await products_collection.find(
            {"is_active": True, "$expr": {"$lte": ["$total_quantity", "$reorder_level"]}}
        ).to_list(None)
        print(f"📊 [get_inventory_stats] Low stock found: {len(low_stock)}")
        
        # Get total inventory value
        products = await products_collection.find({"is_active": True}).to_list(None)
        total_value = sum(p.get("unit_price", 0) * p.get("total_quantity", 0) for p in products)
        print(f"📊 [get_inventory_stats] Inventory value calculated: {total_value}")
        
        result = {
            "total_products": total_products,
            "total_suppliers": total_suppliers,
            "total_invoices": total_invoices,
            "low_stock_count": len(low_stock),
            "total_inventory_value": total_value,
            "low_stock_products": [
                {
                    "id": str(p["_id"]),
                    "name": p["name"],
                    "product_code": p["product_code"],
                    "quantity": p["total_quantity"],
                    "reorder_level": p["reorder_level"]
                }
                for p in low_stock[:5]  # Top 5
            ]
        }
        print(f"📊 [get_inventory_stats] Request complete, returning stats")
        return result
    except Exception as e:
        print(f"❌ Error in get_inventory_stats: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching inventory stats: {str(e)}")
