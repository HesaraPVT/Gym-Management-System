import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import api from '../../services/api';

const AddProduct = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      category: 'Supplements',
      quantity: 0,
    }
  });

  const photoFile = watch('photo');

  useEffect(() => {
    // Load suppliers for dropdown
    const fetchSuppliers = async () => {
      try {
        const res = await api.get('/suppliers');
        setSuppliers(res.data);
      } catch (error) {
        toast.error('Failed to load suppliers');
      }
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (photoFile && photoFile.length > 0) {
      const file = photoFile[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        setValue('photo', null); // clear
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPhotoPreview(null);
    }
  }, [photoFile, setValue]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('category', data.category);
      formData.append('price', data.price);
      formData.append('quantity', data.quantity);
      formData.append('reorderLevel', data.reorderLevel);
      
      if (data.expiryDate) {
        const selectedDate = new Date(data.expiryDate);
        if (selectedDate < new Date()) {
          toast.error('Expiry date cannot be in the past');
          return;
        }
        formData.append('expiryDate', data.expiryDate);
      }
      if (data.supplier) formData.append('supplier', data.supplier);
      if (data.description) formData.append('description', data.description);
      if (data.photo && data.photo.length > 0) {
        formData.append('photo', data.photo[0]);
      }

      await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Product added successfully');
      navigate('/inventory');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="page-header mb-6">
        <h1 className="page-title">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
        
        {/* Photo Upload Section */}
        <div className="form-group full-width mb-4">
          <label>Product Photo</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '8px', border: '1px dashed #cbd5e1',
              display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc',
              overflow: 'hidden'
            }}>
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Camera size={32} color="#94a3b8" />
              )}
            </div>
            <div>
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp"
                {...register('photo')}
                style={{ border: 'none', padding: 0 }}
              />
              <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>JPG, PNG or WEBP. Max 2MB.</p>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Product Name *</label>
          <input 
            type="text" 
            {...register('name', { 
              required: 'Name is required', 
              minLength: { value: 3, message: 'Minimum 3 characters' },
              maxLength: { value: 100, message: 'Maximum 100 characters' }
            })} 
          />
          {errors.name && <span className="error-text">{errors.name.message}</span>}
        </div>

        <div className="form-group">
          <label>Category *</label>
          <select {...register('category', { required: 'Category is required' })}>
            <option value="Supplements">Supplements</option>
            <option value="Equipment">Equipment</option>
            <option value="Accessories">Accessories</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && <span className="error-text">{errors.category.message}</span>}
        </div>

        <div className="form-group">
          <label>Price *</label>
          <input 
            type="number" step="0.01"
            {...register('price', { 
              required: 'Price is required',
              min: { value: 0.01, message: 'Price must be greater than 0' }
            })} 
          />
          {errors.price && <span className="error-text">{errors.price.message}</span>}
        </div>

        <div className="form-group">
          <label>Initial Quantity *</label>
          <input 
            type="number" 
            {...register('quantity', { 
              required: 'Quantity is required',
              min: { value: 0, message: 'Cannot be negative' }
            })} 
          />
          {errors.quantity && <span className="error-text">{errors.quantity.message}</span>}
        </div>

        <div className="form-group">
          <label>Reorder Level *</label>
          <input 
            type="number" 
            {...register('reorderLevel', { 
              required: 'Reorder level is required',
              min: { value: 1, message: 'Must be at least 1' }
            })} 
          />
          {errors.reorderLevel && <span className="error-text">{errors.reorderLevel.message}</span>}
        </div>

        <div className="form-group">
          <label>Expiry Date (Optional)</label>
          <input type="date" {...register('expiryDate')} />
        </div>

        <div className="form-group full-width">
          <label>Supplier (Optional)</label>
          <select {...register('supplier')}>
            <option value="">-- Select Supplier --</option>
            {suppliers.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group full-width">
          <label>Description (Optional)</label>
          <textarea rows="3" {...register('description')} />
        </div>

        <div className="form-group full-width mt-6" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/inventory')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
