import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingPhoto, setExistingPhoto] = useState(null);
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm();

  const photoFile = watch('photo');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supsRes, prodRes] = await Promise.all([
          api.get('/suppliers'),
          api.get(`/products/${id}`)
        ]);
        
        setSuppliers(supsRes.data);
        const p = prodRes.data;
        
        setExistingPhoto(p.photo);
        
        reset({
          name: p.name,
          category: p.category,
          price: p.price,
          quantity: p.quantity,
          reorderLevel: p.reorderLevel,
          expiryDate: p.expiryDate ? p.expiryDate.split('T')[0] : '', // format YYYY-MM-DD
          supplier: p.supplier?._id || p.supplier || '',
          description: p.description
        });
        
      } catch (error) {
        toast.error('Failed to load product data');
        navigate('/inventory');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, reset, navigate]);

  useEffect(() => {
    if (photoFile && photoFile.length > 0) {
      const file = photoFile[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        setValue('photo', null);
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreview(objectUrl);
      setIsPhotoRemoved(false);
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
        formData.append('expiryDate', data.expiryDate);
      }
      if (data.supplier) formData.append('supplier', data.supplier);
      if (data.description) formData.append('description', data.description);
      if (isPhotoRemoved) {
        formData.append('removePhoto', 'true');
      } else if (data.photo && data.photo.length > 0) {
        formData.append('photo', data.photo[0]);
      }

      await api.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Product updated successfully');
      navigate('/inventory');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="page-header mb-6">
        <h1 className="page-title">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
        
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
              ) : existingPhoto ? (
                <img src={`http://localhost:5000/uploads/${existingPhoto}`} alt="Existing" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Camera size={32} color="#94a3b8" />
              )}
            </div>
            <div>
              <input 
                id="photo-upload"
                type="file" 
                accept="image/jpeg, image/png, image/webp"
                {...register('photo')}
                style={{ border: 'none', padding: 0, marginBottom: '0.5rem' }}
              />
              {(existingPhoto || photoPreview) && (
                <button 
                  type="button" 
                  onClick={() => {
                    setPhotoPreview(null);
                    setExistingPhoto(null);
                    setIsPhotoRemoved(true);
                    setValue('photo', null);
                    const fileInput = document.getElementById('photo-upload');
                    if (fileInput) fileInput.value = '';
                  }}
                  style={{ display: 'block', margin: '0.25rem 0', color: '#ef4444', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                >
                  Remove Photo
                </button>
              )}
              <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Leave empty to keep existing photo. Max 2MB.
              </p>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Product Name *</label>
          <input 
            type="text" 
            {...register('name', { required: 'Name is required' })} 
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
        </div>

        <div className="form-group">
          <label>Price *</label>
          <input 
            type="number" step="0.01"
            {...register('price', { required: 'Price is required' })} 
          />
        </div>

        <div className="form-group">
          <label>Current Quantity *</label>
          <input 
            type="number" 
            {...register('quantity', { required: 'Quantity is required' })} 
          />
        </div>

        <div className="form-group">
          <label>Reorder Level *</label>
          <input 
            type="number" 
            {...register('reorderLevel', { required: 'Reorder level is required' })} 
          />
        </div>

        <div className="form-group">
          <label>Expiry Date</label>
          <input type="date" {...register('expiryDate')} />
        </div>

        <div className="form-group full-width">
          <label>Supplier</label>
          <select {...register('supplier')}>
            <option value="">-- Select Supplier --</option>
            {suppliers.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group full-width">
          <label>Description</label>
          <textarea rows="3" {...register('description')} />
        </div>

        <div className="form-group full-width mt-6" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/inventory')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Update Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
