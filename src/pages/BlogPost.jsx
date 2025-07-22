import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiClock, FiEdit, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('blogs_57293ab4c6')
          .select(`
            id,
            title,
            content,
            created_at,
            user_id,
            users_auth_87654321 (name, avatar_url)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setBlog(data);
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        const { error } = await supabase
          .from('blogs_57293ab4c6')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        navigate('/dashboard');
      } catch (err) {
        console.error('Error deleting blog:', err);
        alert('Failed to delete blog: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error || 'Blog post not found'}</p>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <SafeIcon icon={FiArrowLeft} className="mr-2" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = user?.id === blog.user_id;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <SafeIcon icon={FiArrowLeft} className="mr-1" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>
            
            <div className="flex items-center space-x-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2">
                  {blog.users_auth_87654321?.avatar_url ? (
                    <img 
                      src={blog.users_auth_87654321.avatar_url} 
                      alt={blog.users_auth_87654321?.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <SafeIcon icon={FiUser} className="text-gray-500" />
                  )}
                </div>
                <span>{blog.users_auth_87654321?.name || 'Anonymous'}</span>
              </div>
              
              <div className="flex items-center">
                <SafeIcon icon={FiClock} className="mr-1" />
                <span>{format(new Date(blog.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
            
            <div className="prose max-w-none">
              {blog.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700">
                  {paragraph}
                </p>
              ))}
            </div>
            
            {isAuthor && (
              <div className="mt-8 pt-6 border-t border-gray-200 flex space-x-4">
                <Link
                  to={`/edit-blog/${blog.id}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <SafeIcon icon={FiEdit} className="mr-2" />
                  Edit Post
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <SafeIcon icon={FiTrash2} className="mr-2" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;