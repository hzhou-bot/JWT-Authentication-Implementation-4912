import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLogOut, FiPlus, FiEdit, FiTrash2, FiClock } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlogs = async () => {
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    
    // Set up realtime subscription for new blogs
    const subscription = supabase
      .channel('blogs_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'blogs_57293ab4c6' }, 
        () => {
          fetchBlogs();
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleDeleteBlog = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const { error } = await supabase
          .from('blogs_57293ab4c6')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        // Update local state
        setBlogs(blogs.filter(blog => blog.id !== id));
      } catch (err) {
        console.error('Error deleting blog:', err);
        alert('Failed to delete blog: ' + err.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 p-2 rounded-full">
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user?.name} 
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <SafeIcon icon={FiUser} className="text-blue-600" />
                )}
              </div>
              <span className="font-medium text-gray-700">{user?.name || 'User'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md flex items-center space-x-1 transition duration-200"
            >
              <SafeIcon icon={FiLogOut} size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Your Blog Dashboard</h2>
          <Link
            to="/create-blog"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition duration-200"
          >
            <SafeIcon icon={FiPlus} size={18} />
            <span>Create New Post</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-2">No blog posts yet</h3>
            <p className="text-gray-600 mb-4">Create your first blog post to get started!</p>
            <Link
              to="/create-blog"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <SafeIcon icon={FiPlus} size={16} />
              <span>Create Post</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{blog.title}</h3>
                  <div className="text-gray-600 mb-4 line-clamp-3">
                    {truncateContent(blog.content)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <SafeIcon icon={FiClock} size={14} className="mr-1" />
                    <span>{format(new Date(blog.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {blog.users_auth_87654321?.avatar_url ? (
                          <img 
                            src={blog.users_auth_87654321.avatar_url} 
                            alt={blog.users_auth_87654321?.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <SafeIcon icon={FiUser} size={12} className="text-gray-500" />
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        {blog.users_auth_87654321?.name || 'Anonymous'}
                      </span>
                    </div>
                    
                    {blog.user_id === user?.id && (
                      <div className="flex space-x-2">
                        <Link
                          to={`/edit-blog/${blog.id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <SafeIcon icon={FiEdit} size={16} />
                        </Link>
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        >
                          <SafeIcon icon={FiTrash2} size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <Link
                  to={`/blog/${blog.id}`}
                  className="block bg-gray-50 py-3 text-center text-blue-600 hover:bg-gray-100 transition duration-200"
                >
                  Read More
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;