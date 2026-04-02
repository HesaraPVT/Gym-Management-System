import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const EditSupplier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const res = await api.get(`/suppliers/${id}`);
        reset(res.data);
      } catch (error) {
        toast.error('Failed to load supplier');
        navigate('/suppliers');
      } finally {
        setLoading(false);
      }
    };
    fetchSupplier();
  }, [id, reset, navigate]);

  const onSubmit = async (data) => {
    try {
      await api.put(`/suppliers/${id}`, data);
      toast.success('Supplier updated successfully');
      navigate('/suppliers');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update supplier');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="page-header mb-6">
        <h1 className="page-title">Edit Supplier</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
        <div className="form-group full-width">
          <label>Company Name *</label>
          <input 
            type="text" 
            {...register('name', { 
              required: 'Company name is required',
              minLength: { value: 2, message: 'Minimum 2 characters' }
            })} 
          />
          {errors.name && <span className="error-text">{errors.name.message}</span>}
        </div>

        <div className="form-group">
          <label>Contact Person *</label>
          <input 
            type="text" 
            {...register('contactPerson', { required: 'Contact person is required' })} 
          />
          {errors.contactPerson && <span className="error-text">{errors.contactPerson.message}</span>}
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input 
            type="text" 
            {...register('phone', { 
              required: 'Phone number is required',
              pattern: { value: /^\d{10}$/, message: 'Must be exactly 10 digits' }
            })} 
          />
          {errors.phone && <span className="error-text">{errors.phone.message}</span>}
        </div>

        <div className="form-group full-width">
          <label>Email Address *</label>
          <input 
            type="email" 
            {...register('email', { 
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' }
            })} 
          />
          {errors.email && <span className="error-text">{errors.email.message}</span>}
        </div>

        <div className="form-group full-width">
          <label>Physical Address</label>
          <textarea rows="3" {...register('address')} />
        </div>

        <div className="form-group full-width mt-6" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/suppliers')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Update Supplier
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSupplier;
